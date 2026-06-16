# ClinicQueue

A lightweight virtual queue for small walk-in clinics. Patients scan a QR code at the door, join with their name and phone number, and get SMS updates while they wait wherever they like. Staff manage the queue from a dead-simple dashboard.

No app download. No account creation. Just a QR code, a phone number, and an SMS when it's their turn.

Built with **Next.js 14**, **TypeScript**, **Supabase**, **Tailwind CSS**, and **Twilio**.

---

## What's in here

| Surface | Route | Who uses it |
| --- | --- | --- |
| Landing page | `/` | Clinic owners deciding to sign up |
| Magic-link login | `/login` | Clinic staff |
| Create clinic | `/clinic/new` | New owners |
| Clinics index | `/clinics` | Owners with one or more clinics |
| Staff dashboard | `/clinic/[clinicId]/dashboard` | Front desk, all day |
| Daily summary | `/clinic/[clinicId]/summary` | Owners, end of day |
| Analytics | `/clinic/[clinicId]/analytics` | Owners, peak hours + wait trends |
| Setup + QR code | `/clinic/[clinicId]/setup` | Owners, once |
| Billing | `/clinic/[clinicId]/billing` | Owners, subscription |
| Waiting-room TV | `/clinic/[clinicId]/queue` | A screen in the waiting area |
| Patient join form | `/join/[clinicId]` | Patients, from the QR |
| Patient status | `/status/[ticketId]` | Patients, while they wait |

---

## Getting started

```bash
npm install
cp .env.local.example .env.local
# Fill in Supabase and Twilio credentials
```

Run the database migrations in order: open the Supabase SQL editor and run
`supabase/migrations/001_initial_schema.sql` (tables, the `live_queue` view, the
atomic `join_queue` function, and all RLS policies), then
`supabase/migrations/002_summary_branding_billing.sql` (reporting functions plus
the branding and Stripe columns).

Then:

```bash
npm run dev
```

App runs on `http://localhost:3000`.

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

NEXT_PUBLIC_APP_URL=            # e.g. https://clinicqueue.vercel.app

# Optional — billing stays off until these are set
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
```

Billing is entirely optional. With no Stripe keys, the billing page shows a
"not configured" note and everything else runs normally. To enable it, point a
Stripe webhook at `/api/billing/webhook` for the `checkout.session.completed`
and `customer.subscription.*` events.

---

## How the core pieces fit together

- **Atomic ticket numbers.** Joining the queue goes through the `join_queue`
  Postgres function, which locks the day's session row before reading
  `max(ticket_number) + 1`. Two patients tapping "join" at the same millisecond
  can never collide.
- **Realtime everywhere.** The dashboard, the patient status page, and the TV
  screen all subscribe to `tickets` changes for the clinic and refetch the
  `live_queue` view on any change. Local state is never patched from the
  payload — we always refetch for consistency.
- **Three SMS triggers.** On join (your number + a tracking link), when you're
  two spots away, and when staff call your number. Sends are fire-and-forget: a
  Twilio failure is logged and never rolls back a ticket.
- **Daily reset for free.** Ticket numbers are scoped to a per-day session, so
  opening the queue each morning starts the count fresh. No manual reset.

---

## SMS notes

- Singapore mobile numbers (8 digits starting with 6, 8, or 9) are validated on
  the join form but stored exactly as typed.
- When sending, the number is prefixed with `+65` if it doesn't already carry a
  country code.

---

## Deployment

Push to GitHub, connect to Vercel, and add every environment variable in the
Vercel dashboard. No special build config. After the first deploy, run the smoke
test: create a clinic, generate the QR, scan it on your phone, join the queue,
and confirm the SMS arrives.

---

## Roadmap

- **Phase 1 — MVP:** magic-link auth, clinic creation, QR codes, patient join,
  join SMS, live dashboard with Call Next, realtime, called SMS. ✅
- **Phase 2 — operations:** almost-ready SMS, skip/left states, waiting-room TV
  screen, open/close controls, daily summary. ✅
- **Phase 3 — monetization:** multi-clinic accounts, Stripe billing, custom
  branding on the patient page, peak-hours + wait-time analytics. ✅
