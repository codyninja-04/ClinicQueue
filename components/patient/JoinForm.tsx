"use client";

import { useState } from "react";
import { isValidSgPhone } from "@/lib/phone";
import { TicketConfirmation } from "./TicketConfirmation";

type Props = {
  clinicId: string;
  clinicName: string;
};

type Joined = {
  name: string;
  ticketNumber: number;
  position: number;
  waitMinutes: number;
  statusHref: string;
};

export function JoinForm({ clinicId, clinicName }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<Joined | null>(null);

  const phoneValid = phone === "" || isValidSgPhone(phone);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidSgPhone(phone)) {
      setError("Please enter a valid Singapore mobile number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic_id: clinicId, name, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "queue_closed") {
          setError("This clinic's queue just closed. Please check with the front desk.");
        } else {
          setError(data.error ?? "Something went wrong. Please try again.");
        }
        setLoading(false);
        return;
      }

      setJoined({
        name,
        ticketNumber: data.ticket.ticket_number,
        position: data.position,
        waitMinutes: data.wait_minutes,
        statusHref: `/status/${data.ticket.id}`,
      });
    } catch {
      setError("Network hiccup. Please try again.");
      setLoading(false);
    }
  }

  if (joined) {
    return <TicketConfirmation {...joined} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Your name
        </label>
        <input
          id="name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Wei Ming"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Mobile number
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          required
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="8123 4567"
          className={`w-full rounded-xl border px-4 py-3 text-lg text-ink outline-none transition focus:ring-2 ${
            phoneValid
              ? "border-slate-300 focus:border-brand focus:ring-brand/30"
              : "border-red-400 focus:border-red-400 focus:ring-red-200"
          }`}
        />
        {!phoneValid && (
          <p className="mt-1.5 text-sm text-red-600">
            That doesn&apos;t look like an SG mobile number.
          </p>
        )}
        <p className="mt-1.5 text-sm text-slate-400">
          We&apos;ll text you when you&apos;re almost up. No spam, ever.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !name || !phone}
        className="w-full rounded-xl bg-brand px-4 py-4 text-lg font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {loading ? "Joining…" : `Join the queue at ${clinicName}`}
      </button>
    </form>
  );
}
