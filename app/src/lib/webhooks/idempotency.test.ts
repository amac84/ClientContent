import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, test, vi } from "vitest";

const createMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    webhookReceipt: {
      create: (...args: unknown[]) => createMock(...args),
    },
  },
}));

import { reserveWebhookReceipt } from "@/lib/webhooks/idempotency";

describe("reserveWebhookReceipt", () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  test("creates new receipt and returns non-duplicate", async () => {
    createMock.mockResolvedValue({
      id: "receipt_1",
      provider: "elevenlabs",
      eventKey: "evt_1",
    });

    const result = await reserveWebhookReceipt("elevenlabs", "evt_1", {
      hello: "world",
    });

    expect(result.isDuplicate).toBe(false);
    expect(result.receipt?.id).toBe("receipt_1");
  });

  test("returns duplicate for unique constraint conflicts", async () => {
    const duplicateError = new Prisma.PrismaClientKnownRequestError("duplicate", {
      code: "P2002",
      clientVersion: "test",
    });
    createMock.mockRejectedValue(duplicateError);

    const result = await reserveWebhookReceipt("elevenlabs", "evt_1", {
      hello: "world",
    });

    expect(result).toEqual({
      isDuplicate: true,
      receipt: null,
    });
  });
});
