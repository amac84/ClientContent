import { beforeEach, describe, expect, test, vi } from "vitest";

const findSessionMock = vi.fn();
const findPlanMock = vi.fn();
const findBriefMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    interviewSession: {
      findUnique: (...args: unknown[]) => findSessionMock(...args),
    },
    planningArtifact: {
      findFirst: (...args: unknown[]) => findPlanMock(...args),
    },
    researchBrief: {
      findFirst: (...args: unknown[]) => findBriefMock(...args),
    },
  },
}));

import { buildInterviewContext } from "@/lib/interview/contextBuilder";

describe("buildInterviewContext", () => {
  beforeEach(() => {
    findSessionMock.mockReset();
    findPlanMock.mockReset();
    findBriefMock.mockReset();
  });

  test("includes objective, planning, and research context", async () => {
    findSessionMock.mockResolvedValue({
      id: "session_1",
      engagementId: "eng_1",
      participantName: "Controller A",
      engagement: {
        clientName: "Quarterhill",
        objective: "Quantify workload and automation opportunities",
      },
    });
    findPlanMock.mockResolvedValue({
      planJson: {
        measures: ["Volume", "Minutes per task"],
        systemsToProbe: ["ERP", "Excel"],
        suggestedInterviewOutline: ["Yesterday hour-by-hour"],
      },
    });
    findBriefMock.mockResolvedValue({
      briefMarkdown: "Quarterhill context brief",
    });

    const context = await buildInterviewContext("session_1");

    expect(context.objective).toContain("automation");
    expect(context.whatToMeasure).toEqual(["Volume", "Minutes per task"]);
    expect(context.systemsToProbe).toEqual(["ERP", "Excel"]);
    expect(context.interviewOutline).toEqual(["Yesterday hour-by-hour"]);
    expect(context.researchBrief).toContain("Quarterhill context brief");
  });
});
