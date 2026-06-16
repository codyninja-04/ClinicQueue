"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Clinic } from "@/types";

export function ClinicSettings({ clinic }: { clinic: Clinic }) {
  const [name, setName] = useState(clinic.name);
  const [avg, setAvg] = useState(String(clinic.avg_consult_minutes));
  const [address, setAddress] = useState(clinic.address ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("clinics")
      .update({
        name: name.trim(),
        avg_consult_minutes: Math.max(1, Math.round(Number(avg) || 10)),
        address: address.trim() || null,
      })
      .eq("id", clinic.id);

    setSaving(false);
    if (error) {
      setError(error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <form
      onSubmit={save}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h3 className="text-lg font-semibold text-ink">Clinic settings</h3>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Clinic name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
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
        <p className="mt-1.5 text-sm text-slate-400">
          We use this to estimate every patient&apos;s wait. Tune it to how your
          clinic actually runs.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Address <span className="text-slate-400">(optional)</span>
        </label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-dark disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-sm text-emerald-600">✓ Saved</span>}
      </div>
    </form>
  );
}
