import { z } from "zod";

const transcriptWebhookSchema = z.object({
  event_id: z.string().optional(),
  type: z.string().default("conversation.completed"),
  timestamp: z.string().optional(),
  data: z.object({
    session_id: z.string().optional(),
    pin: z.string().optional(),
    transcript: z.string().default(""),
  }),
});

export type NormalizedTranscriptEvent = {
  eventKey: string;
  sessionId?: string;
  pin?: string;
  transcriptText: string;
};

export function parseTranscriptWebhookPayload(payload: unknown): NormalizedTranscriptEvent {
  const parsed = transcriptWebhookSchema.parse(payload);
  return {
    eventKey:
      parsed.event_id ??
      `${parsed.type}:${parsed.timestamp ?? "no-timestamp"}:${parsed.data.session_id ?? parsed.data.pin ?? "unknown"}`,
    sessionId: parsed.data.session_id,
    pin: parsed.data.pin,
    transcriptText: parsed.data.transcript,
  };
}
