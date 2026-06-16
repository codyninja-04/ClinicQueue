"use client";

import { useQueue } from "@/hooks/useQueue";

type Props = {
  clinicId: string;
  clinicName: string;
};

// Runs on a TV in the waiting room. No controls — just big, high-contrast
// numbers that update on their own.
export function WaitingRoomScreen({ clinicId, clinicName }: Props) {
  const { tickets } = useQueue(clinicId);

  // The number "now serving" is whoever is being called or in consult.
  const serving = tickets
    .filter((t) => t.status === "called" || t.status === "serving")
    .sort((a, b) => b.ticket_number - a.ticket_number)[0];

  const upNext = tickets
    .filter((t) => t.status === "waiting")
    .sort((a, b) => a.ticket_number - b.ticket_number)
    .slice(0, 2);

  return (
    <div className="flex min-h-screen flex-col bg-ink text-white">
      <header className="flex items-center justify-between px-10 py-6">
        <h1 className="text-2xl font-medium text-white/70">{clinicName}</h1>
        <div className="flex items-center gap-2 text-sm text-white/40">
          <span className="h-2.5 w-2.5 animate-pulseDot rounded-full bg-emerald-400" />
          Live
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-10">
        <p className="text-2xl uppercase tracking-[0.3em] text-brand-light">
          Now serving
        </p>
        <p className="my-6 text-[14rem] font-bold leading-none tabular-nums">
          {serving ? serving.ticket_number : "—"}
        </p>

        {upNext.length > 0 && (
          <div className="mt-6 flex items-center gap-8">
            <span className="text-xl uppercase tracking-widest text-white/40">
              Up next
            </span>
            <div className="flex gap-5">
              {upNext.map((t) => (
                <span
                  key={t.id}
                  className="rounded-2xl bg-white/10 px-8 py-4 text-5xl font-semibold tabular-nums"
                >
                  {t.ticket_number}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="px-10 py-6 text-center text-lg text-white/40">
        Scan the QR at the door to join from your phone.
      </footer>
    </div>
  );
}
