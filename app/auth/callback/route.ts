import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Magic link lands here. Exchange the code for a session, then send the owner
// to their clinic (or to create one if they don't have one yet).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: clinic } = await supabase
          .from("clinics")
          .select("id")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (clinic) {
          return NextResponse.redirect(
            `${origin}/clinic/${clinic.id}/dashboard`
          );
        }
      }

      return NextResponse.redirect(`${origin}/clinic/new`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
