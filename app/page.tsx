import Link from "next/link";

const steps = [
  {
    title: "Scan at the door",
    body: "Patients scan one QR code and type their name and number. No app, no account.",
  },
  {
    title: "Wait anywhere",
    body: "They grab a coffee or run an errand while a live page tracks their spot in real time.",
  },
  {
    title: "Get the nudge",
    body: "An SMS lands when they're two spots away, and again when it's their turn.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-semibold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
            Q
          </span>
          ClinicQueue
        </div>
        <Link
          href="/login"
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-ink"
        >
          Clinic sign in
        </Link>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-16 pt-12 text-center sm:pt-20">
        <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-sm font-medium text-brand-dark">
          For walk-in clinics
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Empty your waiting room,
          <br />
          not your patience.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-500">
          Patients scan a QR code at the door, join the queue, and wait wherever
          they like. They get an SMS when it&apos;s nearly their turn. You tap one
          button to call the next person. That&apos;s the whole thing.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="w-full rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark sm:w-auto"
          >
            Set up your clinic
          </Link>
          <span className="text-sm text-slate-400">Live in an afternoon.</span>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-5xl gap-6 px-6 py-14 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-2xl bg-white p-6 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 font-semibold text-brand-dark">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-6 py-10 text-center text-sm text-slate-400">
        Built for small clinics in Singapore. No more pen-and-paper queues.
      </footer>
    </main>
  );
}
