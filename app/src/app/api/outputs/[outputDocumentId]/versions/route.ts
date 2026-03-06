import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiActor } from "@/lib/authApi";
import { prisma } from "@/lib/prisma";

const createVersionSchema = z.object({
  markdown: z.string().optional(),
});

type Context = {
  params: Promise<{ outputDocumentId: string }>;
};

export async function POST(request: Request, context: Context) {
  const actor = await getApiActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { outputDocumentId } = await context.params;
  const outputDocument = await prisma.outputDocument.findFirst({
    where: {
      id: outputDocumentId,
      engagement: { orgId: actor.orgId },
    },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!outputDocument) {
    return NextResponse.json({ error: "Output document not found" }, { status: 404 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = createVersionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const latestVersion = outputDocument.versions[0];
  const outputVersion = await prisma.outputVersion.create({
    data: {
      outputDocumentId,
      versionNumber: (latestVersion?.versionNumber ?? 0) + 1,
      markdown: parsed.data.markdown ?? latestVersion?.markdown ?? "",
      status: "DRAFT",
      createdByUserId: actor.userId,
      generatedFromJson: {
        source: "api_manual_version",
        sourceVersionId: latestVersion?.id ?? null,
      },
    },
  });

  return NextResponse.json({ outputVersion }, { status: 201 });
}
