import { describe, expect, test } from "vitest";
import { parseTranscriptWebhookPayload } from "@/lib/elevenlabs/payloads";

describe("parseTranscriptWebhookPayload", () => {
  test("normalizes explicit event id and transcript fields", () => {
    const parsed = parseTranscriptWebhookPayload({
      event_id: "evt_123",
      type: "conversation.completed",
      data: {
        session_id: "session_abc",
        pin: "123456",
        transcript: "We processed 42 invoices today.",
      },
    });

    expect(parsed).toEqual({
      eventKey: "evt_123",
      sessionId: "session_abc",
      pin: "123456",
      transcriptText: "We processed 42 invoices today.",
    });
  });

  test("builds fallback event key when event_id missing", () => {
    const parsed = parseTranscriptWebhookPayload({
      type: "conversation.completed",
      timestamp: "2026-03-06T00:00:00Z",
      data: {
        session_id: "session_xyz",
        transcript: "Transcript body",
      },
    });

    expect(parsed.eventKey).toBe(
      "conversation.completed:2026-03-06T00:00:00Z:session_xyz",
    );
  });
});
