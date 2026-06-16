import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendSMS } from "@/lib/twilio";

// POST /api/sms — manual SMS send, used by staff tooling. Guarded by auth so it
// can't be turned into an open SMS relay.
export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const to: string | undefined = body?.to;
  const message: string | undefined = body?.message;

  if (!to || !message) {
    return NextResponse.json(
      { error: "Both 'to' and 'message' are required" },
      { status: 400 }
    );
  }

  const ok = await sendSMS(to, message);
  return NextResponse.json({ ok });
}
