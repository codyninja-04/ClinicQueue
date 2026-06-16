// The QR taped to the clinic door encodes nothing more than the patient join
// URL for that clinic.

export function getJoinUrl(clinicId: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/join/${clinicId}`;
}

export function getStatusUrl(ticketId: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/status/${ticketId}`;
}
