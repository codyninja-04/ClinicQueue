// Hand-maintained mirror of the database schema. Once your project is live you
// can regenerate this with:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts

export type TicketStatus =
  | "waiting"
  | "called"
  | "serving"
  | "done"
  | "skipped"
  | "left";

export type Database = {
  public: {
    Tables: {
      clinics: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          slug: string;
          avg_consult_minutes: number;
          is_open: boolean;
          phone: string | null;
          address: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          name: string;
          slug: string;
          avg_consult_minutes?: number;
          is_open?: boolean;
          phone?: string | null;
          address?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["clinics"]["Insert"]>;
        Relationships: [];
      };
      queue_sessions: {
        Row: {
          id: string;
          clinic_id: string;
          date: string;
          opened_at: string | null;
          closed_at: string | null;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          date?: string;
          opened_at?: string | null;
          closed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["queue_sessions"]["Insert"]>;
        Relationships: [];
      };
      tickets: {
        Row: {
          id: string;
          session_id: string;
          clinic_id: string;
          ticket_number: number;
          patient_name: string;
          phone: string;
          status: TicketStatus;
          joined_at: string | null;
          called_at: string | null;
          served_at: string | null;
          done_at: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          clinic_id: string;
          ticket_number: number;
          patient_name: string;
          phone: string;
          status?: TicketStatus;
          joined_at?: string | null;
          called_at?: string | null;
          served_at?: string | null;
          done_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["tickets"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      live_queue: {
        Row: {
          id: string;
          clinic_id: string;
          ticket_number: number;
          patient_name: string;
          phone: string;
          status: TicketStatus;
          joined_at: string | null;
          called_at: string | null;
          position_in_queue: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      join_queue: {
        Args: { p_clinic_id: string; p_name: string; p_phone: string };
        Returns: Database["public"]["Tables"]["tickets"]["Row"];
      };
      open_queue: {
        Args: { p_clinic_id: string };
        Returns: Database["public"]["Tables"]["queue_sessions"]["Row"];
      };
      close_queue: {
        Args: { p_clinic_id: string };
        Returns: undefined;
      };
    };
  };
};
