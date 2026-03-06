import { NextResponse } from "next/server";
import { requireActor } from "@/lib/auth";
import { processTranscriptArrival } from "@/lib/orchestration/processTranscript";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ engagementId: string }>;
};

export async function POST(_: Request, context: Context) {
  const actor = await requireActor();
  const { engagementId } = await context.params;

  const engagement = await prisma.engagement.findFirst({
    where: { id: engagementId, orgId: actor.orgId },
    include: {
      interviewSessions: {
        include: {
          transcripts: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found." }, { status: 404 });
  }

  const runs = [];
  for (const session of engagement.interviewSessions) {
    const transcript = session.transcripts[0];
    if (!transcript) continue;

    const result = await processTranscriptArrival(
      {
        engagementId,
        sessionId: session.id,
        transcriptId: transcript.id,
        transcriptText: transcript.transcriptText,
      },
      actor.userId,
    );
    runs.push(result);
  }

  return NextResponse.json({
    status: "ok",
    rerunCount: runs.length,
  });
}
