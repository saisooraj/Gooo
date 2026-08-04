# Gooo — Build Progress

Last updated: 2026-07-29

This file tracks what's been built so a new session (or a new Claude
instance with no memory of this one) can pick up exactly where things left
off. Update it whenever a milestone finishes or the plan changes.

## Status: V1 feature-complete, connected to a real Firebase project

Firebase project `gooo-fac3b` is live: Google sign-in enabled, Firestore
enabled, `.env.local` filled in with real config, `firestore.rules` +
`firestore.indexes.json` deployed via the Firebase CLI. Storage is **not**
set up yet (needs a manual "Get Started" click in the console) — fine, it's
reserved for V2 document uploads, not used in V1.

## Recent fixes

- **IRCTC advance reservation period corrected 120 → 60 days.**
  `DEFAULT_ADVANCE_RESERVATION_DAYS` (`src/constants/transport.ts`) was wrong;
  verified against real IRCTC behavior (booking opens exactly 60 days before
  journey). All fallback references updated to the shared constant.
- **Recommendation engine gained a "sandwich" pattern.** It previously could
  only bridge leave from *one side* of an off-day block (prefix/suffix of a
  single workday run) — it had no way to represent "take Thursday **and**
  Monday to sandwich a Friday holiday" into one longer break, since those two
  leave days belong to two different workday runs. Added
  `findSandwichBlocks` in `engine.ts` (tested) to cover this — a genuinely
  common, efficient real-world pattern.
- **Transport booking fields completed.** `demand` (train) and the
  Flight-specific (`airline`, `flightNumber`) / Bus-specific (`operator`,
  `busNumber`) fields existed in the data model but had no form inputs at
  all — silently collapsed into one shared "notes" box. Now every field on
  every collection is reachable through its edit form.
- **Import/export extended to cover `tripBookings`** (previously only
  leaveBalances/holidays/trips/tripPreferences). Bookings reference their
  trip via a `tripRef` pointing at the trip's `_ref` (its pre-import id) —
  necessary because import always mints fresh Firestore ids, so a live
  `tripId` captured at export time would be stale on any reimport. See
  `src/modules/settings/lib/dataPortability.ts`.
- **`LeaveBalance.openingBalance` can now be negative.** Needed for
  mid-year-snapshot entries (see below) where the true Jan-1 opening/used
  history isn't tracked — the value becomes a plug so today's computed
  balance matches reality. Not a display bug; documented inline.
- **Analytics/Dashboard leave math was corrected** (was mathematically wrong
  before this fix). The old `computeAnalytics` summed
  `openingBalance + monthlyCredit * 12 + carryForward` as "Total Leave" —
  i.e. it treated leave that hasn't accrued yet as already available, and it
  never distinguished a *planned* trip (leave not yet taken) from *consumed*
  leave. Rewritten around four concepts: **Current Balance** (accrued only
  up to today), **Projected Year-End Balance** (accrued as if all 12 months
  land), **Reserved Leave** (workday-cost of Planning/Booked trips — held,
  not spent), **Consumed Leave** (the leave ledger's own `leaveUsed` field —
  the only source of "already used," never derived from trips). Derived:
  **Balance After Planned Trips** = Projected − Reserved. New shared helper
  `src/modules/shared/lib/dayBreakdown.ts` (`classifyDateRange`) computes a
  trip's actual leave cost by excluding weekend/holiday days from its span.
  Both `AnalyticsPage` and `DashboardPage` were updated to surface these
  (Dashboard shows the 6 KPIs: Current Balance, Projected Balance, Reserved,
  Balance After Planned Trips, Vacation Efficiency, Upcoming Booking Dates).
  15 new tests lock in the corrected semantics
  (`computeAnalytics.test.ts`, `dayBreakdown.test.ts`) — 76 tests total now.

Everything below is implemented, typechecked (`tsc -b`), unit-tested
(`vitest`), and production-builds cleanly (`npm run build`). It has **not**
been run in a browser against real Firebase credentials yet — that's the
next step, and it's on the user (see "What's left" below).

## Tech stack actually installed

