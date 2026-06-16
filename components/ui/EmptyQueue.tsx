export function EmptyQueue() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
      <div className="mb-3 text-4xl">🌿</div>
      <p className="text-lg font-medium text-ink">Queue is clear</p>
      <p className="mt-1 text-sm text-slate-500">
        No patients waiting. The next person to scan the QR shows up here.
      </p>
    </div>
  );
}
