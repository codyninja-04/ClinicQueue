import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/queue/[clinicId] — full live queue state for today.
export async function GET(
  _request: Request,
  { params }: { params: { clinicId: string } }
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("live_queue")
    .select("*")
    .eq("clinic_id", params.clinicId)
    .order("ticket_number", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ queue: data ?? [] });
}
