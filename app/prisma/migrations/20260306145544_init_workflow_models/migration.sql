-- CreateTable
CREATE TABLE "Engagement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "objective" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlanningArtifact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "engagementId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "planJson" JSONB NOT NULL,
    "chatNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlanningArtifact_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResearchBrief" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "engagementId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "briefMarkdown" TEXT NOT NULL,
    "sourceNotesJson" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResearchBrief_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterviewSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "engagementId" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "pinPreview" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InterviewSession_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterviewCall" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "twilioCallSid" TEXT,
    "fromNumber" TEXT,
    "routingStatus" TEXT NOT NULL,
    "interviewerContextJson" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InterviewCall_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transcript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "webhookReceiptId" TEXT,
    "externalEventId" TEXT,
    "rawPayloadJson" JSONB NOT NULL,
    "transcriptText" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transcript_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transcript_webhookReceiptId_fkey" FOREIGN KEY ("webhookReceiptId") REFERENCES "WebhookReceipt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WebhookReceipt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ExtractionArtifact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "engagementId" TEXT NOT NULL,
    "sessionId" TEXT,
    "transcriptId" TEXT,
    "taskInventoryJson" JSONB NOT NULL,
    "systemsMapJson" JSONB NOT NULL,
    "exceptionTaxonomyJson" JSONB NOT NULL,
    "controlsMapJson" JSONB NOT NULL,
    "invisibleWorkJson" JSONB NOT NULL,
    "automationOpportunitiesJson" JSONB NOT NULL,
    "impactJson" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExtractionArtifact_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExtractionArtifact_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ExtractionArtifact_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "Transcript" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutputDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "engagementId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OutputDocument_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutputVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "outputDocumentId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "markdown" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "generatedFromJson" JSONB,
    "createdByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "approvedAt" DATETIME,
    "approvedByUserId" TEXT,
    CONSTRAINT "OutputVersion_outputDocumentId_fkey" FOREIGN KEY ("outputDocumentId") REFERENCES "OutputDocument" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PlanningArtifact_engagementId_createdAt_idx" ON "PlanningArtifact"("engagementId", "createdAt");

-- CreateIndex
CREATE INDEX "ResearchBrief_engagementId_createdAt_idx" ON "ResearchBrief"("engagementId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewSession_pinHash_key" ON "InterviewSession"("pinHash");

-- CreateIndex
CREATE INDEX "InterviewSession_engagementId_createdAt_idx" ON "InterviewSession"("engagementId", "createdAt");

-- CreateIndex
CREATE INDEX "InterviewCall_sessionId_createdAt_idx" ON "InterviewCall"("sessionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Transcript_webhookReceiptId_key" ON "Transcript"("webhookReceiptId");

-- CreateIndex
CREATE INDEX "Transcript_sessionId_createdAt_idx" ON "Transcript"("sessionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookReceipt_provider_eventKey_key" ON "WebhookReceipt"("provider", "eventKey");

-- CreateIndex
CREATE INDEX "ExtractionArtifact_engagementId_createdAt_idx" ON "ExtractionArtifact"("engagementId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OutputDocument_engagementId_type_key" ON "OutputDocument"("engagementId", "type");

-- CreateIndex
CREATE INDEX "OutputVersion_outputDocumentId_createdAt_idx" ON "OutputVersion"("outputDocumentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OutputVersion_outputDocumentId_versionNumber_key" ON "OutputVersion"("outputDocumentId", "versionNumber");
