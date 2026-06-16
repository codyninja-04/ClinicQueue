"use client";

import { useState } from "react";
import type { LiveQueueRow } from "@/types";

type Props = {
  next: LiveQueueRow | undefined;
  onCalled: () => void;
};

// The single most-used control in the building. One tap moves the next waiting
// patient to "called" and fires their SMS (handled server-side).
export function CallNextButton({ next, onCalled }: Props) {
  const [loading, setLoading] = useState(false);

  async function callNext() {
    if (!next) return;
    setLoading(true);

    await fetch(`/api/tickets/${next.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "called" }),
    });

    setLoading(false);
    onCalled();
  }

  return (
    <button
      onClick={callNext}
      disabled={!next || loading}
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand px-6 py-5 text-xl font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? (
        "Calling…"
      ) : next ? (
        <>
          Call next
          <span className="rounded-lg bg-white/20 px-2.5 py-1 text-base tabular-nums">
            #{next.ticket_number}
          </span>
        </>
      ) : (
        "No one waiting"
      )}
    </button>
  );
}
