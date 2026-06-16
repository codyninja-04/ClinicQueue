"use client";

import { QRCodeCanvas } from "qrcode.react";
import { CopyLinkButton } from "./CopyLinkButton";

type Props = {
  joinUrl: string;
  clinicName: string;
};

export function QRCodeDisplay({ joinUrl, clinicName }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="no-print flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
          <QRCodeCanvas value={joinUrl} size={180} level="M" includeMargin />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-semibold text-ink">Your door QR</h3>
          <p className="mt-1 text-sm text-slate-500">
            Print it, tape it to the door. Patients scan to join — no app, no
            account.
          </p>
          <p className="mt-3 break-all rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            {joinUrl}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            <CopyLinkButton url={joinUrl} />
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white transition hover:bg-ink-soft"
            >
              Print poster
            </button>
          </div>
        </div>
      </div>

      {/* Clean print sheet — only this shows on paper. */}
      <div className="print-only hidden">
        <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-12 text-center">
          <h1 className="text-4xl font-bold text-ink">{clinicName}</h1>
          <QRCodeCanvas value={joinUrl} size={360} level="M" includeMargin />
          <div>
            <p className="text-2xl font-semibold text-ink">
              Scan to join the queue
            </p>
            <p className="mt-2 text-lg text-slate-500">
              No app needed. Just your phone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
