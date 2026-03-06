# Treewalk Engagement Workflow App

This app implements the engagement process flow:

1. Clerk Microsoft login + protected routes
2. Engagement creation
3. Planning artifact persistence
4. Research brief persistence
5. Interview session creation + unique PIN generation
6. Twilio PIN validation and deterministic session routing
7. ElevenLabs transcript webhook ingest + idempotency
8. Transcript-triggered extraction into structured facts
9. Extraction-triggered output draft generation
10. Output review/edit/version/approve in UI

## Tech stack

- Next.js App Router + TypeScript
- Clerk auth
- Prisma + SQLite
- Twilio Voice TwiML endpoints
- ElevenLabs webhook adapter
- Vitest for focused unit/integration tests

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment file:

```bash
cp .env.example .env
```

3. Run migrations:

```bash
npx prisma migrate dev
```

4. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Running tests

```bash
npm test
npm run lint
npm run build
```

## API endpoints

### Twilio voice

- `POST /api/twilio/voice`
  - Returns TwiML prompt asking for 6-digit PIN.
- `POST /api/twilio/voice/validate-pin`
  - Validates PIN hash lookup and stores interview call routing context.

### ElevenLabs transcript webhook

- `POST /api/webhooks/elevenlabs`
  - Expected payload shape:
    ```json
    {
      "event_id": "evt_001",
      "type": "conversation.completed",
      "data": {
        "session_id": "session_cuid",
        "pin": "123456",
        "transcript": "..."
      }
    }
    ```
  - Uses `event_id` (or fallback key) for idempotency.
  - Duplicate webhook retries return `duplicate_ignored`.

### Rerun pipeline endpoints

- `POST /api/engagements/:engagementId/rerun-extraction`
- `POST /api/engagements/:engagementId/rerun-outputs`

Both require authenticated actor access to the engagement org scope.

## Explicit behavior policies

- **PIN routing:** only validated PIN hash maps to session (no phone-number guessing).
- **Webhook idempotency:** unique receipt key by provider+eventKey prevents duplicates.
- **Partial completion:** outputs regenerate after each transcript arrival using all currently available extraction artifacts.
- **Separation of concerns:** transcript storage, extraction artifacts, and output generation are separate persisted layers so pipeline can be rerun safely.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
