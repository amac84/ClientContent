import { NextResponse } from "next/server";
import { requireActor } from "@/lib/auth";
import { generateOutputsForEngagement } from "@/lib/orchestration/generateOutputs";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ engagementId: string }>;
};

export async function POST(_: Request, context: Context) {
  const actor = await requireActor();
  const { engagementId } = await context.params;

  const engagement = await prisma.engagement.findFirst({
    where: { id: engagementId, orgId: actor.orgId },
    select: { id: true },
  });

  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found." }, { status: 404 });
  }

  const versionIds = await generateOutputsForEngagement(engagementId, actor.userId);
  return NextResponse.json({
    status: "ok",
    generatedVersionIds: versionIds,
  });
}
