import { describe, it, expect, beforeEach } from 'vitest'
import { useBridgeStore } from '../store/store'
import type { Application, Stage } from '../store/types'

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
