import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiActor } from "@/lib/authApi";
import { prisma } from "@/lib/prisma";

const createEngagementSchema = z.object({
  clientName: z.string().min(1),
  objective: z.string().optional().nullable(),
});

export async function GET() {
  const actor = await getApiActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const engagements = await prisma.engagement.findMany({
    where: { orgId: actor.orgId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ engagements });
}

export async function POST(request: Request) {
  const actor = await getApiActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createEngagementSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const engagement = await prisma.engagement.create({
    data: {
      orgId: actor.orgId,
      createdByUserId: actor.userId,
      clientName: parsed.data.clientName,
      objective: parsed.data.objective ?? null,
    },
  });

  return NextResponse.json({ engagement }, { status: 201 });
}
