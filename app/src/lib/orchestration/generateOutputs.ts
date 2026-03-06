import { OutputType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateDraftMarkdown } from "@/lib/agents/generatorAgent";
import { planningSchema } from "@/lib/schemas/planning";
import { ExtractionPayload, extractionSchema } from "@/lib/schemas/extraction";

const outputTypes: OutputType[] = [
  "CLIENT_UPDATE",
  "AUTOMATION_MEMO",
  "TESTIMONIAL_DRAFT",
];

export async function generateOutputsForEngagement(
  engagementId: string,
  actorUserId?: string,
) {
  const engagement = await prisma.engagement.findUnique({
    where: { id: engagementId },
    include: {
      planningArtifacts: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      researchBriefs: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      extractionArtifacts: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!engagement) {
    throw new Error("Engagement not found for output generation.");
  }

  const latestPlan = engagement.planningArtifacts[0];
  const latestBrief = engagement.researchBriefs[0];
  const parsedPlan = latestPlan?.planJson ? planningSchema.safeParse(latestPlan.planJson) : null;
  const parsedExtractions = engagement.extractionArtifacts
    .map((artifact) =>
      extractionSchema.safeParse({
        taskInventory: artifact.taskInventoryJson,
        systemsMap: artifact.systemsMapJson,
        exceptionTaxonomy: artifact.exceptionTaxonomyJson,
        controlsMap: artifact.controlsMapJson,
        invisibleWork: artifact.invisibleWorkJson,
        automationOpportunities: artifact.automationOpportunitiesJson,
        impact: artifact.impactJson,
      }),
    )
    .filter(
      (item): item is { success: true; data: ExtractionPayload } => item.success,
    )
    .map((item) => item.data);

  const generatedVersionIds: string[] = [];

  for (const outputType of outputTypes) {
    const document = await prisma.outputDocument.upsert({
      where: {
        engagementId_type: {
          engagementId,
          type: outputType,
        },
      },
      update: {},
      create: {
        engagementId,
        type: outputType,
      },
    });

    const latestVersion = await prisma.outputVersion.findFirst({
      where: { outputDocumentId: document.id },
      orderBy: { versionNumber: "desc" },
      select: { versionNumber: true },
    });

    const markdown = generateDraftMarkdown(outputType, {
      clientName: engagement.clientName,
      objective: engagement.objective,
      researchBrief: latestBrief?.briefMarkdown,
      planning: parsedPlan?.success ? parsedPlan.data : null,
      extractions: parsedExtractions,
    });

    const createdVersion = await prisma.outputVersion.create({
      data: {
        outputDocumentId: document.id,
        versionNumber: (latestVersion?.versionNumber ?? 0) + 1,
        markdown,
        status: "DRAFT",
        createdByUserId: actorUserId,
        generatedFromJson: {
          strategy: "refresh_on_each_transcript",
          extractionCount: parsedExtractions.length,
          planArtifactId: latestPlan?.id ?? null,
          researchBriefId: latestBrief?.id ?? null,
        },
      },
    });

    generatedVersionIds.push(createdVersion.id);
  }

  return generatedVersionIds;
}
