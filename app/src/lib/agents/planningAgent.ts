import { PlanningPayload, planningSchema } from "@/lib/schemas/planning";

const defaultPlan: PlanningPayload = {
  deliverables: ["Client update", "Automation memo"],
  measures: [
    "Monthly invoice volume",
    "Minutes per reconciliation task",
    "Exception rates",
    "Close calendar spikes",
  ],
  systemsToProbe: ["ERP", "Excel", "SharePoint", "Email approvals", "Client portals"],
  suggestedInterviewOutline: [
    "Walk me through yesterday hour-by-hour",
    "What recurring AP/AR/close/reporting tasks do you own?",
    "What systems and handoffs are involved?",
    "Where do exceptions and rework happen?",
    "Which controls require evidence, and where is it stored?",
    "What feels broken and what works well?",
    "What should be automated first and why?",
  ],
  downstreamJobs: [
    "Extract structured task inventory",
    "Calculate impact and automation opportunities",
    "Generate client update + automation memo",
  ],
};

export function buildPlanningSuggestion(objective?: string) {
  return planningSchema.parse({
    ...defaultPlan,
    deliverables: objective?.toLowerCase().includes("testimonial")
      ? [...defaultPlan.deliverables, "Testimonial draft"]
      : defaultPlan.deliverables,
  });
}
