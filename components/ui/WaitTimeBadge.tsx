import { humanWait } from "@/lib/queue";

export function WaitTimeBadge({ minutes }: { minutes: number }) {
  const tone =
    minutes <= 5
      ? "bg-emerald-100 text-emerald-700"
      : minutes <= 15
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${tone}`}
    >
      <span className="text-base leading-none">⏱</span>
      {humanWait(minutes)}
    </span>
  );
}
