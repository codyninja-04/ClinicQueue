import { createClient } from "@/lib/supabase/server";
import { StatusTracker } from "@/components/patient/StatusTracker";

export const dynamic = "force-dynamic";

export default async function StatusPage({
  params,
}: {
  params: { ticketId: string };
}) {
  const supabase = createClient();

  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, clinic_id")
    .eq("id", params.ticketId)
    .maybeSingle();

  const { data: clinic } = ticket
    ? await supabase
        .from("clinics")
        .select("name, avg_consult_minutes")
        .eq("id", ticket.clinic_id)
        .maybeSingle()
    : { data: null };

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-md flex-1">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {!ticket || !clinic ? (
            <p className="text-center text-slate-500">
              We couldn&apos;t find that ticket. It may be from a previous day.
            </p>
          ) : (
            <StatusTracker
              ticketId={ticket.id}
              clinicId={ticket.clinic_id}
              clinicName={clinic.name}
              avgConsultMinutes={clinic.avg_consult_minutes}
            />
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Keep this page open — it updates on its own.
      </p>
    </main>
  );
}
