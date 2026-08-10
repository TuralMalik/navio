# Navio

Azerbaijani-language consumer finance platform. Navio is **not a bank**: it issues no
credit and guarantees no approval. Everything it produces is a preliminary estimate.

Three products:

- **Kredit yoxlaması** (`/az/kredit-yoxlama`) — pre-application credit-chance scoring,
  Bank and BOKT (non-bank lender) modes, with a detailed report at `/analiz`
- **Kalkulyatorlar** (`/az/calculators`) — consumer loan, mortgage and auto loan, with
  amortisation schedules, extra-payment simulation and EAR / FİFD
- **Maliyyə köməkçisi** (`/az/financial-assistant`) — knowledge base with search

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind v4 · TypeScript strict ·
Better Auth · Drizzle ORM on Neon Postgres · deployed on Vercel

## Deploying

**See [`docs/PRODUCTION_SETUP.md`](docs/PRODUCTION_SETUP.md)** for the full setup:
database, environment variables, Google sign-in and email. It is written to be
followed in a browser, with each step marked for whether it needs a human or can be
done by an agent.

The database schema applies itself on deploy — `vercel-build` runs
`scripts/migrate.mjs` before `next build`.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

`.env.example` documents every variable. At minimum you need `DATABASE_URL` and
`BETTER_AUTH_SECRET`; Google sign-in and email are optional and degrade cleanly when
their keys are absent.

Do **not** wrap `next dev` in `dotenv-cli`. Next loads `.env.local` itself, and
pre-loading it exports empty variables that Next then refuses to override — which
silently disables Google sign-in. `dotenv -e .env.local` is only needed for
`drizzle-kit`, which does not read env files.

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate a migration after changing `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Browse the database |

## Architecture notes

**Scoring never runs in the browser.** `src/lib/server/scoring.ts` is the single source
of scoring logic and is marked `server-only`, so thresholds, block weights, caps and
rate tables cannot reach the client bundle — the build fails if anything imports it
from a client component. The browser receives only the presentation payload defined in
`src/lib/score-contract.ts`: ready-made labels, levels and texts, never a threshold.
Keep that boundary when editing result UI.

Scoring is exposed through `POST /api/score` and `GET /api/score/[id]/analysis`. Both
are rate limited and validate input server-side. The detailed report requires an
account; the score itself, hard stops and debt-burden figures are free.

`src/lib/utils.ts` deliberately avoids `Intl` and uses non-breaking spaces: `Intl`
caused hydration mismatches, and normal spaces let currency values wrap mid-number on
mobile.

Annuity maths lives only in `src/lib/calculators/annuity.ts`. Scoring and every
calculator use it.
