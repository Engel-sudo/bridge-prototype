# Slice 2 — "Group by theme" end-to-end (local stub clusterer)

Type: **AFK** · Blocked by: **Slice 1**

## What to build

Deliver the entire pain-point grouping UX, demoable with zero credentials by using a
deterministic local stub as the clustering brain. Add a `Cluster` model and a pure
`parseClusterResponse(raw): Cluster[]` transform (the seam the real LLM plugs into in
Slice 4). Add a `clusterPainPoints()` action to the store that calls
`repository.clusterPainPoints(...)`, stores the returned clusters, and stamps each
pain point with its `clusterId`. The in-memory repository's `clusterPainPoints`
implementation is a local stub (e.g. groups by a keyword/department heuristic and
produces stable theme labels + summaries).

On the Pain Point Map: a "Group by theme" button (with loading + error states) triggers
clustering; a theme filter row sits alongside the existing department/status filters;
a "group by theme" rendering mode sections cards under their cluster label; each card
shows its theme label when assigned.

## Acceptance criteria

- [ ] `Cluster` type and optional `clusterId` on `PainPoint` (additive — no existing test breaks).
- [ ] `parseClusterResponse` maps well-formed JSON → `Cluster[]`, drops unknown pain-point ids, returns empty on invalid input (no throw).
- [ ] `clusterPainPoints()` store action populates clusters and assigns `clusterId`s.
- [ ] In-memory repo provides a deterministic local stub clusterer.
- [ ] Map shows a "Group by theme" button with loading/error states.
- [ ] Map has a theme filter and a grouped rendering mode; cards show theme labels.
- [ ] Department + status filters still work.
- [ ] Fixture unit tests for `parseClusterResponse`; existing tests still pass.

## Blocked by
- Slice 1 (data layer seam).
