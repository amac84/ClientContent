import { NextResponse } from "next/server";
import { getApiActor } from "@/lib/authApi";
import { prisma } from "@/lib/prisma";
import { planningSchema } from "@/lib/schemas/planning";

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

  const planning = await prisma.planningArtifact.findFirst({
    where: { engagementId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ planning });
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
  const parsed = planningSchema.safeParse(json?.planJson);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid plan JSON", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const planning = await prisma.planningArtifact.create({
    data: {
      engagementId,
      createdByUserId: actor.userId,
      chatNotes: typeof json?.chatNotes === "string" ? json.chatNotes : null,
      planJson: parsed.data,
    },
  });

  return NextResponse.json({ planning }, { status: 201 });
}
