import { describe, it, expect, beforeEach, vi } from 'vitest'
import { seedTruckStops } from '../store/seed'

// Mock the Supabase client at the boundary. `h.truckRows` lets each test decide
// what the truck_stops table returns; metrics always resolves so loadAll proceeds.
const h = vi.hoisted(() => ({ truckRows: [] as unknown[] }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table: string) => ({
      select: () => {
        if (table === 'system_metrics') {
          const p = Promise.resolve({ data: [], error: null }) as unknown as {
            eq: () => { single: () => Promise<unknown> }
          } & Promise<unknown>
          p.eq = () => ({
            single: () => Promise.resolve({
              data: {
                id: 1, activePilots: 1, implementations: 0, avgTimeToSignal: 1,
                targetTimeToSignal: 1, connectionsThisQuarter: 1, implementationsThisQuarter: 0,
              },
              error: null,
            }),
          })
          return p
        }
        if (table === 'truck_stops') return Promise.resolve({ data: h.truckRows, error: null })
        return Promise.resolve({ data: [], error: null })
      },
    }),
  }),
}))

// Imported after the mock so the repo picks up the fake client.
const { SupabaseRepository } = await import('../store/supabaseRepository')

describe('SupabaseRepository — truck stop loading', () => {
  beforeEach(() => { h.truckRows = [] })

  it('falls back to seeded stops when the truck_stops table is empty', async () => {
    const data = await new SupabaseRepository('url', 'key').loadAll()
    expect(data?.truckStops).toEqual(seedTruckStops)
  })

  it('uses the live rows when the truck_stops table has data', async () => {
    h.truckRows = [{
      id: 'ts-live', city: 'Leipzig', venue: 'Hub', date: '2026-08-01',
      x: 60, y: 40, status: 'upcoming', description: 'live row',
    }]
    const data = await new SupabaseRepository('url', 'key').loadAll()
    expect(data?.truckStops).toHaveLength(1)
    expect(data?.truckStops[0].city).toBe('Leipzig')
  })
})
