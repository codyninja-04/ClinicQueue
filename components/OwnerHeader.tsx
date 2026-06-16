import Link from "next/link";

type Props = {
  clinicId: string;
  clinicName: string;
  active?: "dashboard" | "summary" | "analytics" | "setup" | "billing";
};

const tabs = [
  { key: "dashboard", label: "Queue", href: (id: string) => `/clinic/${id}/dashboard` },
  { key: "summary", label: "Today", href: (id: string) => `/clinic/${id}/summary` },
  { key: "analytics", label: "Analytics", href: (id: string) => `/clinic/${id}/analytics` },
  { key: "setup", label: "Setup", href: (id: string) => `/clinic/${id}/setup` },
  { key: "billing", label: "Billing", href: (id: string) => `/clinic/${id}/billing` },
] as const;

// Shared top bar for the owner-facing sub-pages. The live dashboard keeps its
// own header (it carries the open/close control), so it isn't rendered here.
export function OwnerHeader({ clinicId, clinicName, active }: Props) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/clinics"
            className="text-sm text-slate-400 transition hover:text-ink"
          >
            ←
          </Link>
          <h1 className="text-lg font-semibold text-ink">{clinicName}</h1>
        </div>
        <nav className="flex flex-wrap items-center gap-1">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={t.href(clinicId)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                active === t.key
                  ? "bg-slate-100 text-ink"
                  : "text-slate-500 hover:text-ink"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
