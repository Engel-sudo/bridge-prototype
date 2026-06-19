# PRD — Persistent backend + LLM pain-point grouping

> Status: ready-for-agent · Scope: BRIDGE prototype (`Bridge_prototype/`) · Author: synthesized from working session 2026-06-19

## Problem Statement

BRIDGE currently runs entirely in the browser. All data — startup applications, the
Internal Leads, the Pain Point Map, the dashboard metrics — lives in an in-memory
Zustand store (`src/store/store.ts`) seeded from `src/store/seed.ts`. For the user this
means three things break the demo:

1. **Nothing is saved.** Submitting a pain point or an application updates the screen,
   but a page refresh wipes it and restores the seed data.
2. **Nothing is shared.** Two people on two laptops see different data — an Audi
   employee's submitted pain point never reaches the founder's or admin's view.
3. **The Pain Point Map doesn't scale to read.** Pain points are only filterable by the
   department and status they were tagged with on submission. As the list grows, there's
   no way to see *what kinds of problems* are clustering across departments — a reviewer
   has to read every card.

The user wants pain points (and the rest of the data) to actually persist, wants the
map to group/filter pain points by theme using an LLM, and wants the existing
"Submit Pain Point" flow to write to that persistent store.

## Solution

Introduce a hosted backend (Supabase: managed Postgres + auto-generated data API +
Edge Functions) behind the **existing** Zustand store, so the UI and tests are
largely unchanged but data now survives refreshes and is shared across all clients.

- The store keeps being the in-memory copy the UI reads from. On app load it
  **hydrates** from Supabase; on every mutation it **writes through** to Supabase and
  updates the local copy.
- The **Pain Point Map** gains a "Group by theme" action. Clicking it runs an LLM
  (Google Gemini, free tier, for the demo) inside a Supabase **Edge Function** that
  reads the current pain points, assigns each to a theme/cluster, and persists the
  result. The map can then group cards by theme and filter by theme, alongside the
  existing department and status filters.
- The **Submit Pain Point** form (already present in `PainPointMap.tsx`, gated behind
  the Audi-internal `/map` route) is unchanged in look, but now persists the new pain
  point to Supabase and it appears live for everyone.

The LLM provider is isolated behind the Edge Function + repository seam, so the demo's
free Gemini call can be swapped for Claude Haiku (or any provider) later without
touching the UI.

## User Stories

1. As an Audi employee, I want my submitted pain point to persist, so that it is still
   there after I refresh the page.
2. As an Audi employee, I want my submitted pain point to be visible to the admin and
   to founders, so that the right people can act on it.
3. As an admin, I want all dashboard metrics to reflect persisted data, so that the
   numbers I present are real and consistent across sessions.
4. As a founder, I want my submitted application to persist, so that I can return to my
   status page and still see my case.
5. As an Internal Lead, I want claiming/owning a startup to persist, so that ownership
   is not lost on refresh.
6. As any user, I want the app to load existing data from the backend on startup, so
   that I see the same shared state everyone else sees.
7. As an Audi employee on the Pain Point Map, I want a "Group by theme" button, so that
   I can cluster the raw pain points into meaningful themes on demand.
8. As an Audi employee, I want each pain point card to show its theme label, so that I
   can scan the map without reading every description.
9. As an Audi employee, I want to filter the map by theme, so that I can focus on one
   class of problem (e.g. "line stoppages") across departments.
10. As an Audi employee, I want to keep filtering by department and status, so that the
    new theme filter adds to rather than replaces existing controls.
11. As a presenter, I want grouping to run only when I click the button, so that I
    control when the LLM call happens during the pitch and keep cost at zero idle.
12. As a presenter, I want a clear loading state while grouping runs, so that the demo
    doesn't look frozen during the LLM call.
13. As an Audi employee, I want the submission form to keep working exactly as before
    (name, department, title, description), so that there's no relearning.
14. As an admin, I want pain-point submission to stay behind the Audi-internal login,
    so that only Audi employees post problems — matching the product story.
15. As a developer, I want the backend swapped in behind the existing store interface,
    so that components and the existing test suite keep working.
16. As a developer, I want an in-memory implementation of the data layer for tests, so
    that tests don't hit the network or require Supabase credentials.
17. As a developer, I want the LLM provider isolated in one Edge Function, so that I can
    switch from Gemini to Claude or another model later without UI changes.
18. As a developer, I want the demo to reset cleanly (re-seed the database), so that I
    can run the pitch repeatedly from a known state.
19. As any user, I want a graceful fallback if the backend is unreachable, so that the
    demo degrades to read-only seed data rather than crashing.
20. As an admin, I want clustering to be idempotent over the current set, so that
    re-running "Group by theme" produces a coherent (not duplicated) set of themes.

## Implementation Decisions

### Data layer — repository behind Zustand (chosen)

- Keep `useBridgeStore` as the client-side cache the UI reads from. Components and tests
  are unchanged in shape.
- Introduce a **`BridgeRepository`** abstraction — the data-access seam — with async
  methods mirroring the current store actions and reads:
  `listAll()` (hydrate), `addApplication`, `advanceStage`, `assignOwner`, `decide`,
  `addPainPoint`, `matchPainPoint`, `addToPool`, plus `clusterPainPoints()` and
  `resetDemo()`.
- Two implementations:
  - **`SupabaseRepository`** — uses `@supabase/supabase-js`, talks to Postgres + Edge
    Functions. Used in the running app.
  - **`InMemoryRepository`** — wraps the existing `seed.ts` data. Used in tests and as
    the offline fallback (story 19). This is effectively the current behavior, extracted.
