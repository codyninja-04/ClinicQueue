import Link from "next/link";
import { TicketBadge } from "@/components/ui/TicketBadge";
import { WaitTimeBadge } from "@/components/ui/WaitTimeBadge";

type Props = {
  name: string;
  ticketNumber: number;
  position: number;
  waitMinutes: number;
  statusHref: string;
  brandColor?: string;
};

export function TicketConfirmation({
  name,
  ticketNumber,
  position,
  waitMinutes,
  statusHref,
  brandColor,
}: Props) {
  return (
    <div className="text-center">
      <p className="text-sm text-slate-500">You&apos;re in, {name.split(" ")[0]}.</p>
      <p className="mt-1 text-sm text-slate-500">Your number is</p>

      <div className="my-5 flex justify-center">
        <TicketBadge number={ticketNumber} size="lg" />
      </div>

      <p className="text-ink">
        {position <= 1 ? (
          <span className="font-medium">You&apos;re next in line.</span>
        ) : (
          <>
            <span className="font-medium">{position - 1}</span> ahead of you
          </>
        )}
      </p>

      <div className="mt-3 flex justify-center">
        <WaitTimeBadge minutes={waitMinutes} />
      </div>

      <p className="mt-6 text-sm text-slate-500">
        We just texted you a link to track your spot. You can step out — we&apos;ll
        message you again when you&apos;re almost up.
      </p>

      <Link
        href={statusHref}
        style={brandColor ? { backgroundColor: brandColor } : undefined}
        className="mt-6 inline-block w-full rounded-lg bg-brand px-4 py-2.5 font-medium text-white transition hover:opacity-90"
      >
        Track my place in the queue
      </Link>
    </div>
  );
}
