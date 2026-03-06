import { OutputType } from "@prisma/client";
import { PlanningPayload } from "@/lib/schemas/planning";
import { ExtractionPayload } from "@/lib/schemas/extraction";

type GenerationContext = {
  clientName: string;
  objective?: string | null;
  researchBrief?: string | null;
  planning?: PlanningPayload | null;
  extractions: ExtractionPayload[];
};

function flattenOpportunityLines(extractions: ExtractionPayload[]) {
  return extractions
    .flatMap((item) => item.automationOpportunities)
    .slice(0, 4)
    .map((opp) => `- **${opp.opportunity}** (impact: ${opp.impact}, effort: ${opp.effort})`)
    .join("\n");
}

function aggregateImpact(extractions: ExtractionPayload[]) {
  const impactNotes = extractions.map((item) => item.impact.hoursPerWeekSaved);
  return impactNotes.length > 0 ? impactNotes.join(", ") : "Not enough data yet";
}

export function generateDraftMarkdown(type: OutputType, context: GenerationContext): string {
  const deliverables = context.planning?.deliverables?.join(", ") || "Client update, automation memo";
  const measurementFocus =
    context.planning?.measures?.slice(0, 5).map((m) => `- ${m}`).join("\n") ||
    "- Volumes\n- Time per task\n- Exception rates";
  const opportunities = flattenOpportunityLines(context.extractions) || "- Awaiting transcript-derived opportunities";
  const impactRange = aggregateImpact(context.extractions);

  if (type === "CLIENT_UPDATE") {
    return `# Client Update: ${context.clientName}

## Objective
${context.objective ?? "Objective pending."}

## Workload visibility highlights
- Deliverables target from planning: ${deliverables}
- Estimated hours/week currently represented in interviews: ${impactRange}

## Evidence captured so far
${measurementFocus}

## Early automation angle (non-salesy)
${opportunities}

## Next step
- Continue interviews and refresh this update automatically as new transcripts arrive.
`;
  }

  if (type === "AUTOMATION_MEMO") {
    return `# Automation Opportunity Memo: ${context.clientName}

## Framing
This memo synthesizes planning intent, interview extraction, and company context to prioritize automation opportunities.

## Priority opportunities
${opportunities}

## ROI framing
- Time savings estimate trend: ${impactRange}
- Risk reduction: control and approval consistency gains expected from standardization and workflow automation.

## Dependencies
- Confirm systems access and data ownership
- Validate approval policy edge cases
- Sequence quick wins before strategic platform changes

## Recommended next steps
1. Pilot one high-frequency process with measurable baseline.
2. Implement exception queue and SLA tracking.
3. Re-baseline cycle times after 30 days.
`;
  }

  return `# Testimonial Draft Seed: ${context.clientName}

${context.clientName} engaged Treewalk to surface hidden workload and identify practical automation opportunities grounded in real operational evidence.

## Signals captured
- Team members described manual rework, context switching, and approval bottlenecks.
- Early analysis indicates ${impactRange} hours/week of recoverable capacity.

## Outcome narrative (draft)
Treewalk translated day-to-day finance operations into quantified, executive-ready insights and a practical roadmap of automations that improve throughput while strengthening control quality.

## Supporting context
${context.researchBrief?.slice(0, 400) ?? "Research brief not yet available."}
`;
}
