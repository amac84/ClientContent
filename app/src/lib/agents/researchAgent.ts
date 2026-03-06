export function buildResearchBrief(clientName: string, objective?: string) {
  const objectiveLine = objective
    ? `Interview objective context: ${objective}`
    : "No objective was provided yet.";

  return `# ${clientName} Context Brief

## Company snapshot
- ${clientName} appears to operate as a multi-segment business with finance and operations handoffs that likely rely on ERP + spreadsheet workflows.
- Focus the interview on who owns AP, AR, close, reporting, and treasury touchpoints.

## Interview context
- ${objectiveLine}
- Ask for concrete volumes, cycle-time metrics, exception counts, and approval evidence locations.

## Suggested probes
1. What changed recently in finance operations (org, tooling, process)?
2. Which monthly close windows create highest stress?
3. Where is manual rework or duplicate data entry currently unavoidable?
4. Which approvals bottleneck throughput and why?

## Notes
- This is an auto-generated public-info brief intended to prepare the interviewer before calls.
`;
}
