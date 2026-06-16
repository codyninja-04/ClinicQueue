import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Clinic } from "@/types";

// Loads a clinic and guarantees the current user owns it, redirecting to login
// otherwise. Returns the authed client too so callers can run owner-scoped RPCs.
export async function requireOwnedClinic(clinicId: string): Promise<{
  supabase: ReturnType<typeof createClient>;
  userId: string;
  clinic: Clinic;
}> {
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
    .eq("id", clinicId)
    .maybeSingle();

  if (!clinic || clinic.owner_id !== user.id) {
    redirect("/login");
  }

  return { supabase, userId: user.id, clinic };
}

// Today's date as a YYYY-MM-DD string, matching how queue_sessions are dated.
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
