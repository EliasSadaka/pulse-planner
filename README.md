# PulsePlanner

PulsePlanner is an Event Scheduler application built for assessment scoring with practical product polish:
- Event creation/edit/delete
- RSVP status tracking (`attending`, `maybe`, `declined`)
- Invite-link based collaboration
- Search and filtering
- AI-assisted scheduling workflows

## Stack

- Next.js App Router + TypeScript
- Supabase Auth + Postgres + RLS
- Render deployment (`render.yaml`)

## Features Mapped to Requirements

1. **Event management**
   - Create/edit/delete events with title, date/time, location, description, timezone, and public visibility.
2. **Status tracking**
   - RSVP per user with `attending`, `maybe`, `declined`.
   - Attendance counts displayed on event details.
3. **Search/filter**
   - Full-text style filter (title/description/location).
   - Date range and location filters.
   - Scope filters (my, invited, going, maybe, declined).
4. **User accounts**
   - Supabase Auth login/signup.
   - Profile page for display name.
5. **Invitation capability**
   - Event creator generates secure tokenized invite links.
   - Invitee can claim link and auto-add event attendance.
   - Pre-registration invite support via invitee email tracking.
6. **AI features**
   - Description enhancer.
   - Conflict checker.
   - Invite message generator.
   - All AI endpoints degrade gracefully when `AI_API_KEY` is missing.

## Project Structure

- `src/app` — pages + route handlers
- `src/components` — reusable UI and feature components
- `src/lib` — env, auth, Supabase clients, schemas, AI utilities
- `supabase/schema.sql` — schema, enums, indexes, RLS policies
- `supabase/seed.sql` — optional local seed flow
- `render.yaml` — Render deployment config

## Environment Variables

Copy `.env.example` to `.env.local` and fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_API_KEY=              # optional
AI_MODEL=gpt-4o-mini
APP_URL=http://localhost:3000
```

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create Supabase project.
3. Run SQL from `supabase/schema.sql` in Supabase SQL editor.
4. (Optional) Run `supabase/seed.sql` for sample data.
5. Configure `.env.local`.
6. Start app:
   ```bash
   npm run dev
   ```

## Running and Testing

- Lint:
  ```bash
  npm run lint
  ```
- Build:
  ```bash
  npm run build
  ```

### Smoke Test Flow

1. Sign up / log in.
2. Create event from dashboard.
3. Open event details and generate invite link.
4. Open invite link and claim invite from another account.
5. RSVP from invited account.
6. Use search filters.
7. Use AI actions:
   - Enhance description
   - Conflict check
   - Generate invite message

## Deployment (Render)

1. Connect repository in Render.
2. Render auto-detects `render.yaml`.
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AI_API_KEY` (optional)
   - `AI_MODEL`
   - `APP_URL` (Render service URL)
4. Deploy.
5. Run post-deploy smoke tests above.

## Live URL

- Production: `TBD`

## Tradeoffs and Future Improvements

- Invite delivery is link-based only (no transactional email provider).
- Rate limiting is lightweight in API; production can add durable Redis-backed throttling.
- AI provider integration is minimal and prompt-based; future work can add model routing and richer telemetry.
- Add integration tests (Playwright) and SQL policy tests for deeper confidence.
