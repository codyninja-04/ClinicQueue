import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { estimateWaitMinutes } from "@/lib/queue";
import { isValidSgPhone } from "@/lib/phone";
import { getStatusUrl } from "@/lib/qr";
import { sendSMS, joinedMessage } from "@/lib/twilio";

// POST /api/tickets — a patient joins the queue.
// Ticket numbers are assigned atomically inside the join_queue DB function so
// two simultaneous joins can never collide.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const clinicId: string | undefined = body?.clinic_id;
  const name: string | undefined = body?.name?.trim();
  const phone: string | undefined = body?.phone?.trim();

  if (!clinicId || !name || !phone) {
    return NextResponse.json(
      { error: "Name and phone number are required" },
      { status: 400 }
    );
  }

  if (!isValidSgPhone(phone)) {
    return NextResponse.json(
      { error: "Please enter a valid Singapore mobile number" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  const { data: ticket, error } = await supabase.rpc("join_queue", {
    p_clinic_id: clinicId,
    p_name: name,
    p_phone: phone,
  });

  if (error || !ticket) {
    const message = error?.message ?? "";
    if (message.includes("queue_closed")) {
      return NextResponse.json({ error: "queue_closed" }, { status: 409 });
    }
    if (message.includes("clinic_not_found")) {
      return NextResponse.json({ error: "clinic_not_found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Could not join the queue. Please try again." },
      { status: 500 }
    );
  }

  // Look up this patient's live position and the clinic's pacing for the SMS.
  const [{ data: clinic }, { data: queueRow }] = await Promise.all([
    supabase
      .from("clinics")
      .select("name, avg_consult_minutes")
      .eq("id", clinicId)
      .single(),
    supabase
      .from("live_queue")
      .select("position_in_queue")
      .eq("id", ticket.id)
      .maybeSingle(),
  ]);

  const position = queueRow?.position_in_queue ?? 1;
  const waitMins = estimateWaitMinutes(
    position,
    clinic?.avg_consult_minutes ?? 10
  );

  // Fire and forget. A failed SMS must never undo a successful join.
  void sendSMS(
    phone,
    joinedMessage(name, ticket.ticket_number, waitMins, getStatusUrl(ticket.id))
  );

  return NextResponse.json(
    {
      ticket,
      position,
      wait_minutes: waitMins,
    },
    { status: 201 }
  );
}
