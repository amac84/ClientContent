import { NextResponse } from "next/server";
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

  const outputDocuments = await prisma.outputDocument.findMany({
    where: { engagementId },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ outputDocuments });
}
