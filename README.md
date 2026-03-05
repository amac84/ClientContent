# Treewalk Phone Interview -> Transcript -> Client Outputs

MVP scaffold using Next.js App Router + Clerk + Supabase + ElevenLabs + Twilio.

## Setup

1. Copy `.env.example` to `.env.local` and fill all values.
2. Install dependencies: `npm install`.
3. Run migrations in Supabase SQL editor:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_rls.sql`
4. Configure Clerk Microsoft OAuth and route protection.
5. In ElevenLabs, connect your Twilio number via native integration and set webhook URL to:
   - `POST /api/webhooks/elevenlabs` with header `x-elevenlabs-secret`.
6. Optional tool callback for PIN validation:
   - `POST /api/webhooks/elevenlabs/validate-pin` with JSON `{ "pin": "1234" }`.

## Flow

- Internal staff sign in with Clerk.
- Staff create engagements and interview sessions with PINs.
- Phone interview runs in ElevenLabs over Twilio number.
- Webhook stores transcript, runs extraction + draft synthesis, writes outputs to Supabase.
