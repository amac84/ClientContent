import { describe, expect, test } from "vitest";
import { extractStructuredFacts } from "@/lib/agents/extractorAgent";
import { generateDraftMarkdown } from "@/lib/agents/generatorAgent";

describe("extraction + generation pipeline", () => {
  test("extractor returns populated structured sections", () => {
    const extraction = extractStructuredFacts(
      "I reconcile AP each day. I use ERP and Excel. We chase approvals in email.",
    );

    expect(extraction.taskInventory.length).toBeGreaterThan(0);
    expect(extraction.automationOpportunities.length).toBeGreaterThan(0);
    expect(extraction.impact.hoursPerWeekSaved).toBeTruthy();
  });

  test("generator includes objective and opportunities in client update", () => {
    const extraction = extractStructuredFacts(
      "Close week has lots of exceptions. Manual rework takes hours.",
    );

    const markdown = generateDraftMarkdown("CLIENT_UPDATE", {
      clientName: "Quarterhill",
      objective: "Make workload visible and propose automation",
      planning: null,
      researchBrief: null,
      extractions: [extraction],
    });

    expect(markdown).toContain("Quarterhill");
    expect(markdown).toContain("Make workload visible and propose automation");
    expect(markdown).toContain("automation");
  });
});
