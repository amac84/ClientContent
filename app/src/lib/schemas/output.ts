import { z } from "zod";

export const outputTypeSchema = z.enum([
  "CLIENT_UPDATE",
  "AUTOMATION_MEMO",
  "TESTIMONIAL_DRAFT",
]);

export type OutputTypeValue = z.infer<typeof outputTypeSchema>;
