import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function hashPayload(payload: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export async function reserveWebhookReceipt(provider: string, eventKey: string, payload: unknown) {
  const payloadHash = hashPayload(payload);

  try {
    const receipt = await prisma.webhookReceipt.create({
      data: {
        provider,
        eventKey,
        payloadHash,
      },
    });

    return {
      isDuplicate: false,
      receipt,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        isDuplicate: true,
        receipt: null,
      };
    }

    throw error;
  }
}
