"use client";

import { useState } from "react";

type Props = {
  clinicId: string;
  hasCustomer: boolean;
  isActive: boolean;
};

export function BillingActions({ clinicId, hasCustomer, isActive }: Props) {
  const [loading, setLoading] = useState<"checkout" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function go(kind: "checkout" | "portal") {
    setLoading(kind);
    setError(null);
    try {
      const res = await fetch(`/api/billing/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic_id: clinicId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Couldn't reach Stripe. Please try again.");
        setLoading(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {!isActive && (
          <button
            onClick={() => go("checkout")}
            disabled={loading !== null}
            className="rounded-lg bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            {loading === "checkout" ? "Opening…" : "Subscribe"}
          </button>
        )}
        {hasCustomer && (
          <button
            onClick={() => go("portal")}
            disabled={loading !== null}
            className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {loading === "portal" ? "Opening…" : "Manage subscription"}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
