import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiActor } from "@/lib/authApi";
import { generateUniquePin } from "@/lib/pin/pinService";
import { prisma } from "@/lib/prisma";

const createSessionSchema = z.object({
  participantName: z.string().min(1),
});

type Context = {
  params: Promise<{ engagementId: string }>;
};

export async function GET(_: Request, context: Context) {
  const actor = await getApiActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { engagementId } = await context.params;
  const engagement = await prisma.engagement.findFirst({
    where: { id: engagementId, orgId: actor.orgId },
    select: { id: true },
  });

  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  const interviewSessions = await prisma.interviewSession.findMany({
    where: { engagementId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ interviewSessions });
}

export async function POST(request: Request, context: Context) {
  const actor = await getApiActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { engagementId } = await context.params;
  const engagement = await prisma.engagement.findFirst({
    where: { id: engagementId, orgId: actor.orgId },
    select: { id: true },
  });

  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createSessionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { pin, pinHash, pinPreview } = await generateUniquePin();
  const interviewSession = await prisma.interviewSession.create({
    data: {
      engagementId,
      participantName: parsed.data.participantName,
      pinCode: pin,
      pinHash,
      pinPreview,
      status: "PENDING",
    },
  });

  return NextResponse.json({ interviewSession }, { status: 201 });
}
