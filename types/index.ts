import type { Database, TicketStatus } from "@/lib/supabase/types";

export type { TicketStatus };

export type Clinic = Database["public"]["Tables"]["clinics"]["Row"];
export type QueueSession = Database["public"]["Tables"]["queue_sessions"]["Row"];
export type Ticket = Database["public"]["Tables"]["tickets"]["Row"];
export type LiveQueueRow = Database["public"]["Views"]["live_queue"]["Row"];
