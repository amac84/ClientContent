import { prisma } from "@/lib/prisma";

export async function buildInterviewContext(sessionId: string) {
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      engagement: true,
    },
  });

  if (!session) {
    throw new Error("Interview session not found.");
  }

  const [latestPlan, latestBrief] = await Promise.all([
    prisma.planningArtifact.findFirst({
      where: { engagementId: session.engagementId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.researchBrief.findFirst({
      where: { engagementId: session.engagementId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    engagementId: session.engagementId,
    sessionId: session.id,
    participantName: session.participantName,
    clientName: session.engagement.clientName,
    objective: session.engagement.objective,
    whatToMeasure:
      (latestPlan?.planJson as { measures?: string[] } | null)?.measures ??
      ["Volumes", "Task time", "Exceptions", "Close spikes"],
    systemsToProbe:
      (latestPlan?.planJson as { systemsToProbe?: string[] } | null)?.systemsToProbe ??
      ["ERP", "Excel", "SharePoint", "Email approvals", "Portals"],
    interviewOutline:
      (latestPlan?.planJson as { suggestedInterviewOutline?: string[] } | null)
        ?.suggestedInterviewOutline ?? [],
    researchBrief: latestBrief?.briefMarkdown ?? null,
  };
}
