"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useQueue } from "@/hooks/useQueue";
import { QueueStats } from "./QueueStats";
import { QueueList } from "./QueueList";
import { CallNextButton } from "./CallNextButton";
import type { Clinic } from "@/types";

export function DashboardClient({ clinic }: { clinic: Clinic }) {
  const { tickets, refetchQueue } = useQueue(clinic.id);
  const [isOpen, setIsOpen] = useState(clinic.is_open);
  const [toggling, setToggling] = useState(false);

  const waiting = tickets
    .filter((t) => t.status === "waiting")
    .sort((a, b) => a.ticket_number - b.ticket_number);
  const next = waiting[0];

  async function toggleQueue() {
    setToggling(true);
    const supabase = createClient();
    if (isOpen) {
      await supabase.rpc("close_queue", { p_clinic_id: clinic.id });
      setIsOpen(false);
    } else {
      await supabase.rpc("open_queue", { p_clinic_id: clinic.id });
      setIsOpen(true);
    }
    setToggling(false);
    refetchQueue();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-ink">{clinic.name}</h1>
            <p className="flex items-center gap-1.5 text-sm text-slate-400">
              <span
                className={`h-2 w-2 rounded-full ${
                  isOpen ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
              {isOpen ? "Queue open" : "Queue closed"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/clinic/${clinic.id}/setup`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:text-ink"
            >
              Setup
            </Link>
            <Link
              href={`/clinic/${clinic.id}/queue`}
              target="_blank"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:text-ink"
            >
              TV screen ↗
            </Link>
            <button
              onClick={toggleQueue}
              disabled={toggling}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${
                isOpen
                  ? "bg-slate-700 hover:bg-slate-800"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isOpen ? "Close queue" : "Open queue"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 px-6 py-6">
        <QueueStats
          tickets={tickets}
          avgConsultMinutes={clinic.avg_consult_minutes}
        />

        {isOpen ? (
          <CallNextButton next={next} onCalled={refetchQueue} />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-5 text-center text-sm text-slate-500">
            The queue is closed. Open it to let patients join.
          </div>
        )}

        <QueueList tickets={tickets} onChange={refetchQueue} />
      </div>
    </main>
  );
}
