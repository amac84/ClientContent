/*
  Warnings:

  - Added the required column `pinCode` to the `InterviewSession` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InterviewSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "engagementId" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "pinPreview" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InterviewSession_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InterviewSession" ("createdAt", "engagementId", "id", "participantName", "pinHash", "pinPreview", "status", "updatedAt") SELECT "createdAt", "engagementId", "id", "participantName", "pinHash", "pinPreview", "status", "updatedAt" FROM "InterviewSession";
DROP TABLE "InterviewSession";
ALTER TABLE "new_InterviewSession" RENAME TO "InterviewSession";
CREATE UNIQUE INDEX "InterviewSession_pinHash_key" ON "InterviewSession"("pinHash");
CREATE INDEX "InterviewSession_engagementId_createdAt_idx" ON "InterviewSession"("engagementId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
