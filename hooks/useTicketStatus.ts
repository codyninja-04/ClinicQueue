"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LiveQueueRow, Ticket } from "@/types";

export type TicketStatusState = {
  ticket: Ticket | null;
  position: number | null;
  loading: boolean;
};

// A single patient's live view of their own ticket. We subscribe to the whole
// clinic queue (one patient moving changes everyone's position) and recompute
// this patient's row + position on every change.
export function useTicketStatus(
  ticketId: string,
  clinicId: string
): TicketStatusState {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const supabase = createClient();

    const [{ data: ticketRow }, { data: queueRow }] = await Promise.all([
      supabase.from("tickets").select("*").eq("id", ticketId).single(),
      supabase
        .from("live_queue")
        .select("*")
        .eq("id", ticketId)
        .maybeSingle<LiveQueueRow>(),
    ]);

    if (ticketRow) {
      setTicket(ticketRow);
    }
    setPosition(queueRow?.position_in_queue ?? null);
    setLoading(false);
  }, [ticketId]);

  useEffect(() => {
    refetch();

    const supabase = createClient();
    const channel = supabase
      .channel(`status:${ticketId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tickets",
          filter: `clinic_id=eq.${clinicId}`,
        },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, clinicId, refetch]);

  return { ticket, position, loading };
}