React 19.2, TypeScript (strict), Vite 8, Tailwind CSS v4 (via `@tailwindcss/vite`,
CSS-first `@theme` config — no `tailwind.config.js`), Firebase JS SDK v12
(Auth + Firestore + Storage), TanStack Query v5, React Router v7 (data
router / `createBrowserRouter`), Zustand v5 (auth state only — most server
state goes through TanStack Query instead), Zod v4, React Hook Form v7 +
`@hookform/resolvers`, Day.js, `vite-plugin-pwa`, Vitest + Testing Library,
Prettier, oxlint (the linter the Vite template ships with — not ESLint).

## What's implemented

### Architecture / core
- Feature-based structure under `src/modules/<feature>/{components,hooks,api,lib,types}`.
- `src/firebase/` — `config.ts` (env-driven init), `auth.ts`, `firestore.ts`,
  `storage.ts`, `repository.ts` (generic `FirestoreRepository<T>` — repository
  pattern: create/update/remove/getById/listByUser/subscribeByUser, all
  scoped by `userId`).
- `src/hooks/createCollectionHooks.ts` — generates the standard
  list/create/update/remove TanStack Query hooks for any repository; every
  module's `hooks/` folder is a thin instantiation of this, not duplicated logic.
- `src/utils/date.ts` — centralized date utilities on Day.js, `DateKey`
  (`YYYY-MM-DD` string) as the canonical date type everywhere, configurable
  `WeekendConfig` (Sat/Sun, Fri/Sat, Sun-only presets), leap-year-safe.
- `firestore.rules` / `firestore.indexes.json` / `storage.rules` /
  `firebase.json` — security rules enforce `request.auth.uid ==
  resource.data.userId` on every collection, deny-by-default fallback rule.
  **Not yet deployed** — needs `firebase deploy --only firestore,storage`
  once a real project exists (see below).
- `src/services/notifications/` — channel-agnostic dispatcher interface
  (email/push/SMS/WhatsApp/calendar), wired to no-op adapters in V1 per spec
  ("architecture only, no real delivery in V1").

### Recommendation engine (the deterministic core)
- `src/modules/recommendations/lib/dayClassifier.ts` — classifies every day
  of a year as holiday/weekend/workday.
- `src/modules/recommendations/lib/engine.ts` — `createDeterministicRecommendationEngine()`.
  Algorithm: finds every maximal run of consecutive workdays, and for each
  amount of leave from 1..maxContinuousLeaveDays considers taking the
  prefix or suffix of that run (e.g. just the Friday of a work week),
  greedily extending through adjacent holidays/weekends for free. Also
  separately surfaces zero-leave holiday+weekend blocks. Filters by
  available leave and excluded (already-booked) dates, scores, sorts.
- `src/modules/recommendations/lib/scoring.ts` — efficiency-weighted score
  with a penalty for continuous leave beyond 3 days.
- `src/modules/shared/lib/efficiency.ts` — `computeEfficiency` (days off /
  leave used → star rating), shared by leaves + recommendations so
  recommendations doesn't depend on the leaves module.
- `src/modules/recommendations/lib/explainer.ts` — `RecommendationExplainer`
  interface + deterministic default impl. **This is the AI-readiness seam**:
  a future AI layer implements the same interface to rewrite `reason` in a
  more conversational tone — it must never recompute scores/dates.
- Fully unit tested against the spec's exact priority rules (holiday+weekend
  free block, Friday/Monday bridge, holiday+Thu/Fri+weekend bridge),
  determinism, leap years, custom weekend definitions, leave/exclusion
  constraints. 76 tests total across the whole app, all passing.

### Leave / booking math (also pure + tested)
- `src/modules/leaves/lib/leaveCalculations.ts` — accrual, remaining
  balance, carry-forward capping, expiry check.
- `src/modules/transport/lib/bookingWindow.ts` — booking-open/close window
  from advance reservation period, reminder level (book today / tomorrow /
  this week / already missed / booked), demand heuristic (placeholder,
  documented as easy to replace).

