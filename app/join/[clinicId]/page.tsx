import { createClient } from "@/lib/supabase/server";
import { JoinForm } from "@/components/patient/JoinForm";

export const dynamic = "force-dynamic";

export default async function JoinPage({
  params,
}: {
  params: { clinicId: string };
}) {
  const supabase = createClient();

  const { data: clinic } = await supabase
    .from("clinics")
    .select("id, name, is_open, brand_color, welcome_message")
    .eq("id", params.clinicId)
    .maybeSingle();

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-md flex-1">
        {!clinic ? (
          <ClosedState
            title="Clinic not found"
            body="This QR code doesn't point to a clinic we know. Please check with the front desk."
          />
        ) : !clinic.is_open ? (
          <ClosedState
            title={`${clinic.name} isn't open yet`}
            body="The queue is not open right now. Please check back when the clinic opens its doors."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div
              className="h-1.5 w-full"
              style={{ backgroundColor: clinic.brand_color || "#0d9488" }}
            />
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-slate-400">Join the queue at</p>
                <h1 className="text-2xl font-semibold text-ink">{clinic.name}</h1>
                {clinic.welcome_message && (
                  <p className="mt-2 text-sm text-slate-500">
                    {clinic.welcome_message}
                  </p>
                )}
              </div>
              <JoinForm
                clinicId={clinic.id}
                clinicName={clinic.name}
                brandColor={clinic.brand_color || undefined}
              />
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Powered by ClinicQueue
      </p>
    </main>
  );
}

function ClosedState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl">
        🕒
      </div>
      <h1 className="text-xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">{body}</p>
    </div>
  );
}
