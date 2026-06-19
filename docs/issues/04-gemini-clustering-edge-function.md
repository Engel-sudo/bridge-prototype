# Slice 4 — Real Gemini clustering Edge Function

Type: **HITL for key, then AFK** · Blocked by: **Slice 2, Slice 3**

## What to build

Replace the local stub clusterer with a real LLM call. A Supabase Edge Function
`cluster-pain-points` receives the current pain points, prompts Google Gemini (free
tier) to group them into a small set of themes, and returns schema-shaped JSON
(`{ clusters: { label, summary, painPointIds }[] }`). The function persists clusters to
`pain_point_clusters` and sets `pain_points.cluster_id`. The `SupabaseRepository`'s
`clusterPainPoints` invokes the function; the existing `parseClusterResponse` transform
(from Slice 2) parses the result, so the UI is unchanged. The Gemini key lives only as
an Edge Function secret — never in the repo or client.

**Human setup required (one-time):** get a Google AI Studio (Gemini) API key; set it as
a Supabase secret (`supabase secrets set GEMINI_API_KEY=…`); deploy the function.

## Acceptance criteria

- [ ] Edge Function calls Gemini and returns `{ clusters: [...] }` matching the parser's contract.
- [ ] Function persists clusters and pain-point assignments.
- [ ] `SupabaseRepository.clusterPainPoints` calls the function and reuses `parseClusterResponse`.
- [ ] Gemini key is a server-side secret only.
- [ ] "Group by theme" on the Map produces real LLM themes when configured; stub remains the in-memory fallback.
- [ ] Provider-specific code is confined to the Edge Function (swappable to Claude later).

## Blocked by
- Slice 2 (group-by-theme UX + parser).
- Slice 3 (Supabase persistence).
