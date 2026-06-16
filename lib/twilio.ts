import twilio from "twilio";
import { toE164 } from "./phone";

let client: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return client;
}

// Fire and forget. If Twilio is down the patient is still in the queue, so we
// log and move on rather than throwing into the caller's happy path.
export async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    await getClient().messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: toE164(to),
    });
    return true;
  } catch (err) {
    console.error("[twilio] failed to send SMS", err);
    return false;
  }
}

// SMS 1: Sent immediately when patient joins
export const joinedMessage = (
  name: string,
  ticketNumber: number,
  waitMins: number,
  statusUrl: string
) =>
  `Hi ${name}, you are number ${ticketNumber} in the queue. Estimated wait: ${waitMins} mins. Track your position: ${statusUrl}`;

// SMS 2: Sent when patient is 2 positions away
export const almostReadyMessage = (name: string, clinicName: string) =>
  `Hi ${name}, you are almost up at ${clinicName}. Please make your way back now.`;

// SMS 3: Sent when staff calls their number
export const calledMessage = (name: string, clinicName: string) =>
  `Hi ${name}, it is your turn at ${clinicName}. Please proceed to the consultation room.`;
