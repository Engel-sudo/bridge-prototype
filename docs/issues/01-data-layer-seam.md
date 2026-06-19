# Slice 1 — Data layer seam (repository behind the store)

Type: **AFK** · Blocked by: **None — can start immediately**

## Parent
docs/prd-backend-painpoints.md

## What to build

Extract all data access behind a `BridgeRepository` interface so the Zustand store
delegates persistence to a swappable backend, without changing app behavior. Ship an
`InMemoryRepository` that wraps the current `seed.ts` data. The store keeps its current
synchronous local-state updates (so the UI and existing tests are unchanged) and
additionally (a) exposes an async `hydrate()` that replaces state from the repository,
and (b) write-through-persists each mutation via the repository. A `getRepository()`
selector returns the in-memory repository by default.

This is the foundation slice: a pure refactor that introduces the seam every later
slice plugs into. Business logic (stage progression, metrics) stays in the store; the
repository is a dumb persistence layer (`saveApplication`, `savePainPoint`, … ,
`loadAll`, `reseed`).

## Acceptance criteria

- [ ] `BridgeRepository` interface defined with `loadAll`, per-entity `save*`, and `reseed`.
- [ ] `InMemoryRepository` implements it over the existing seed (saves are no-ops; `loadAll` returns seed/null).
- [ ] Store has an async `hydrate()` action; mutations still update local state synchronously and call the repository write-through.
- [ ] `getRepository()` returns the in-memory implementation by default.
- [ ] App calls `hydrate()` once on mount.
- [ ] All existing 56 tests still pass unchanged.
- [ ] New contract tests cover: add → appears in `loadAll`; a mutation persists via the repository (verified with a spy/fake).

## Blocked by
None - can start immediately.
