import 'server-only';

export async function runExtraction(transcript: string) {
  return {
    work_map_json: { summary: transcript.slice(0, 400) },
    impact_json: { impact: 'Stub impact extraction' },
    opportunities_json: { opportunities: ['Stub opportunity'] }
  };
}
