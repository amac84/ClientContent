import 'server-only';

export async function runPlanner(objective: string) {
  return { objective, milestones: [], risks: [] };
}
