create extension if not exists "pgcrypto";

-- Clinics: one row per clinic customer
create table clinics (
  id                    uuid primary key default gen_random_uuid(),
  owner_id              uuid references auth.users(id) on delete cascade,
  name                  text not null,
  slug                  text unique not null,
  avg_consult_minutes   integer not null default 10,
  is_open               boolean not null default false,
  phone                 text,
  address               text,
  created_at            timestamptz default now()
);

-- Queue sessions: one per operating day
create table queue_sessions (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references clinics(id) on delete cascade,
  date          date not null default current_date,
  opened_at     timestamptz,
  closed_at     timestamptz,
  unique(clinic_id, date)
);

-- Tickets: one per patient visit
create table tickets (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references queue_sessions(id) on delete cascade,
  clinic_id       uuid not null references clinics(id),
  ticket_number   integer not null,
  patient_name    text not null,
  phone           text not null,
  status          text not null default 'waiting'
                  check (status in ('waiting', 'called', 'serving', 'done', 'skipped', 'left')),
  joined_at       timestamptz default now(),
  called_at       timestamptz,
  served_at       timestamptz,
  done_at         timestamptz,
  unique(session_id, ticket_number)
);

-- View: live queue for a clinic today
create or replace view live_queue as
select
  t.id,
  t.clinic_id,
  t.ticket_number,
  t.patient_name,
  t.phone,
  t.status,
  t.joined_at,
  t.called_at,
  row_number() over (
    partition by t.clinic_id
    order by t.ticket_number
  ) filter (where t.status = 'waiting') as position_in_queue
from tickets t
join queue_sessions qs on qs.id = t.session_id
where qs.date = current_date;

-- Atomically join the queue.
-- Locks the clinic's session row so two patients joining at the same
-- millisecond can never receive the same ticket number. Runs as the table
-- owner (security definer) so anonymous patients can join while the queue
-- logic stays on the server, exactly as required.
create or replace function join_queue(
  p_clinic_id   uuid,
  p_name        text,
  p_phone       text
)
returns tickets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_open    boolean;
  v_session_id uuid;
  v_next_no    integer;
  v_ticket     tickets;
begin
  select is_open into v_is_open from clinics where id = p_clinic_id;

  if v_is_open is null then
    raise exception 'clinic_not_found';
  end if;

  if v_is_open = false then
    raise exception 'queue_closed';
  end if;

  -- Find today's session, locking it for the duration of the transaction.
  select id into v_session_id
  from queue_sessions
  where clinic_id = p_clinic_id and date = current_date
  for update;

  if v_session_id is null then
    raise exception 'queue_closed';
  end if;

  select coalesce(max(ticket_number), 0) + 1 into v_next_no
  from tickets
  where session_id = v_session_id;

  insert into tickets (session_id, clinic_id, ticket_number, patient_name, phone)
  values (v_session_id, p_clinic_id, v_next_no, p_name, p_phone)
  returning * into v_ticket;

  return v_ticket;
end;
$$;

-- Open today's queue: create the session if needed and flip the clinic open.
create or replace function open_queue(p_clinic_id uuid)
returns queue_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session queue_sessions;
begin
  if not exists (
    select 1 from clinics where id = p_clinic_id and owner_id = auth.uid()
  ) then
    raise exception 'not_authorized';
  end if;

  insert into queue_sessions (clinic_id, date, opened_at)
  values (p_clinic_id, current_date, now())
  on conflict (clinic_id, date)
  do update set opened_at = coalesce(queue_sessions.opened_at, now()),
                closed_at = null
  returning * into v_session;

  update clinics set is_open = true where id = p_clinic_id;

  return v_session;
end;
$$;

-- Close today's queue.
create or replace function close_queue(p_clinic_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from clinics where id = p_clinic_id and owner_id = auth.uid()
  ) then
    raise exception 'not_authorized';
  end if;

  update clinics set is_open = false where id = p_clinic_id;

  update queue_sessions
  set closed_at = now()
  where clinic_id = p_clinic_id and date = current_date;
end;
$$;

-- RLS
alter table clinics          enable row level security;
alter table queue_sessions   enable row level security;
alter table tickets          enable row level security;

-- Clinic owners manage their own clinic
create policy "owner manages clinic"
  on clinics for all
  using (auth.uid() = owner_id);

-- Anyone can read clinic info (needed for patient join page)
create policy "public read clinic"
  on clinics for select using (true);

-- Only clinic owners manage queue sessions
create policy "owner manages sessions"
  on queue_sessions for all
  using (
    clinic_id in (
      select id from clinics where owner_id = auth.uid()
    )
  );

-- Anyone can read today's session (patient status page needs this)
create policy "public read sessions"
  on queue_sessions for select using (true);

-- Anyone can insert a ticket (patients joining the queue)
create policy "public insert ticket"
  on tickets for insert with check (true);

-- Anyone can read tickets (patient status page)
create policy "public read tickets"
  on tickets for select using (true);

-- Only clinic staff can update ticket status
create policy "owner updates tickets"
  on tickets for update
  using (
    clinic_id in (
      select id from clinics where owner_id = auth.uid()
    )
  );

-- Let anonymous patients call the atomic join function.
grant execute on function join_queue(uuid, text, text) to anon, authenticated;
grant execute on function open_queue(uuid)  to authenticated;
grant execute on function close_queue(uuid) to authenticated;
