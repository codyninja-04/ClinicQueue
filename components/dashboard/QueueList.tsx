"use client";

import type { LiveQueueRow } from "@/types";
import { TicketCard } from "./TicketCard";
import { EmptyQueue } from "@/components/ui/EmptyQueue";

type Props = {
  tickets: LiveQueueRow[];
  onChange: () => void;
};

const ACTIVE_ORDER: Record<string, number> = {
  serving: 0,
  called: 1,
  waiting: 2,
};

export function QueueList({ tickets, onChange }: Props) {
  const active = tickets
    .filter((t) => ["serving", "called", "waiting"].includes(t.status))
    .sort((a, b) => {
      const byStatus =
        (ACTIVE_ORDER[a.status] ?? 9) - (ACTIVE_ORDER[b.status] ?? 9);
      return byStatus !== 0 ? byStatus : a.ticket_number - b.ticket_number;
    });

  const closed = tickets
    .filter((t) => ["done", "skipped", "left"].includes(t.status))
    .sort((a, b) => b.ticket_number - a.ticket_number);

  if (active.length === 0 && closed.length === 0) {
    return <EmptyQueue />;
  }

  return (
    <div className="space-y-6">
      {active.length > 0 ? (
        <div className="space-y-2">
          {active.map((t) => (
            <TicketCard key={t.id} ticket={t} onChange={onChange} />
          ))}
        </div>
      ) : (
        <EmptyQueue />
      )}

      {closed.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Earlier today
          </p>
          <div className="space-y-2 opacity-70">
            {closed.map((t) => (
              <TicketCard key={t.id} ticket={t} onChange={onChange} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
