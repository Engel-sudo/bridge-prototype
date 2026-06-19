/**
 * One-time Supabase seeding. Reuses the exact seed data the prototype ships with
 * (src/store/seed.ts) so the database starts identical to the in-memory demo.
 *
 * Run AFTER applying supabase/schema.sql:
 *
 *   SUPABASE_URL=https://YOUR-ref.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
 *   npx tsx scripts/seedSupabase.ts
 *
 * Uses the service-role key (full write access) — run locally only, never commit it.
 */
import { createClient } from '@supabase/supabase-js'
import {
  seedApplications,
  seedOwners,
  seedPainPoints,
  seedMetrics,
  seedPoolMembers,
  seedCommunityEvents,
} from '../src/store/seed'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.')
  process.exit(1)
}

const db = createClient(url, key)

async function main() {
  const steps: [string, () => Promise<{ error: unknown }>][] = [
    ['owners', () => db.from('owners').upsert(seedOwners)],
    ['applications', () => db.from('applications').upsert(seedApplications)],
    ['pain_points', () => db.from('pain_points').upsert(seedPainPoints)],
    ['pool_members', () => db.from('pool_members').upsert(seedPoolMembers)],
    ['community_events', () => db.from('community_events').upsert(seedCommunityEvents)],
    ['system_metrics', () => db.from('system_metrics').upsert({ ...seedMetrics, id: 1 })],
  ]
  for (const [name, run] of steps) {
    const { error } = await run()
    if (error) {
      console.error(`✗ ${name}:`, error)
      process.exit(1)
    }
    console.log(`✓ seeded ${name}`)
  }
  console.log('Done.')
}

main()
