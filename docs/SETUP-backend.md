# Backend setup — finishing slices 3 & 4

Slices 1 & 2 (data-layer seam + Group-by-theme with a local stub) are **done and work
with no setup** — `npm run dev` already shows the "Group by theme" button working via
the local stub, and `npm test` is green (69 tests).

Your Supabase URL + anon key are already in `.env.local` (gitignored). To make data
actually persist and to use real Gemini grouping, finish these one-time steps.

## 1. Create the tables  (Slice 3)
In the Supabase dashboard → **SQL editor**, paste and run the contents of
`supabase/schema.sql`.

## 2. Seed the database  (Slice 3)
Get your **service-role key** from Supabase → Settings → API. Then locally:

```sh
npm i -D tsx   # if not already installed
SUPABASE_URL=https://cqhmpwvidbsjdftochfc.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
npx tsx scripts/seedSupabase.ts
```

Reload the app — it now hydrates from Supabase, and submitted pain points persist
across refreshes and across machines. (If the DB is empty/unreachable, the app falls
back to in-memory seed data, so nothing breaks.)

## 3. Deploy the grouping function  (Slice 4) — DONE
The clustering LLM is **Groq** (free tier, works in the EU — Google's free Gemini tier
is not available in the EU, so the original Gemini plan was swapped for Groq). Get a
free key at https://console.groq.com/keys (starts with `gsk_`).

```sh
brew install supabase/tap/supabase            # CLI
export SUPABASE_ACCESS_TOKEN=sbp_...           # from supabase.com/dashboard/account/tokens
supabase secrets set GROQ_API_KEY=gsk_... --project-ref cqhmpwvidbsjdftochfc
supabase functions deploy cluster-pain-points --project-ref cqhmpwvidbsjdftochfc
```

Now "Group by theme" calls Groq for real semantic grouping. If the function is ever
unreachable or errors, the app automatically falls back to the local keyword stub, so
the button always works.

## Notes
- **Do not commit** `.env.local` or any service-role/Gemini key. The anon key is
  client-safe; the service-role and Gemini keys are server-only.
- RLS is intentionally **off** in `schema.sql` for the demo. Add row-level security
  policies before any real-world use.
- The LLM provider lives only in `supabase/functions/cluster-pain-points/index.ts` —
  swapping Gemini for Claude/Haiku later is a one-file change.
