import { prisma } from "@/lib/prisma";
import { extractStructuredFacts } from "@/lib/agents/extractorAgent";
import { generateOutputsForEngagement } from "@/lib/orchestration/generateOutputs";

type ProcessTranscriptInput = {
  engagementId: string;
  sessionId: string;
  transcriptId: string;
  transcriptText: string;
};

export async function processTranscriptArrival(
  input: ProcessTranscriptInput,
  actorUserId?: string,
) {
  const extracted = extractStructuredFacts(input.transcriptText);

  const extraction = await prisma.extractionArtifact.create({
    data: {
      engagementId: input.engagementId,
      sessionId: input.sessionId,
      transcriptId: input.transcriptId,
      taskInventoryJson: extracted.taskInventory,
      systemsMapJson: extracted.systemsMap,
      exceptionTaxonomyJson: extracted.exceptionTaxonomy,
      controlsMapJson: extracted.controlsMap,
      invisibleWorkJson: extracted.invisibleWork,
      automationOpportunitiesJson: extracted.automationOpportunities,
      impactJson: extracted.impact,
    },
  });

  const generatedOutputVersionIds = await generateOutputsForEngagement(
    input.engagementId,
    actorUserId,
  );

  return {
    extractionId: extraction.id,
    generatedOutputVersionIds,
  };
}
