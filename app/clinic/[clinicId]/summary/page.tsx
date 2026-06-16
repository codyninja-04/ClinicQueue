import { requireOwnedClinic, todayISO } from "@/lib/clinic";
import { OwnerHeader } from "@/components/OwnerHeader";

export const dynamic = "force-dynamic";

function fmtMinutes(value: number | null): string {
  if (value === null) return "—";
  return `${value} min`;
}

function fmtHour(hour: number | null): string {
  if (hour === null) return "—";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? "am" : "pm";
  return `${h12}${ampm}`;
}

export default async function SummaryPage({
  params,
  searchParams,
}: {
  params: { clinicId: string };
  searchParams: { date?: string };
}) {
  const { supabase, clinic } = await requireOwnedClinic(params.clinicId);
  const date = searchParams.date ?? todayISO();
  const isToday = date === todayISO();

  const { data } = await supabase.rpc("clinic_day_summary", {
    p_clinic_id: clinic.id,
    p_date: date,
  });

  const s = data?.[0] ?? {
    total_joined: 0,
    served: 0,
    no_shows: 0,
    still_active: 0,
    avg_wait_minutes: null,
    avg_consult_minutes: null,
    busiest_hour: null,
  };

  const cards = [
    { label: "Patients seen", value: String(s.served), tone: "text-emerald-600" },
    { label: "Joined the queue", value: String(s.total_joined), tone: "text-ink" },
    { label: "Average wait", value: fmtMinutes(s.avg_wait_minutes), tone: "text-ink" },
    { label: "Average consult", value: fmtMinutes(s.avg_consult_minutes), tone: "text-ink" },
    { label: "No-shows", value: String(s.no_shows), tone: "text-rose-600" },
    { label: "Still in queue", value: String(s.still_active), tone: "text-ink" },
    { label: "Busiest hour", value: fmtHour(s.busiest_hour), tone: "text-ink" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <OwnerHeader clinicId={clinic.id} clinicName={clinic.name} active="summary" />

      <div className="mx-auto max-w-4xl space-y-6 px-6 py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink">
              {isToday ? "Today so far" : "Day summary"}
            </h2>
            <p className="text-sm text-slate-400">{date}</p>
          </div>
          <form className="flex items-center gap-2" action="">
            <input
              type="date"
              name="date"
              defaultValue={date}
              max={todayISO()}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
            <button
              type="submit"
              className="rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white transition hover:bg-ink-soft"
            >
              View
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-slate-200 bg-white px-4 py-4"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {c.label}
              </p>
              <p className={`mt-1 text-2xl font-semibold ${c.tone}`}>{c.value}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-slate-400">
          Wait time is measured from the moment a patient joins to when they&apos;re
          called in. Consult time runs from called-in to done.
        </p>
      </div>
    </main>
  );
}
