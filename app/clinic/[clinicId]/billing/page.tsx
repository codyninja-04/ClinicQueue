import { requireOwnedClinic } from "@/lib/clinic";
import { OwnerHeader } from "@/components/OwnerHeader";
import { BillingActions } from "@/components/billing/BillingActions";
import { billingEnabled, ACTIVE_STATUSES } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  active: { label: "Active", tone: "bg-emerald-100 text-emerald-700" },
  trialing: { label: "On trial", tone: "bg-brand/10 text-brand-dark" },
  past_due: { label: "Payment due", tone: "bg-amber-100 text-amber-700" },
  canceled: { label: "Canceled", tone: "bg-rose-100 text-rose-700" },
  unpaid: { label: "Unpaid", tone: "bg-rose-100 text-rose-700" },
};

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: { clinicId: string };
  searchParams: { status?: string };
}) {
  const { clinic } = await requireOwnedClinic(params.clinicId);

  const status = clinic.subscription_status || "trialing";
  const badge =
    STATUS_LABELS[status] ?? { label: status, tone: "bg-slate-100 text-slate-600" };
  const isActive = ACTIVE_STATUSES.includes(status);

  return (
    <main className="min-h-screen bg-slate-50">
      <OwnerHeader clinicId={clinic.id} clinicName={clinic.name} active="billing" />

      <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
        <div>
          <h2 className="text-xl font-semibold text-ink">Billing</h2>
          <p className="text-sm text-slate-400">
            ClinicQueue is billed per clinic, per month.
          </p>
        </div>

        {searchParams.status === "success" && (
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            You&apos;re all set — thanks for subscribing. It may take a few seconds
            for the status below to update.
          </div>
        )}
        {searchParams.status === "cancel" && (
          <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
            Checkout canceled. No charge was made.
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Current status</p>
              <p className="mt-1 text-lg font-semibold text-ink">{clinic.name}</p>
              {clinic.plan && (
                <p className="text-sm text-slate-500">Plan: {clinic.plan}</p>
              )}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${badge.tone}`}
            >
              {badge.label}
            </span>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            {billingEnabled ? (
              <BillingActions
                clinicId={clinic.id}
                hasCustomer={Boolean(clinic.stripe_customer_id)}
                isActive={isActive && status !== "trialing"}
              />
            ) : (
              <p className="text-sm text-slate-500">
                Billing isn&apos;t configured on this deployment yet. Add your
                Stripe keys and a price ID to turn on subscriptions.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          <p className="font-medium text-ink">What&apos;s included</p>
          <ul className="mt-2 space-y-1">
            <li>· Unlimited patients and queue sessions</li>
            <li>· SMS updates at every step</li>
            <li>· Live dashboard, waiting-room screen, and analytics</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
