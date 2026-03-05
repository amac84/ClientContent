import 'server-only';

type Synthesis = { client_update: string; automation_memo: string; proposal_addon: string };

export async function runSynthesizers(transcript: string): Promise<Synthesis> {
  return {
    client_update: `# Client Update\n\nTranscript summary:\n\n${transcript.slice(0, 500)}`,
    automation_memo: `# Automation Memo\n\nCandidate opportunities based on interview.`,
    proposal_addon: `# Proposal Add-on\n\nOptional add-on recommendations.`
  };
}