- The store gains an async `hydrate()` action called once on app mount; mutation actions
  become async (call the repository, then update local state). Optimistic update is
  acceptable for the demo (update local state immediately, reconcile on response).
- Realtime is **out of scope for v1** (see Out of Scope); cross-client freshness is via
  re-hydrate on navigation/focus. Realtime subscriptions are a noted later enhancement.

### Schema (Supabase Postgres)

Mirror `src/store/types.ts` one table per entity, snake_case columns:

- `applications` — all fields from the `Application` type (`stage` as text/enum, etc.).
- `owners` — `Owner` fields.
- `pain_points` — `PainPoint` fields **plus** `cluster_id uuid null references pain_point_clusters(id)`.
- `pool_members` — `PoolMember` fields.
- `community_events` — `CommunityEvent` fields (`invited_member_ids` as array/jsonb).
- `system_metrics` — single-row table for `SystemMetrics`.
- `pain_point_clusters` — `id uuid pk`, `label text`, `summary text`, `created_at timestamptz`.
  Holds the LLM-produced themes; each pain point references at most one cluster.

A `seed.sql` (or a seed script) loads the existing `seed.ts` content so the demo starts
from the same known state and `resetDemo()` can restore it.

### LLM grouping — Edge Function `cluster-pain-points`

- Runs server-side in a Supabase Edge Function so the provider API key is never exposed
  to the browser.
- **Provider for the demo: Google Gemini, free tier** (Google AI Studio key), via the
  Google Generative AI SDK. This is a deliberate non-Claude choice for $0 demo cost. The
  function is the only place the provider is referenced.
- Contract:
  - **Input:** `{ painPoints: { id, title, description, department }[] }`.
  - The function prompts the model to group the pain points into a small set of themes
    and return **structured JSON** (schema-constrained where the SDK supports it).
  - **Model output shape:** `{ clusters: { label: string, summary: string, painPointIds: string[] }[] }`.
  - The function persists clusters to `pain_point_clusters` and sets
    `pain_points.cluster_id`, then returns the clusters to the caller.
- Triggered **on-demand** from a "Group by theme" button on the Pain Point Map (chosen
  trigger). Not on submit, not scheduled.
- **Pure transform seam:** a standalone function `parseClusterResponse(raw): Cluster[]`
  maps the model's raw JSON into the typed `Cluster[]` view-model (handling missing
  fields, unknown ids, empty clusters). This is the unit-testable boundary — no network.

### Pain Point Map UI

- Add a "Group by theme" button (with loading + error states, stories 11/12) that calls
  `repository.clusterPainPoints()`.
- Add a **theme filter** row alongside the existing department/status filters, and a
  "group by theme" rendering mode that sections cards under their cluster label.
- Each `PainPointCard` shows its theme label when assigned.
- Submission flow unchanged except it now persists (stays behind `/map` auth — chosen).

### Config

- Supabase URL + anon key via Vite env (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- Gemini key stored as an Edge Function secret (server-side only), never in client env.

## Testing Decisions

Good tests here exercise observable behavior through the public store/repository
interface — not Supabase internals or the live LLM. Prior art: the existing
`src/test/bridgeStore.test.ts` (drives `useBridgeStore.getState()` and asserts on
resulting state) and `authStore.test.ts`.

- **Repository contract tests** against `InMemoryRepository`: adding a pain point makes
  it appear in `listAll()`; `matchPainPoint` updates status; mutations are reflected in
  store state after the action resolves. Mirrors the current store tests, now async.
- **Store hydrate/write-through**: with a fake repository, `hydrate()` populates the
  store; a mutation calls the repository exactly once and updates local state. Existing
  56 tests continue to pass against the in-memory default.
- **`parseClusterResponse` unit tests** with fixtures: well-formed model JSON →
  correct `Cluster[]`; pain-point ids not in the input are dropped; empty/!valid JSON
  yields an empty result (no throw). This is the LLM seam tested without a network call.
- **Map filtering/grouping** (component-level): given pain points with assigned
  `cluster_id`, the theme filter narrows the visible cards and grouping mode sections
  them correctly.
- **Not tested in CI:** the live Gemini call and live Supabase I/O — these are verified
  manually against a real project. The `SupabaseRepository` is kept thin so the logic
  worth testing lives in the in-memory impl and the pure transform.

## Out of Scope

- Realtime subscriptions / live multi-client push (v1 refreshes on load/navigation).
- Authentication hardening — the existing role-based `ProtectedRoute` / mock auth stays;
  no real identity provider, no Supabase Row Level Security policies beyond demo needs.
- A public (unauthenticated) pain-point submission route — submission stays Audi-gated.
- Automatic or scheduled re-clustering — grouping is on-demand only.
- Spam/abuse handling, rate limiting, and PII handling on submissions.
- Migrating the LLM provider to Claude — designed-for but not done in v1 (free Gemini
  first); the seam makes this a later, UI-free change.
- Editing/deleting pain points or clusters after creation.

## Further Notes

- The "Submit Pain Point" form already exists in `src/routes/PainPointMap.tsx` and calls
  `addPainPoint`; this PRD makes that call persist rather than building a new form.
- The KPI/metrics derivations in `src/store/derive.ts` are pure functions over the data
  and need no changes — they operate on whatever the store holds, seeded or persisted.
- Provider note: choosing Gemini means the clustering function uses Google's SDK, not
  the Anthropic SDK. Keep all provider-specific code inside `cluster-pain-points` so the
  swap to Claude Haiku (cheap) or Opus is a one-file change behind the same contract.
- No issue tracker is configured in this repo, so this PRD lives here as a file. If a
  tracker is added later, this can be split into issues (schema+repo, hydrate/write-through,
  submit persistence, edge function, map UI) as vertical slices.
