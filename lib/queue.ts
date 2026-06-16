// Wait time estimation lives here so the patient page, the join confirmation,
// and the SMS all speak the same language.

export function estimateWaitMinutes(
  position: number,
  avgConsultMinutes: number
): number {
  // Position 1 means they are next. Add a small buffer for the current patient.
  return Math.max(0, (position - 1) * avgConsultMinutes + avgConsultMinutes);
}

// Turn a raw minute estimate into something a waiting patient actually wants to
// read on their phone.
export function humanWait(minutes: number): string {
  if (minutes <= 5) {
    return "Almost your turn";
  }
  if (minutes <= 15) {
    return `About ${minutes} minutes`;
  }
  if (minutes <= 30) {
    return `Around ${minutes} minutes`;
  }
  return `Roughly ${minutes} minutes — feel free to step out`;
}
