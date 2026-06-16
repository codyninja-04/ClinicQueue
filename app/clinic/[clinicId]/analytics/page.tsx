import { requireOwnedClinic, todayISO } from "@/lib/clinic";
import { OwnerHeader } from "@/components/OwnerHeader";
import { BarChart } from "@/components/reports/BarChart";

export const dynamic = "force-dynamic";

const RANGE_DAYS = 14;

function hourLabel(hour: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}${hour < 12 ? "am" : "pm"}`;
}

function dayLabel(iso: string): string {
  // iso is YYYY-MM-DD
  return iso.slice(5).replace("-", "/");
}

export default async function AnalyticsPage({
  params,
}: {
  params: { clinicId: string };
}) {
  const { supabase, clinic } = await requireOwnedClinic(params.clinicId);

  const to = todayISO();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - (RANGE_DAYS - 1));
  const from = fromDate.toISOString().slice(0, 10);

  const [{ data: hourly }, { data: trend }] = await Promise.all([
    supabase.rpc("clinic_hourly_stats", {
      p_clinic_id: clinic.id,
      p_from: from,
      p_to: to,
    }),
    supabase.rpc("clinic_daily_trend", {
      p_clinic_id: clinic.id,
      p_from: from,
      p_to: to,
    }),
  ]);

  const peakValue = Math.max(0, ...(hourly ?? []).map((h) => h.joined));
  const hourBars = (hourly ?? []).map((h) => ({
    label: hourLabel(h.hour),
    value: h.joined,
    highlight: h.joined === peakValue && peakValue > 0,
  }));

  const trendBars = (trend ?? []).map((d) => ({
    label: dayLabel(d.day),
    value: d.avg_wait_minutes ?? 0,
    caption: `min · ${d.served} seen`,
  }));

  return (
    <main className="min-h-screen bg-slate-50">
      <OwnerHeader clinicId={clinic.id} clinicName={clinic.name} active="analytics" />

      <div className="mx-auto max-w-4xl space-y-6 px-6 py-6">
        <div>
          <h2 className="text-xl font-semibold text-ink">Analytics</h2>
          <p className="text-sm text-slate-400">
            Last {RANGE_DAYS} days · {from} to {to}
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-1 font-semibold text-ink">Peak hours</h3>
          <p className="mb-4 text-sm text-slate-400">
            When patients tend to join, by hour of day (Singapore time).
          </p>
          <BarChart
            bars={hourBars}
            emptyLabel="No visits in this range yet."
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-1 font-semibold text-ink">Wait time trend</h3>
          <p className="mb-4 text-sm text-slate-400">
            Average wait per day. Watch this climb on your busiest days.
          </p>
          <BarChart
            bars={trendBars}
            unit=""
            emptyLabel="No completed visits in this range yet."
          />
        </section>
      </div>
    </main>
  );
}
