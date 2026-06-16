"use client";

import { useState } from "react";
import type { LiveQueueRow, TicketStatus } from "@/types";
import { TicketBadge } from "@/components/ui/TicketBadge";

type Props = {
  ticket: LiveQueueRow;
  onChange: () => void;
};

const statusStyles: Record<string, string> = {
  waiting: "bg-slate-100 text-slate-600",
  called: "bg-amber-100 text-amber-700",
  serving: "bg-brand/10 text-brand-dark",
  done: "bg-emerald-100 text-emerald-700",
  skipped: "bg-rose-100 text-rose-700",
  left: "bg-rose-100 text-rose-700",
};

function joinedAgo(iso: string | null): string {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

export function TicketCard({ ticket, onChange }: Props) {
  const [busy, setBusy] = useState(false);

  async function setStatus(status: TicketStatus) {
    setBusy(true);
    await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    onChange();
  }

  const isActive = ticket.status === "waiting" || ticket.status === "called";

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <TicketBadge number={ticket.ticket_number} size="md" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-ink">{ticket.patient_name}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
              statusStyles[ticket.status] ?? "bg-slate-100 text-slate-600"
            }`}
          >
            {ticket.status}
          </span>
        </div>
        <p className="text-sm text-slate-400">
          {ticket.phone} · joined {joinedAgo(ticket.joined_at)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {ticket.status === "called" && (
          <button
            onClick={() => setStatus("serving")}
            disabled={busy}
            className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            Start
          </button>
        )}
        {ticket.status === "serving" && (
          <button
            onClick={() => setStatus("done")}
            disabled={busy}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            Done
          </button>
        )}
        {isActive && (
          <>
            <button
              onClick={() => setStatus("skipped")}
              disabled={busy}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Skip
            </button>
            <button
              onClick={() => setStatus("left")}
              disabled={busy}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Left
            </button>
          </>
        )}
      </div>
    </div>
  );
}
