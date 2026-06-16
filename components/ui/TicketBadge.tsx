type TicketBadgeProps = {
  number: number;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-9 min-w-9 px-2 text-sm",
  md: "h-12 min-w-12 px-3 text-lg",
  lg: "h-20 min-w-20 px-4 text-4xl",
};

export function TicketBadge({ number, size = "md" }: TicketBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-ink font-bold tabular-nums text-white ${sizes[size]}`}
    >
      {number}
    </span>
  );
}
