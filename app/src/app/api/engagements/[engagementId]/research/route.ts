import { NextResponse } from "next/server";
import { buildResearchBrief } from "@/lib/agents/researchAgent";
import { getApiActor } from "@/lib/authApi";
import { prisma } from "@/lib/prisma";

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

  const brief = await prisma.researchBrief.findFirst({
    where: { engagementId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ researchBrief: brief });
}

export async function POST(_: Request, context: Context) {
  const actor = await getApiActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { engagementId } = await context.params;
  const engagement = await prisma.engagement.findFirst({
    where: { id: engagementId, orgId: actor.orgId },
  });

  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  const researchBrief = await prisma.researchBrief.create({
    data: {
      engagementId,
      createdByUserId: actor.userId,
      briefMarkdown: buildResearchBrief(
        engagement.clientName,
        engagement.objective ?? undefined,
      ),
      sourceNotesJson: {
        mode: "api_auto_brief",
      },
    },
  });

  return NextResponse.json({ researchBrief }, { status: 201 });
}
