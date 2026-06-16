import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, billingEnabled } from "@/lib/stripe";

// POST /api/billing/checkout — start a subscription checkout for a clinic.
export async function POST(request: Request) {
  if (!stripe || !billingEnabled) {
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
  if (!clinicId) {
    return NextResponse.json({ error: "Missing clinic_id" }, { status: 400 });
  }

  const { data: clinic } = await supabase
    .from("clinics")
    .select("id, name, owner_id, stripe_customer_id")
    .eq("id", clinicId)
    .maybeSingle();

  if (!clinic || clinic.owner_id !== user.id) {
    return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  // Reuse the clinic's Stripe customer, or create one on first checkout.
  let customerId = clinic.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: clinic.name,
      email: user.email ?? undefined,
      metadata: { clinic_id: clinic.id, owner_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("clinics")
      .update({ stripe_customer_id: customerId })
      .eq("id", clinic.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${origin}/clinic/${clinic.id}/billing?status=success`,
    cancel_url: `${origin}/clinic/${clinic.id}/billing?status=cancel`,
    metadata: { clinic_id: clinic.id },
    subscription_data: { metadata: { clinic_id: clinic.id } },
  });

  return NextResponse.json({ url: session.url });
}
