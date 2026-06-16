import type { LiveQueueRow } from "@/types";
import { estimateWaitMinutes, humanWait } from "@/lib/queue";

type Props = {
  tickets: LiveQueueRow[];
  avgConsultMinutes: number;
};

export function QueueStats({ tickets, avgConsultMinutes }: Props) {
  const waiting = tickets.filter((t) => t.status === "waiting");
  const serving = tickets.filter((t) => t.status === "serving").length;
  const doneToday = tickets.filter((t) => t.status === "done").length;

  // Wait for the person who would join right now (back of the line).
  const tailWait = estimateWaitMinutes(waiting.length + 1, avgConsultMinutes);

  const stats = [
    { label: "Waiting", value: String(waiting.length) },
    { label: "In consult", value: String(serving) },
    { label: "Seen today", value: String(doneToday) },
    { label: "New joiner waits", value: humanWait(tailWait) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {s.label}
          </p>
          <p className="mt-1 text-lg font-semibold text-ink">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
