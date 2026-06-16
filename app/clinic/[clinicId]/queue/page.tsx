import { createClient } from "@/lib/supabase/server";
import { WaitingRoomScreen } from "@/components/display/WaitingRoomScreen";

export const dynamic = "force-dynamic";

export default async function QueueDisplayPage({
  params,
}: {
  params: { clinicId: string };
}) {
  const supabase = createClient();

  const { data: clinic } = await supabase
    .from("clinics")
    .select("id, name")
    .eq("id", params.clinicId)
    .maybeSingle();

  if (!clinic) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink text-white/60">
        Clinic not found.
      </main>
    );
  }

  return <WaitingRoomScreen clinicId={clinic.id} clinicName={clinic.name} />;
}
