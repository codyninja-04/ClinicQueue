import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getJoinUrl } from "@/lib/qr";
import { QRCodeDisplay } from "@/components/setup/QRCodeDisplay";
import { ClinicSettings } from "@/components/setup/ClinicSettings";

export const dynamic = "force-dynamic";

export default async function SetupPage({
  params,
}: {
  params: { clinicId: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: clinic } = await supabase
    .from("clinics")
    .select("*")
    .eq("id", params.clinicId)
    .maybeSingle();

  if (!clinic || clinic.owner_id !== user.id) {
    redirect("/login");
  }

  const joinUrl = getJoinUrl(clinic.id);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold text-ink">Set up · {clinic.name}</h1>
          <Link
            href={`/clinic/${clinic.id}/dashboard`}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:text-ink"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-6 py-6">
        <QRCodeDisplay joinUrl={joinUrl} clinicName={clinic.name} />
        <div className="no-print">
          <ClinicSettings clinic={clinic} />
        </div>
      </div>
    </main>
  );
}
