import { beforeEach, describe, expect, test } from "vitest";
import { Prisma } from "@prisma/client";
import { POST as validatePinPost } from "@/app/api/twilio/voice/validate-pin/route";
import { POST as elevenWebhookPost } from "@/app/api/webhooks/elevenlabs/route";
import { generateUniquePin } from "@/lib/pin/pinService";
import { prisma } from "@/lib/prisma";

async function resetDatabase() {
  await prisma.outputVersion.deleteMany();
  await prisma.outputDocument.deleteMany();
  await prisma.extractionArtifact.deleteMany();
  await prisma.transcript.deleteMany();
  await prisma.interviewCall.deleteMany();
  await prisma.interviewSession.deleteMany();
  await prisma.researchBrief.deleteMany();
  await prisma.planningArtifact.deleteMany();
  await prisma.webhookReceipt.deleteMany();
  await prisma.engagement.deleteMany();
}

describe("workflow integration", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  test("routes PIN, ingests transcript idempotently, extracts facts, and generates drafts", async () => {
    const engagement = await prisma.engagement.create({
      data: {
        orgId: "org_test",
        createdByUserId: "user_test",
        clientName: "Quarterhill",
        objective: "Surface workload and automation opportunity",
      },
    });

    await prisma.planningArtifact.create({
      data: {
        engagementId: engagement.id,
        createdByUserId: "user_test",
        chatNotes: "Need update + proposal",
        planJson: {
          deliverables: ["Client update", "Automation memo"],
          measures: ["volume", "minutes per task"],
          systemsToProbe: ["ERP", "Excel", "SharePoint"],
          suggestedInterviewOutline: ["hour-by-hour walkthrough"],
          downstreamJobs: ["extract", "generate drafts"],
        } as Prisma.InputJsonValue,
      },
    });

    await prisma.researchBrief.create({
      data: {
        engagementId: engagement.id,
        createdByUserId: "user_test",
        briefMarkdown: "Quarterhill is a multi-segment operator.",
        sourceNotesJson: { source: "public_info_stub" } as Prisma.InputJsonValue,
      },
    });

    const generatedPin = await generateUniquePin();
    const session = await prisma.interviewSession.create({
      data: {
        engagementId: engagement.id,
        participantName: "Controller A",
        pinCode: generatedPin.pin,
        pinHash: generatedPin.pinHash,
        pinPreview: generatedPin.pinPreview,
      },
    });

    const twilioForm = new URLSearchParams();
    twilioForm.set("Digits", generatedPin.pin);
    twilioForm.set("CallSid", "CA_TEST_1");
    twilioForm.set("From", "+15551230000");

    const twilioResponse = await validatePinPost(
      new Request("http://localhost/api/twilio/voice/validate-pin", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: twilioForm.toString(),
      }),
    );
    const twilioBody = await twilioResponse.text();
    expect(twilioResponse.status).toBe(200);
    expect(twilioBody).toContain("Routing confirmed");

    const callRecord = await prisma.interviewCall.findFirst({
      where: { sessionId: session.id },
      orderBy: { createdAt: "desc" },
    });
    expect(callRecord?.routingStatus).toBe("PIN_VALIDATED");
    const context = callRecord?.interviewerContextJson as { objective?: string } | null;
    expect(context?.objective).toContain("automation");

    const webhookPayload = {
      event_id: "evt_001",
      type: "conversation.completed",
      data: {
        session_id: session.id,
        transcript:
          "Yesterday I processed invoices in ERP and tracked exceptions in Excel. Approvals took extra time.",
      },
    };

    const webhookResponse = await elevenWebhookPost(
      new Request("http://localhost/api/webhooks/elevenlabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      }),
    );

    const webhookData = (await webhookResponse.json()) as {
      status: string;
      generatedOutputVersionIds: string[];
    };
    expect(webhookResponse.status).toBe(200);
    expect(webhookData.status).toBe("processed");
    expect(webhookData.generatedOutputVersionIds.length).toBe(3);

    const duplicateResponse = await elevenWebhookPost(
      new Request("http://localhost/api/webhooks/elevenlabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      }),
    );
    const duplicateData = (await duplicateResponse.json()) as { status: string };
    expect(duplicateData.status).toBe("duplicate_ignored");

    const transcriptCount = await prisma.transcript.count({
      where: { sessionId: session.id },
    });
    expect(transcriptCount).toBe(1);

    const extractionCount = await prisma.extractionArtifact.count({
      where: { engagementId: engagement.id },
    });
    expect(extractionCount).toBe(1);

    const docs = await prisma.outputDocument.findMany({
      where: { engagementId: engagement.id },
      include: { versions: true },
    });
    expect(docs.length).toBe(3);
    expect(docs.every((doc) => doc.versions.length >= 1)).toBe(true);

    const firstVersion = docs[0]?.versions[0];
    expect(firstVersion?.status).toBe("DRAFT");

    if (firstVersion) {
      await prisma.outputVersion.create({
        data: {
          outputDocumentId: firstVersion.outputDocumentId,
          versionNumber: firstVersion.versionNumber + 1,
          markdown: `${firstVersion.markdown}\n\nManual edit`,
          status: "DRAFT",
          createdByUserId: "user_test",
        },
      });

      await prisma.outputVersion.update({
        where: { id: firstVersion.id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          approvedByUserId: "user_test",
        },
      });
    }

    const approvedCount = await prisma.outputVersion.count({
      where: { status: "APPROVED" },
    });
    expect(approvedCount).toBeGreaterThan(0);
  });
});