### Every module has a working UI (list + create/edit via a bottom `Sheet` + delete)
Dashboard, Leaves, Holidays, Trips, Transport, Recommendations ("For You"),
Calendar (month grid, color-coded per the spec's legend), Analytics, Settings
(travel preferences + weekend/app settings + JSON export/import for backup —
no personal data is seeded, accounts start empty per spec).

### Auth
Google sign-in only (per spec, email/Apple/Microsoft are future). Zustand
store + `AuthProvider` (subscribes to Firebase auth state) + `RequireAuth`
/ `RequireGuest` route guards. First sign-in creates a `users/{uid}` profile doc.

### UI / UX
Shared component kit in `src/components/ui/` (Button, Card, Badge, Spinner,
StarRating, EmptyState, Field/Input/Select, Icon — hand-rolled SVG icon set,
no icon package dependency, Sheet — mobile-native bottom sheet used for
every form on every breakpoint for consistency). Desktop: fixed sidebar nav.
Mobile: bottom tab bar (Dashboard/Trips/For You/Calendar + "More" sheet for
the rest) + top bar, safe-area insets for notched devices, PWA manifest +
service worker (`vite-plugin-pwa`, `autoUpdate`), hand-generated (dependency-free
script, not committed) PNG icon set at `public/icons/` + `apple-touch-icon.png`
+ `favicon.svg`, all matching the brand-blue suitcase mark.

### Deployment target
Per the user's explicit instruction this conversation, **Vercel**, not
Firebase Hosting (the original spec said Firebase Hosting, but the live
conversation overrides that — `firebase.json` only configures Firestore/Storage
rules, not hosting). `vercel.json` has the SPA rewrite already.

## What's left / next steps (for the user, in order)

1. ~~Create a Firebase project, enable Google sign-in, enable Firestore~~ — **done** (`gooo-fac3b`).
2. ~~Fill in `.env.local` with real Firebase config~~ — **done**.
3. ~~Update `.firebaserc` with the real project id~~ — **done**.
4. ~~Install `firebase-tools`, log in, deploy Firestore rules/indexes~~ — **done**.
   Storage rules are not deployed yet — Storage itself isn't enabled in the
   console (needs a manual "Get Started" click at
   console.firebase.google.com/project/gooo-fac3b/storage); not needed for V1.
5. `npm run dev` and click through the golden path in a browser (sign in →
   add a leave balance + a holiday or two → check "For You" produces
   recommendations → add a trip → add a booking → check Dashboard/Calendar/Analytics).
   The dev server has been smoke-tested (boots, responds 200) but the actual
   in-browser click-through has not been confirmed yet.
6. **Pending user action**: Firestore was wiped clean again and a real
   2026 leave/trip plan (1 leave balance, 4 holidays, 8 trips, 8 train
   bookings, 1 trip-preferences doc) was generated at
   `2026-leave-plan-import.json` (project root, gitignored) based on the
   user's real IRCTC screenshots and holiday calendar. The user needs to
   sign in and use Settings → Backup & Restore → Import JSON to load it —
   this has **not** been confirmed done yet. Delete the file after
   importing (it has no credentials, but is personal data).
   The import feature itself now also supports `tripBookings` (see fix
   above) — previously it only handled leaveBalances/holidays/trips/
   tripPreferences.
7. `git init`, first commit, push to a remote (not done yet — no git repo
   exists in this directory at all as of this writing).
8. Deploy to Vercel (`vercel.json` is ready; just needs the same env vars
   set in the Vercel project settings).

## Known gaps / intentionally deferred (not bugs — V1 scope)

- No offline Firestore persistence enabled yet (`enableIndexedDbPersistence`
  — trivial to add to `src/firebase/firestore.ts` later if wanted for the PWA).
- Flight/Bus bookings are informational-only (`notes` field), per spec — only
  Train has real booking-window logic in V1.
- No toast/notification system in the UI; mutation errors mostly fail
  silently or show minimal inline text. Consider adding one if this becomes annoying.
- Delete confirmations use native `window.confirm` rather than a custom
  dialog component — deliberate simplicity call, revisit if it feels cheap.
- `computeAnalytics` counts a trip's vacation days as 100% of the trip's
  date span (departure→return inclusive) — it doesn't currently subtract
  leave-only vs. already-off days within a trip; fine for V1 aggregate stats.
- Bundle has one ~510KB chunk (Firebase SDK) after route-level code
  splitting — acceptable for V1, could be revisited with finer manualChunks
  if load time becomes a concern.

## Where to look for the spec

The full original product spec is in the user's global
`~/.claude/CLAUDE.md` (not in this repo) — it's quite long (all modules,
Firestore collections, recommendation scoring examples, etc.). This progress
file is the delta between that spec and current reality; re-read the spec
itself for anything not mentioned here.
