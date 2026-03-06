import { prisma } from "@/lib/prisma";
import { hashPin } from "@/lib/pin/pinService";

type ResolveInput = {
  sessionId?: string | null;
  pin?: string | null;
};

export async function resolveInterviewSession(input: ResolveInput) {
  if (input.sessionId) {
    return prisma.interviewSession.findUnique({
      where: { id: input.sessionId },
      include: { engagement: true },
    });
  }

  if (input.pin) {
    const pinHash = hashPin(input.pin);
    return prisma.interviewSession.findUnique({
      where: { pinHash },
      include: { engagement: true },
    });
  }

  return null;
}
