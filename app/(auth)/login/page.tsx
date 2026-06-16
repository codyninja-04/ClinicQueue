"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-2xl">
          ✉️
        </div>
        <h1 className="text-xl font-semibold text-ink">Check your inbox</h1>
        <p className="mt-2 text-sm text-slate-500">
          We sent a sign-in link to <span className="font-medium">{email}</span>.
          Tap it on this device and you&apos;re in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Clinic sign in</h1>
        <p className="mt-1 text-sm text-slate-500">
          No password. We&apos;ll email you a one-tap sign-in link.
        </p>
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Work email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="reception@clinic.sg"
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !email}
        className="w-full rounded-lg bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {loading ? "Sending link…" : "Email me a sign-in link"}
      </button>

      <p className="text-center text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600">
          ← Back home
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
