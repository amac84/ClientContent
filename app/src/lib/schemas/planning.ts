import { z } from "zod";

export const planningSchema = z.object({
  deliverables: z.array(z.string()).default([]),
  measures: z.array(z.string()).default([]),
  systemsToProbe: z.array(z.string()).default([]),
  suggestedInterviewOutline: z.array(z.string()).default([]),
  downstreamJobs: z.array(z.string()).default([]),
});

export type PlanningPayload = z.infer<typeof planningSchema>;
