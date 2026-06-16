"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LiveQueueRow } from "@/types";

// Live queue for a clinic. Subscribes to every ticket change for this clinic
// and, on any change, refetches the whole queue from the live_queue view.
// We never patch local state from the change payload — always refetch.
export function useQueue(clinicId: string) {
  const [tickets, setTickets] = useState<LiveQueueRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refetchQueue = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("live_queue")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("ticket_number", { ascending: true });

    if (!error && data) {
      setTickets(data);
    }
    setLoading(false);
  }, [clinicId]);

  useEffect(() => {
    refetchQueue();

    const supabase = createClient();
    const channel = supabase
      .channel(`queue:${clinicId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tickets",
          filter: `clinic_id=eq.${clinicId}`,
        },
        () => refetchQueue()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinicId, refetchQueue]);

  return { tickets, loading, refetchQueue };
}
