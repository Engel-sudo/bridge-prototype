import { describe, it, expect, beforeEach } from 'vitest'
import { useBridgeStore } from '../store/store'
import type { Application, Stage, TruckStop, CommunityEvent } from '../store/types'

function makeStop(id: string, overrides: Partial<TruckStop> = {}): TruckStop {
  return {
    id, city: 'Testville', venue: 'Test Hub', date: '2026-07-01',
    x: 50, y: 50, status: 'upcoming', description: 'desc', ...overrides,
  }
}

function makeEvent(id: string, overrides: Partial<CommunityEvent> = {}): CommunityEvent {
  return {
    id, title: 'Test Event', type: 'workshop', date: '2026-07-01',
    location: 'Ingolstadt', description: 'desc', invitedMemberIds: [], ...overrides,
  }
}

beforeEach(() => {
  // Restore seed state between tests (in-memory only)
  useBridgeStore.getState().resetDemo()
})

function makeApp(id: string, stage: Stage): Application {
  return {
    id,
    founderId: 'f-test',
    founderName: 'Test Founder',
    founderInitials: 'TF',
    companyName: 'TestCo',
    technology: 'AI',
    stage,
    submittedAt: new Date().toISOString().slice(0, 10),
    daysInProcess: 1,
    ownerId: null,
    signalDeadline: new Date().toISOString().slice(0, 10),
    notes: '',
    funding: 'seed',
    teamSize: 3,
  }
}

describe('bridgeStore — advanceStage at the terminal stage', () => {
  it('counts an implementation once when an app reaches path_to_production', () => {
    const { addApplication, advanceStage } = useBridgeStore.getState()
    const before = useBridgeStore.getState().metrics.implementations

    addApplication(makeApp('APP-T1', 'matched_pain_owner'))
    advanceStage('APP-T1') // matched_pain_owner -> path_to_production

    expect(useBridgeStore.getState().applications.find(a => a.id === 'APP-T1')?.stage)
      .toBe('path_to_production')
    expect(useBridgeStore.getState().metrics.implementations).toBe(before + 1)
  })

  it('does not re-count implementations when advancing an app already in production', () => {
    const { addApplication, advanceStage } = useBridgeStore.getState()

    addApplication(makeApp('APP-T2', 'path_to_production'))
    const afterAdd = useBridgeStore.getState().metrics.implementations

    advanceStage('APP-T2')
    advanceStage('APP-T2')

    // Stage stays terminal and the KPI is not inflated by repeated advances.
    expect(useBridgeStore.getState().applications.find(a => a.id === 'APP-T2')?.stage)
      .toBe('path_to_production')
    expect(useBridgeStore.getState().metrics.implementations).toBe(afterAdd)
  })
})

describe('bridgeStore — truck stop CRUD', () => {
  it('adds a stop to the tour route', () => {
    const before = useBridgeStore.getState().truckStops.length
    useBridgeStore.getState().addTruckStop(makeStop('ts-new'))
    const stops = useBridgeStore.getState().truckStops
    expect(stops.length).toBe(before + 1)
    expect(stops.some(s => s.id === 'ts-new')).toBe(true)
  })

  it('updates a stop in place', () => {
    useBridgeStore.getState().addTruckStop(makeStop('ts-edit', { city: 'Old' }))
    useBridgeStore.getState().updateTruckStop(makeStop('ts-edit', { city: 'New', status: 'current' }))
    const stop = useBridgeStore.getState().truckStops.find(s => s.id === 'ts-edit')
    expect(stop?.city).toBe('New')
    expect(stop?.status).toBe('current')
  })

  it('deletes a stop', () => {
    useBridgeStore.getState().addTruckStop(makeStop('ts-del'))
    useBridgeStore.getState().deleteTruckStop('ts-del')
    expect(useBridgeStore.getState().truckStops.some(s => s.id === 'ts-del')).toBe(false)
  })

  it('resetDemo restores the seeded stops', () => {
    useBridgeStore.getState().deleteTruckStop(useBridgeStore.getState().truckStops[0].id)
    const seededCount = useBridgeStore.getState().truckStops.length
    useBridgeStore.getState().resetDemo()
    expect(useBridgeStore.getState().truckStops.length).toBeGreaterThan(seededCount)
  })
})

describe('bridgeStore — community event edit/delete', () => {
  it('updates an event in place', () => {
    useBridgeStore.getState().addCommunityEvent(makeEvent('evt-edit', { title: 'Old' }))
    useBridgeStore.getState().updateCommunityEvent(makeEvent('evt-edit', { title: 'New' }))
    const evt = useBridgeStore.getState().communityEvents.find(e => e.id === 'evt-edit')
    expect(evt?.title).toBe('New')
  })

  it('deletes an event', () => {
    useBridgeStore.getState().addCommunityEvent(makeEvent('evt-del'))
    useBridgeStore.getState().deleteCommunityEvent('evt-del')
    expect(useBridgeStore.getState().communityEvents.some(e => e.id === 'evt-del')).toBe(false)
  })
})
