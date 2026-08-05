# Gooo — Build Progress

Last updated: 2026-08-05

This file tracks what's been built so a new session (or a new Claude
instance with no memory of this one) can pick up exactly where things left
off. Update it whenever a milestone finishes or the plan changes.

## Status: V1 shipped and in active use

Firebase project `gooo-fac3b` is live: Google sign-in, Firestore, and
security rules are deployed. The user has imported real leave/trip data and
is actively using the app day-to-day (leave balances, real trip bookings,
Tatkal waitlist tracking). Storage is still **not** enabled in the console —
fine, it's reserved for V2 document uploads, not used in V1.

Everything below is implemented, typechecked (`tsc -b`), unit-tested
(`vitest` — 168 tests across 15 files, all passing), lints clean (`oxlint`),
and production-builds cleanly (`npm run build`, including the PWA service
worker / manifest generation).

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
  Modules: `analytics`, `auth`, `calendar`, `dashboard`, `holidays`, `leaves`,
  `planning`, `recommendations`, `settings`, `shared`, `tatkal`, `transport`,
  `trips`.
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
  Firestore rules/indexes are deployed; storage rules are not (storage isn't
  enabled in the console yet, not needed for V1).
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
  separately surfaces zero-leave holiday+weekend blocks, plus a "sandwich"
  pattern (leave from both sides of an off-day block, e.g. Thursday **and**
  Monday around a Friday holiday). Filters by available leave and excluded
  (already-booked) dates, scores, sorts.
- `src/modules/recommendations/lib/scoring.ts` — efficiency-weighted score
  with a penalty for continuous leave beyond 3 days.
- `src/modules/shared/lib/efficiency.ts` — `computeEfficiency` (days off /
  leave used → star rating), shared by leaves + recommendations so
  recommendations doesn't depend on the leaves module.
- `src/modules/recommendations/lib/explainer.ts` — `RecommendationExplainer`
  interface + deterministic default impl. **This is the AI-readiness seam**:
  a future AI layer implements the same interface to rewrite `reason` in a
  more conversational tone — it must never recompute scores/dates.
- The Recommendations page's "PLAN →" opens the trip form pre-filled from the
  recommendation (title/dates/mode) for the user to confirm origin/destination
  before it's saved, then routes to the Planning workspace — it used to
  silently create a trip with blank fields and drop the user on a Trips tab
  that hid Planning-status trips by default (fixed 2026-08-05, see below).

### Leave / booking math (also pure + tested)
- `src/modules/leaves/lib/leaveCalculations.ts` — accrual, remaining
  balance, carry-forward capping, expiry check.
- `src/modules/transport/lib/bookingWindow.ts` — booking-open/close window
  from advance reservation period, reminder level (book today / tomorrow /
  this week / already missed / booked), demand heuristic (placeholder,
  documented as easy to replace).
- `src/modules/shared/lib/dayBreakdown.ts` — `classifyDateRange` computes a
  trip's actual leave cost from its date span (holidays/weekends are free).
  Trips can also carry `excludedLeaveDates` — specific workdays in the span
  that didn't actually need leave (e.g. an evening departure straight from
  work) — which `TripForm` exposes as a live per-date checklist.

### Tatkal module (`src/modules/tatkal`)
Tracks a single train leg from ordinary advance-reservation through the
Tatkal emergency-quota window if it's still waitlisted the day before travel
— also just the right place to track *any* waitlisted general-quota booking
(status includes "Waiting List"/"RAC", not only Tatkal-specific states).
- `TatkalPlan` (boarding/destination, journey date, class, status, current
  WL/RAC number, checklist) + `BackupOption` (ranked fallback trains/buses/
  flights) + `TatkalPreferences`.
- `lib/tatkalWindow.ts` / `irctcRules.ts` — AC opens 10:00, Non-AC 11:00, one
  day before travel; countdown badge ladder (far/upcoming/tomorrow/today/open/passed).
- `lib/notificationEvents.ts` — `buildDueTatkalNotificationEvents` computes 7
  event types (reservation opens soon, Tatkal window opens soon/now,
  waitlist moved, backup decision due, booking missed, high-demand alert).
  Rendered as an **Alerts panel** at the top of the Tatkal page (wired up
  2026-08-05 — previously fully implemented and tested but never rendered
  anywhere in the UI).
- `TatkalPage` also shows an Upcoming Windows timeline, today/tomorrow/
  upcoming/missed/recently-confirmed buckets, and pro tips.

### Planning workspace (`src/modules/planning`)
A checklist-first view of trips still in progress (status Planning/Booked),
distinct from the full trip log at `/trips`.
- `lib/derivePlanSteps.ts` — derives a 3-step checklist (Leave planned /
  Train researched / Tickets booked) from the trip + its bookings + Tatkal
  plans, and an overall DRAFT/IN PROGRESS/ACTIVE status.
- `PlanCard` shows the checklist and progress bar. If a trip's bookings are
  already dated but the trip's own `status` field is still `Planning` — which
  used to happen silently and permanently — it now shows a one-click
  "Mark Booked" nudge (added 2026-08-05, see below).

