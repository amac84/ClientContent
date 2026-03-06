import { z } from "zod";

export const taskInventoryItemSchema = z.object({
  taskName: z.string(),
  area: z.string(),
  frequency: z.string(),
  volume: z.string(),
  timePerTask: z.string(),
});

export const extractionSchema = z.object({
  taskInventory: z.array(taskInventoryItemSchema),
  systemsMap: z.array(z.object({ taskName: z.string(), systems: z.array(z.string()) })),
  exceptionTaxonomy: z.array(z.object({ type: z.string(), frequency: z.string() })),
  controlsMap: z.array(z.object({ control: z.string(), evidenceLocation: z.string() })),
  invisibleWork: z.array(z.string()),
  automationOpportunities: z.array(
    z.object({
      opportunity: z.string(),
      impact: z.string(),
      effort: z.string(),
      dependencies: z.array(z.string()),
    }),
  ),
  impact: z.object({
    hoursPerWeekSaved: z.string(),
    cycleTimeReduction: z.string(),
    riskReduction: z.string(),
  }),
});

export type ExtractionPayload = z.infer<typeof extractionSchema>;
