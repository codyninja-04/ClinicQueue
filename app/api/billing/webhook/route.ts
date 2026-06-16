import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";

// Stripe needs the raw, unparsed body to verify the signature.
export const dynamic = "force-dynamic";

async function syncSubscription(sub: Stripe.Subscription) {
  const supabase = createServiceClient();
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const price = sub.items.data[0]?.price;
  const plan = price?.nickname ?? price?.id ?? null;

  await supabase
    .from("clinics")
    .update({
      stripe_subscription_id: sub.id,
      subscription_status: sub.status,
      plan,
    })
    .eq("stripe_customer_id", customerId);
}

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ received: true });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!secret || !signature) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 400 }
    );
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error("[stripe] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await syncSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe] failed to process event", event.type, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
