import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

const PIN_LENGTH = 6;
const MAX_RETRIES = 20;

function pinSecret() {
  return process.env.PIN_SECRET ?? "dev-pin-secret-change-me";
}

function randomDigits(length: number): string {
  return Array.from({ length }, () => crypto.randomInt(0, 10).toString()).join("");
}

export function hashPin(pin: string): string {
  return crypto.createHmac("sha256", pinSecret()).update(pin).digest("hex");
}

export async function generateUniquePin() {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    const pin = randomDigits(PIN_LENGTH);
    const pinHash = hashPin(pin);
    const existing = await prisma.interviewSession.findUnique({
      where: { pinHash },
      select: { id: true },
    });

    if (!existing) {
      return {
        pin,
        pinHash,
        pinPreview: `••${pin.slice(-2)}`,
      };
    }
  }

  throw new Error("Unable to generate unique PIN after retries.");
}
