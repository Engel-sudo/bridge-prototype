# Slice 3 — Supabase persistence (schema + SupabaseRepository)

Type: **HITL to provision, then AFK** · Blocked by: **Slice 1**

## What to build

A `SupabaseRepository` implementing `BridgeRepository` against a hosted Supabase
Postgres database, so data persists and is shared across clients. Includes the SQL
schema (tables mirroring `types.ts` plus `pain_point_clusters`), a seed script matching
`seed.ts`, a Supabase browser client, and env wiring. `getRepository()` returns the
Supabase implementation when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are present,
otherwise falls back to in-memory. On load the app hydrates from Supabase; every
mutation — including the existing Audi-gated pain-point submission — writes through.

**Human setup required (one-time):** create a Supabase project; run the schema + seed
SQL; put the project URL + anon key in a gitignored `.env.local`.

## Acceptance criteria

- [ ] SQL schema for applications, owners, pain_points (+ cluster_id), pool_members, community_events, system_metrics, pain_point_clusters.
- [ ] Seed SQL reproduces the current `seed.ts` state; `reseed()` restores it.
- [ ] `SupabaseRepository` implements every `BridgeRepository` method.
- [ ] `getRepository()` selects Supabase when env vars are set, else in-memory.
- [ ] `.env.example` documents the required vars; real keys live only in gitignored `.env.local`.
- [ ] With a configured project, a submitted pain point persists across refresh and is visible to other clients.
- [ ] Falls back to read-only seed data when the backend is unreachable.

## Blocked by
- Slice 1 (data layer seam).
