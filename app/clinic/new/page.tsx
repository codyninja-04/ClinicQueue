"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewClinicPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [avg, setAvg] = useState("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/clinics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        avg_consult_minutes: Number(avg) || 10,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not create the clinic.");
      setLoading(false);
      return;
    }

    router.push(`/clinic/${data.clinic.id}/setup`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div>
          <h1 className="text-2xl font-semibold text-ink">Create your clinic</h1>
          <p className="mt-1 text-sm text-slate-500">
            Two details and you&apos;re ready to print a QR code.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Clinic name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Sunrise Family Clinic"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Average consult time (minutes)
          </label>
          <input
            type="number"
            min={1}
            max={120}
            value={avg}
            onChange={(e) => setAvg(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || !name}
          className="w-full rounded-lg bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-dark disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create clinic"}
        </button>
      </form>
    </main>
  );
}
