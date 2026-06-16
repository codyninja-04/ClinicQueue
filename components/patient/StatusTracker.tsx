"use client";

import { useTicketStatus } from "@/hooks/useTicketStatus";
import { estimateWaitMinutes } from "@/lib/queue";
import { TicketBadge } from "@/components/ui/TicketBadge";
import { WaitTimeBadge } from "@/components/ui/WaitTimeBadge";

type Props = {
  ticketId: string;
  clinicId: string;
  clinicName: string;
  avgConsultMinutes: number;
};

export function StatusTracker({
  ticketId,
  clinicId,
  clinicName,
  avgConsultMinutes,
}: Props) {
  const { ticket, position, loading } = useTicketStatus(ticketId, clinicId);

  if (loading) {
    return (
      <div className="animate-pulse text-center text-slate-400">
        Loading your place in the queue…
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center text-slate-500">
        We couldn&apos;t find that ticket. It may be from a previous day.
      </div>
    );
  }

  // Terminal states — nothing left to wait for.
  if (ticket.status === "called" || ticket.status === "serving") {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-3xl">
          🔔
        </div>
        <h1 className="text-2xl font-semibold text-ink">It&apos;s your turn</h1>
        <p className="mt-2 text-slate-500">
          Please head to the front desk at {clinicName}.
        </p>
        <div className="my-6 flex justify-center">
          <TicketBadge number={ticket.ticket_number} size="lg" />
        </div>
      </div>
    );
  }

  if (ticket.status === "done") {
    return (
      <div className="text-center text-slate-600">
        <div className="mb-3 text-4xl">✅</div>
        <p className="text-lg font-medium text-ink">All done</p>
        <p className="mt-1 text-sm text-slate-500">Take care, and get well soon.</p>
      </div>
    );
  }

  if (ticket.status === "skipped" || ticket.status === "left") {
    return (
      <div className="text-center text-slate-600">
        <p className="text-lg font-medium text-ink">
          Your ticket is no longer active
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Please check in again at the front desk if you&apos;re still here.
        </p>
      </div>
    );
  }

  // Still waiting.
  const pos = position ?? 1;
  const waitMins = estimateWaitMinutes(pos, avgConsultMinutes);

  return (
    <div className="text-center">
      <div className="mb-2 flex items-center justify-center gap-2 text-sm text-slate-400">
        <span className="h-2 w-2 animate-pulseDot rounded-full bg-emerald-500" />
        Live — updates on their own
      </div>

      <p className="text-sm text-slate-500">Your number</p>
      <div className="my-4 flex justify-center">
        <TicketBadge number={ticket.ticket_number} size="lg" />
      </div>

      <div className="rounded-2xl bg-slate-50 px-6 py-5">
        <p className="text-5xl font-bold tabular-nums text-ink">{pos}</p>
        <p className="mt-1 text-sm text-slate-500">
          {pos <= 1
            ? "You're next in line"
            : `${pos === 2 ? "1 person" : `${pos - 1} people`} ahead of you`}
        </p>
      </div>

      <div className="mt-4 flex justify-center">
        <WaitTimeBadge minutes={waitMins} />
      </div>

      <p className="mt-6 text-sm text-slate-500">
        Feel free to step out. We&apos;ll text you the moment you&apos;re two spots
        away, so you have time to make your way back.
      </p>
    </div>
  );
}
