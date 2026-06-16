import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
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

  // RLS already scopes this to the owner; double-check before rendering.
  if (!clinic || clinic.owner_id !== user.id) {
    redirect("/login");
  }

  return <DashboardClient clinic={clinic} />;
}
