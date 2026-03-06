import { NextResponse } from "next/server";
import { getApiActor } from "@/lib/authApi";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ versionId: string }>;
};

export async function POST(_: Request, context: Context) {
  const actor = await getApiActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { versionId } = await context.params;
  const version = await prisma.outputVersion.findFirst({
    where: {
      id: versionId,
      document: {
        engagement: {
          orgId: actor.orgId,
        },
      },
    },
    select: { id: true },
  });

  if (!version) {
    return NextResponse.json({ error: "Output version not found" }, { status: 404 });
  }

  const approvedVersion = await prisma.outputVersion.update({
    where: { id: versionId },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      approvedByUserId: actor.userId,
    },
  });

  return NextResponse.json({ outputVersion: approvedVersion });
}
