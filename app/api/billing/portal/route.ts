import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

// POST /api/billing/portal — open the Stripe customer portal to manage or
// cancel a subscription.
export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Billing is not configured on this deployment." },
      { status: 503 }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const clinicId: string | undefined = body?.clinic_id;

  const { data: clinic } = await supabase
    .from("clinics")
    .select("id, owner_id, stripe_customer_id")
    .eq("id", clinicId ?? "")
    .maybeSingle();

  if (!clinic || clinic.owner_id !== user.id) {
    return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
  }

  if (!clinic.stripe_customer_id) {
    return NextResponse.json(
      { error: "No subscription to manage yet." },
      { status: 400 }
    );
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  const session = await stripe.billingPortal.sessions.create({
    customer: clinic.stripe_customer_id,
    return_url: `${origin}/clinic/${clinic.id}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
