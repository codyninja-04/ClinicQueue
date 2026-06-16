-- Phase 2/3 follow-up: daily summary + analytics reporting functions,
-- patient-facing branding, and Stripe subscription fields.
-- Safe to run after 001 on an existing database.

-- ── Branding + billing columns ────────────────────────────────────────────
alter table clinics
  add column if not exists brand_color          text not null default '#0d9488',
  add column if not exists welcome_message       text,
  add column if not exists logo_url              text,
  add column if not exists stripe_customer_id    text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status   text not null default 'trialing',
  add column if not exists plan                  text;

-- ── Reporting functions ───────────────────────────────────────────────────
-- All are security definer and gate on ownership via auth.uid(), so an owner
-- only ever sees aggregates for clinics they own. Hour-of-day is reported in
-- Singapore time, which is what a local clinic actually wants to read.

-- One-day summary: counts plus average wait and consult times.
create or replace function clinic_day_summary(p_clinic_id uuid, p_date date)
returns table (
  total_joined         integer,
  served               integer,
  no_shows             integer,
  still_active         integer,
  avg_wait_minutes     numeric,
  avg_consult_minutes  numeric,
  busiest_hour         integer
)
language sql
security definer
set search_path = public
as $$
  with day_tickets as (
    select t.*
    from tickets t
    join queue_sessions qs on qs.id = t.session_id
    where t.clinic_id = p_clinic_id
      and qs.date = p_date
      and exists (
        select 1 from clinics c
        where c.id = p_clinic_id and c.owner_id = auth.uid()
      )
  )
  select
    count(*)::int,
    count(*) filter (where status = 'done')::int,
    count(*) filter (where status in ('skipped', 'left'))::int,
    count(*) filter (where status in ('waiting', 'called', 'serving'))::int,
    round(
      avg(extract(epoch from (served_at - joined_at)) / 60.0)
        filter (where served_at is not null)::numeric,
      1
    ),
    round(
      avg(extract(epoch from (done_at - served_at)) / 60.0)
        filter (where done_at is not null and served_at is not null)::numeric,
      1
    ),
    (
      select extract(hour from (joined_at at time zone 'Asia/Singapore'))::int
      from day_tickets
      where joined_at is not null
      group by 1
      order by count(*) desc
      limit 1
    )
  from day_tickets;
$$;

-- Joins per hour-of-day across a date range, for the peak-hours chart.
create or replace function clinic_hourly_stats(
  p_clinic_id uuid,
  p_from date,
  p_to date
)
returns table (hour integer, joined integer)
language sql
security definer
set search_path = public
as $$
  select
    extract(hour from (t.joined_at at time zone 'Asia/Singapore'))::int as hour,
    count(*)::int as joined
  from tickets t
  join queue_sessions qs on qs.id = t.session_id
  where t.clinic_id = p_clinic_id
    and qs.date between p_from and p_to
    and t.joined_at is not null
    and exists (
      select 1 from clinics c
      where c.id = p_clinic_id and c.owner_id = auth.uid()
    )
  group by 1
  order by 1;
$$;

-- Per-day served count + average wait, for the wait-time trend chart.
create or replace function clinic_daily_trend(
  p_clinic_id uuid,
  p_from date,
  p_to date
)
returns table (day date, served integer, avg_wait_minutes numeric)
language sql
security definer
set search_path = public
as $$
  select
    qs.date as day,
    count(*) filter (where t.status = 'done')::int as served,
    round(
      avg(extract(epoch from (t.served_at - t.joined_at)) / 60.0)
        filter (where t.served_at is not null)::numeric,
      1
    ) as avg_wait_minutes
  from queue_sessions qs
  join tickets t on t.session_id = qs.id
  where qs.clinic_id = p_clinic_id
    and qs.date between p_from and p_to
    and exists (
      select 1 from clinics c
      where c.id = p_clinic_id and c.owner_id = auth.uid()
    )
  group by qs.date
  order by qs.date;
$$;

grant execute on function clinic_day_summary(uuid, date)          to authenticated;
grant execute on function clinic_hourly_stats(uuid, date, date)   to authenticated;
grant execute on function clinic_daily_trend(uuid, date, date)    to authenticated;
