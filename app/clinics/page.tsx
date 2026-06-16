import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ClinicsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: clinics } = await supabase
    .from("clinics")
    .select("id, name, is_open, address")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  // First-timers go straight to creating their first clinic.
  if (!clinics || clinics.length === 0) {
    redirect("/clinic/new");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold text-ink">Your clinics</h1>
          <form action="/auth/signout" method="post">
            <button className="text-sm text-slate-400 transition hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-4 px-6 py-6">
        <div className="space-y-3">
          {clinics.map((c) => (
            <Link
              key={c.id}
              href={`/clinic/${c.id}/dashboard`}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:border-brand hover:shadow-sm"
            >
              <div>
                <p className="font-medium text-ink">{c.name}</p>
                {c.address && (
                  <p className="text-sm text-slate-400">{c.address}</p>
                )}
              </div>
              <span className="flex items-center gap-1.5 text-sm text-slate-400">
                <span
                  className={`h-2 w-2 rounded-full ${
                    c.is_open ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                />
                {c.is_open ? "Open" : "Closed"}
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/clinic/new"
          className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-4 text-sm font-medium text-slate-500 transition hover:border-brand hover:text-brand-dark"
        >
          + Add another clinic
        </Link>
      </div>
    </main>
  );
}
