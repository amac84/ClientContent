import { z } from 'zod';

export const engagementInsertSchema = z.object({
  client_name: z.string().min(1),
  objective: z.string().optional()
});

export const interviewSessionInsertSchema = z.object({
  engagement_id: z.string().uuid(),
  staff_name: z.string().min(1),
  staff_role: z.string().optional(),
  pin: z.string().min(4).max(6)
});

export const elevenWebhookSchema = z.object({
  event_type: z.string(),
  conversation_id: z.string().optional(),
  transcript: z.string().optional(),
  pin: z.string().optional(),
  payload: z.unknown().optional()
});
