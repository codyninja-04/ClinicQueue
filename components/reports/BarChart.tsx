type Bar = {
  label: string;
  value: number;
  caption?: string;
  highlight?: boolean;
};

type Props = {
  bars: Bar[];
  unit?: string;
  emptyLabel?: string;
};

// A dependency-free horizontal bar chart. Heights/widths are inline because the
// values are dynamic — everything else stays Tailwind.
export function BarChart({ bars, unit = "", emptyLabel = "No data yet" }: Props) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  const hasData = bars.some((b) => b.value > 0);

  if (!hasData) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">{emptyLabel}</p>
    );
  }

  return (
    <div className="space-y-2">
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-3">
          <span className="w-14 shrink-0 text-right text-xs tabular-nums text-slate-400">
            {b.label}
          </span>
          <div className="h-6 flex-1 overflow-hidden rounded-md bg-slate-100">
            <div
              className={`h-full rounded-md ${
                b.highlight ? "bg-brand" : "bg-brand/60"
              }`}
              style={{ width: `${Math.round((b.value / max) * 100)}%` }}
            />
          </div>
          <span className="w-16 shrink-0 text-xs tabular-nums text-slate-500">
            {b.value}
            {unit}
            {b.caption ? ` ${b.caption}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
