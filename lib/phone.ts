// Singapore mobile numbers are 8 digits and start with 6, 8, or 9.
// We validate on the client but store exactly what the patient typed.

export function isValidSgPhone(raw: string): boolean {
  const digits = raw.replace(/\s+/g, "");
  return /^[689]\d{7}$/.test(digits);
}

// When handing a number to Twilio, make sure it carries a country code.
// We never mutate what we stored — this is only for the outbound send.
export function toE164(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) {
    return trimmed;
  }
  const digits = trimmed.replace(/\s+/g, "");
  return `+65${digits}`;
}
