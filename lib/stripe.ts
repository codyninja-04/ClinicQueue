import Stripe from "stripe";

// Stripe is optional. The app runs perfectly without it — billing simply shows
// as "not configured" until these env vars are set. This keeps local dev and
// the build green without any Stripe account.
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const billingEnabled = Boolean(
  process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID
);

// Statuses we treat as "the clinic has an active, paid plan".
export const ACTIVE_STATUSES = ["active", "trialing", "past_due"];
