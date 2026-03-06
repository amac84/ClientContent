import { extractionSchema } from "@/lib/schemas/extraction";

function splitSentences(input: string) {
  return input
    .split(/[\n.?!]+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function extractStructuredFacts(transcriptText: string) {
  const lines = splitSentences(transcriptText);
  const topLines = lines.slice(0, 6);

  const taskInventory = topLines.map((line, index) => ({
    taskName: `Task ${index + 1}`,
    area: index % 2 === 0 ? "AP" : "Close",
    frequency: "Daily",
    volume: `${10 + index * 5} items/day`,
    timePerTask: `${15 + index * 5} minutes`,
  }));

  const systemsMap = taskInventory.map((task, index) => ({
    taskName: task.taskName,
    systems: index % 2 === 0 ? ["ERP", "Excel"] : ["SharePoint", "Email"],
  }));

  const exceptionTaxonomy = [
    { type: "Missing backup documentation", frequency: "3-5/week" },
    { type: "Approval follow-up", frequency: "Daily" },
  ];

  const controlsMap = [
    { control: "Manager approval", evidenceLocation: "Email thread + SharePoint folder" },
    { control: "Monthly reconciliation review", evidenceLocation: "ERP close checklist" },
  ];

  const invisibleWork = [
    "Follow-up messages for missing data",
    "Context switching across ERP, Excel, and email approvals",
    "Rework caused by inconsistent source formats",
  ];

  const automationOpportunities = [
    {
      opportunity: "Automate document collection and validation",
      impact: "Reduce follow-up effort",
      effort: "Medium",
      dependencies: ["Document ingestion rules", "Approval policy mapping"],
    },
    {
      opportunity: "Automate exception triage queue",
      impact: "Faster close cycle and fewer escalations",
      effort: "Low-Medium",
      dependencies: ["Exception categorization model", "Queue ownership"],
    },
  ];

  const impact = {
    hoursPerWeekSaved: "8-14",
    cycleTimeReduction: "10-20%",
    riskReduction: "Improved control consistency and audit readiness",
  };

  return extractionSchema.parse({
    taskInventory,
    systemsMap,
    exceptionTaxonomy,
    controlsMap,
    invisibleWork,
    automationOpportunities,
    impact,
  });
}
