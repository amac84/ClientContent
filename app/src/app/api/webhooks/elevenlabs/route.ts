import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { parseTranscriptWebhookPayload } from "@/lib/elevenlabs/payloads";
import { resolveInterviewSession } from "@/lib/interview/sessionResolver";
import { processTranscriptArrival } from "@/lib/orchestration/processTranscript";
import { prisma } from "@/lib/prisma";
import { reserveWebhookReceipt } from "@/lib/webhooks/idempotency";

const PROVIDER = "elevenlabs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  let normalized;
  try {
    normalized = parseTranscriptWebhookPayload(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Payload validation failed.",
        details: error instanceof Error ? error.message : "unknown",
      },
      { status: 400 },
    );
  }

  const receiptReservation = await reserveWebhookReceipt(
    PROVIDER,
    normalized.eventKey,
    payload,
  );

  if (receiptReservation.isDuplicate) {
    return NextResponse.json({
      status: "duplicate_ignored",
      eventKey: normalized.eventKey,
    });
  }

  const session = await resolveInterviewSession({
    sessionId: normalized.sessionId,
    pin: normalized.pin,
  });

  if (!session) {
    return NextResponse.json(
      {
        error: "Could not resolve session from webhook payload.",
        eventKey: normalized.eventKey,
      },
      { status: 400 },
    );
  }

  const transcript = await prisma.transcript.create({
    data: {
      sessionId: session.id,
      webhookReceiptId: receiptReservation.receipt?.id,
      externalEventId: normalized.eventKey,
      rawPayloadJson: payload as Prisma.InputJsonValue,
      transcriptText: normalized.transcriptText,
    },
  });

  await prisma.interviewSession.update({
    where: { id: session.id },
    data: { status: "COMPLETED" },
  });

  const orchestration = await processTranscriptArrival({
    engagementId: session.engagementId,
    sessionId: session.id,
    transcriptId: transcript.id,
    transcriptText: normalized.transcriptText,
  });

  return NextResponse.json({
    status: "processed",
    eventKey: normalized.eventKey,
    transcriptId: transcript.id,
    extractionId: orchestration.extractionId,
    generatedOutputVersionIds: orchestration.generatedOutputVersionIds,
    policy: "outputs_regenerated_after_each_transcript_arrival",
  });
}
