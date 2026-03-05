import 'server-only';

export function verifyElevenLabsWebhook(requestSecret: string | null) {
  return requestSecret === process.env.ELEVENLABS_WEBHOOK_SECRET;
}