### Every module has a working UI (list + create/edit via a bottom `Sheet` + delete)
Dashboard, Leaves, Holidays, Trips, Transport (bookings, nested under each
Trip card), Recommendations ("For You"), Planning, Tatkal Planner,
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
every form on every breakpoint for consistency; now caps at `85svh` with
internal scroll + locks background scroll while open, since forms can be
taller than a short phone screen). Desktop: fixed/sticky sidebar nav, pinned
to the viewport (was previously part of normal page flow and could scroll
away), with a macOS-dock-style hover reveal — the hovered icon scales up and
a lime label pops out beside it, explicitly closed on route change rather
than relying on `:hover` (which would leave it stuck open after a click).
The sidebar avatar no longer signs out on click; hovering it reveals a
"Sign out" button instead. Mobile: bottom tab bar (Dashboard/Cal/Picks/
Trips/Leave + "More" sheet for the rest) + top bar, safe-area insets for
notched devices, PWA manifest + service worker (`vite-plugin-pwa`,
`autoUpdate`). Favicon + full PWA icon set (`apple-touch-icon.png`,
`icons/icon-{192,512,512-maskable}.png`) regenerated 2026-08-05 to match the
actual in-app `LogoMark` (lime rounded-square, black hexagon) — the
previous set was a stale blue-suitcase mark left over from an earlier design
pass and no longer matched the app's real branding anywhere it was shown.

### Deployment target
Per the user's explicit instruction, **Vercel**, not Firebase Hosting (the
original spec said Firebase Hosting — `firebase.json` only configures
Firestore/Storage rules, not hosting). `vercel.json` has the SPA rewrite
ready. **Not confirmed deployed** — no `.vercel` project link exists in this
working copy; if it hasn't been deployed yet, run `vercel` with the same
Firebase env vars set in the Vercel project settings.

## Fixes from the 2026-08-05 session

- **Recommendation → Plan flow fixed.** "PLAN →" used to create a trip with
  blank origin/destination and redirect to `/trips`, whose default "Upcoming"
  tab only shows `Booked` trips — a fresh `Planning` trip silently vanished
  into the "Drafts" tab with no confirmation of anything happening. Now opens
  the trip form pre-filled for confirmation, then routes to `/planning`.
- **Tatkal notification events wired to the UI.** 7 event types were fully
  built and tested but never rendered anywhere; now shown as an Alerts panel
  on the Tatkal page.
- **Per-date leave exclusion.** Trips can mark specific workdays in their
  span as not requiring leave (e.g. an evening departure after work) via
  `Trip.excludedLeaveDates`, exposed as a checklist in `TripForm`. Fixes
  `classifyDateRange`/`computeAnalytics`/`derivePlanSteps` all over-counting
  leave cost for trips like this.
- **Trip status auto-promotion + stale-draft nudge.** Booking a ticket for a
  `Planning` trip now auto-promotes it to `Booked`. Existing trips that were
  already stuck (bookings dated, status never flipped) get a one-click
  "Mark Booked" nudge on both `TripCard` and `PlanCard`.
- **Mobile: `Sheet` could overflow off-screen** with no way to reach Save on
  a short viewport — now caps height and scrolls internally, and locks
  background scroll while open. Dashboard's "⌘K" hint now hidden on mobile
  (was showing on touch devices with no keyboard).
- **Sidebar redesign**: sticky to the viewport (used to scroll away with
  page content), dock-style hover labels on nav icons, hover-reveal sign-out
  instead of click-to-sign-out on the avatar.
- **Favicon + PWA icon set regenerated** to match the real in-app brand mark
  (see UI/UX above).

## Known gaps / intentionally deferred (not bugs — V1 scope)

- No offline Firestore persistence enabled yet (`enableIndexedDbPersistence`
  — trivial to add to `src/firebase/firestore.ts` later if wanted for the PWA).
- Flight/Bus bookings are informational-only (`notes` field), per spec — only
  Train has real booking-window logic in V1.
- No app-wide toast/notification system — most mutations still fail silently
  or show minimal inline text (a few specific spots now have inline
  feedback — the Tatkal alerts panel, the stale-draft "Mark Booked" nudges —
  but there's no general success/error toast anywhere). Worth adding if the
  silent-failure mode ever causes real confusion.
- Delete confirmations use native `window.confirm` rather than a custom
  dialog component — deliberate simplicity call, revisit if it feels cheap.
- Bundle has one ~510KB chunk (Firebase SDK) after route-level code
  splitting — acceptable for V1, could be revisited with finer manualChunks
  if load time becomes a concern.

## What's left

Only infrastructure items that require the user's own account access —
nothing left to build in-repo for V1:

1. **Confirm the Vercel deployment.** `vercel.json` is ready and the build is
   clean; there's just no evidence in this working copy that it's actually
   been deployed yet. If not: `vercel` (with the same `VITE_FIREBASE_*` env
   vars from `.env.local` set in the Vercel project settings).
2. **Enable Firebase Storage** in the console, whenever V2 document uploads
   are actually being built — not blocking anything today.

## Where to look for the spec

The full original product spec is in the user's global
`~/.claude/CLAUDE.md` (not in this repo) — it's quite long (all modules,
Firestore collections, recommendation scoring examples, etc.). This progress
file is the delta between that spec and current reality; re-read the spec
itself for anything not mentioned here.
