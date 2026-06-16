import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

// POST /api/clinics — create a clinic for the signed-in owner.
export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const avgConsultMinutes = Number(body?.avg_consult_minutes ?? 10);

  if (!name) {
    return NextResponse.json({ error: "Clinic name is required" }, { status: 400 });
  }

  // Keep slugs unique with a short random suffix so two "Sunrise Clinic"s coexist.
  const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;

  const { data, error } = await supabase
    .from("clinics")
    .insert({
      owner_id: user.id,
      name,
      slug,
      avg_consult_minutes: Number.isFinite(avgConsultMinutes)
        ? Math.max(1, Math.round(avgConsultMinutes))
        : 10,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ clinic: data }, { status: 201 });
}
