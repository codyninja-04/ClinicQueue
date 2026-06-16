import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendSMS,
  calledMessage,
  almostReadyMessage,
} from "@/lib/twilio";
import type { TicketStatus } from "@/types";
import type { Database } from "@/lib/supabase/types";

type TicketUpdate = Database["public"]["Tables"]["tickets"]["Update"];

const VALID: TicketStatus[] = [
  "waiting",
  "called",
  "serving",
  "done",
  "skipped",
  "left",
];

// PATCH /api/tickets/[ticketId] — staff updates a ticket's status.
// RLS guarantees only the clinic owner can write to their own tickets.
export async function PATCH(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  const body = await request.json().catch(() => null);
  const status: TicketStatus | undefined = body?.status;

  if (!status || !VALID.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Stamp the matching timestamp alongside the status change.
  const patch: TicketUpdate = { status };
  const now = new Date().toISOString();
  if (status === "called") patch.called_at = now;
  if (status === "serving") patch.served_at = now;
  if (status === "done") patch.done_at = now;

  const { data: ticket, error } = await supabase
    .from("tickets")
    .update(patch)
    .eq("id", params.ticketId)
    .select()
    .single();

  if (error || !ticket) {
    return NextResponse.json(
      { error: error?.message ?? "Ticket not found" },
      { status: 404 }
    );
  }

  const { data: clinic } = await supabase
    .from("clinics")
    .select("name")
    .eq("id", ticket.clinic_id)
    .single();

  const clinicName = clinic?.name ?? "the clinic";

  if (status === "called") {
    // SMS 3: it's their turn.
    void sendSMS(ticket.phone, calledMessage(ticket.patient_name, clinicName));
  }

  if (status === "serving") {
    // SMS 2: whoever is now two spots away (position 3 while one is serving)
    // gets the heads up to make their way back.
    const { data: heads } = await supabase
      .from("live_queue")
      .select("patient_name, phone")
      .eq("clinic_id", ticket.clinic_id)
      .eq("position_in_queue", 3)
      .maybeSingle();

    if (heads) {
      void sendSMS(
        heads.phone,
        almostReadyMessage(heads.patient_name, clinicName)
      );
    }
  }

  return NextResponse.json({ ticket });
}
