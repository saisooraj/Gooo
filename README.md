# Gooo — Vacation Planner

Plan vacations intelligently by combining leave balance, company holidays,
weekends, and transport booking windows — deterministically, no AI. React 19
+ TypeScript + Firebase + Vite, installable as a PWA.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Firebase web app config
npm run dev
```

You'll need a Firebase project with **Google** sign-in enabled under
Authentication, and **Firestore** + **Storage** enabled. See
`.claude/progress.md` for the full setup checklist and current build status.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the unit test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with oxlint |
| `npm run format` | Format with Prettier |

## Firestore rules & indexes

```bash
firebase login
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## Architecture

Feature-based modules under `src/modules/<feature>`, each with its own
`components/`, `hooks/`, `api/` (Firestore repositories), `lib/` (pure
business logic) and `types/`. The recommendation engine
(`src/modules/recommendations/lib/engine.ts`) is fully deterministic and
unit-tested; an AI layer can later plug into
`RecommendationExplainer` to rewrite explanations without ever touching how
recommendations are calculated.
