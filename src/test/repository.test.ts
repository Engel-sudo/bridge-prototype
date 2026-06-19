import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { InMemoryRepository, setRepository, type BridgeRepository } from '../store/repository'
import { useBridgeStore } from '../store/store'
import type { Application, PainPoint } from '../store/types'

function makePP(id: string): PainPoint {
  return {
    id,
    title: 'Test pain point',
    description: 'desc',
    submittedBy: 'Tester',
    department: 'Quality',
    status: 'open',
    linkedApplicationId: null,
    submittedAt: '2026-06-01',
  }
}

function makeApp(id: string, stage: Application['stage']): Application {
  return {
    id,
    founderId: 'f',
    founderName: 'F',
    founderInitials: 'F',
    companyName: 'Co',
    technology: 'AI',
    stage,
    submittedAt: '2026-06-01',
    daysInProcess: 1,
    ownerId: null,
    signalDeadline: '2026-06-15',
    notes: '',
    funding: 'seed',
    teamSize: 2,
  }
}

describe('InMemoryRepository', () => {
  it('loadAll returns null so the store keeps its seed', async () => {
    expect(await new InMemoryRepository().loadAll()).toBeNull()
  })

  it('clusterPainPoints groups via the local stub', async () => {
    const clusters = await new InMemoryRepository().clusterPainPoints([makePP('p1')])
    expect(clusters.length).toBeGreaterThan(0)
    expect(clusters.flatMap((c) => c.painPointIds)).toContain('p1')
  })

  it('reseed returns a full data set', async () => {
    const data = await new InMemoryRepository().reseed()
    expect(data.applications.length).toBeGreaterThan(0)
    expect(data.clusters).toEqual([])
  })
})

describe('store write-through', () => {
  let repo: BridgeRepository & {
    savePainPoint: ReturnType<typeof vi.fn>
    saveMetrics: ReturnType<typeof vi.fn>
    deletePainPoint: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    useBridgeStore.getState().resetDemo()
    repo = {
      loadAll: vi.fn().mockResolvedValue(null),
      saveApplication: vi.fn().mockResolvedValue(undefined),
      saveOwner: vi.fn().mockResolvedValue(undefined),
      savePainPoint: vi.fn().mockResolvedValue(undefined),
      deletePainPoint: vi.fn().mockResolvedValue(undefined),
      savePoolMember: vi.fn().mockResolvedValue(undefined),
      saveCommunityEvent: vi.fn().mockResolvedValue(undefined),
      saveMetrics: vi.fn().mockResolvedValue(undefined),
      saveClusters: vi.fn().mockResolvedValue(undefined),
      clusterPainPoints: vi.fn().mockResolvedValue([]),
      reseed: vi.fn().mockResolvedValue(undefined),
    } as never
    setRepository(repo)
  })

  afterEach(() => {
    setRepository(null)
    useBridgeStore.getState().resetDemo()
  })

  it('persists a submitted pain point through the repository', () => {
    useBridgeStore.getState().addPainPoint(makePP('pp-new'))
    expect(repo.savePainPoint).toHaveBeenCalledOnce()
    expect(repo.savePainPoint.mock.calls[0][0]).toMatchObject({ id: 'pp-new' })
  })

  it('persists metrics when an app reaches production', () => {
    useBridgeStore.getState().addApplication(makeApp('APP-W1', 'matched_pain_owner'))
    useBridgeStore.getState().advanceStage('APP-W1')
    expect(repo.saveMetrics).toHaveBeenCalledOnce()
  })

  it('admin edit updates the pain point locally and persists it', () => {
    useBridgeStore.getState().addPainPoint(makePP('pp-edit'))
    useBridgeStore.getState().updatePainPoint({ ...makePP('pp-edit'), title: 'Edited title' })
    const pp = useBridgeStore.getState().painPoints.find((p) => p.id === 'pp-edit')
    expect(pp?.title).toBe('Edited title')
    expect(repo.savePainPoint).toHaveBeenCalledTimes(2) // add + update
  })

  it('admin delete removes the pain point and persists the deletion', () => {
    useBridgeStore.getState().addPainPoint(makePP('pp-del'))
    useBridgeStore.getState().deletePainPoint('pp-del')
    expect(useBridgeStore.getState().painPoints.some((p) => p.id === 'pp-del')).toBe(false)
    expect(repo.deletePainPoint).toHaveBeenCalledWith('pp-del')
  })

  it('admin add community event stores it locally and persists it', () => {
    const before = useBridgeStore.getState().communityEvents.length
    useBridgeStore.getState().addCommunityEvent({
      id: 'evt-test',
      title: 'Demo Day',
      type: 'demo_day',
      date: '2026-07-01',
      location: 'Ingolstadt',
      description: 'x',
      invitedMemberIds: [],
    })
    expect(useBridgeStore.getState().communityEvents.length).toBe(before + 1)
    expect(repo.saveCommunityEvent).toHaveBeenCalledOnce()
  })
})

describe('clusterPainPoints store action', () => {
  beforeEach(() => {
    setRepository(null) // use the default in-memory repo (local stub)
    useBridgeStore.getState().resetDemo()
  })

  it('populates clusters and stamps pain points with a clusterId', async () => {
    await useBridgeStore.getState().clusterPainPoints()
    const { clusters, painPoints } = useBridgeStore.getState()
    expect(clusters.length).toBeGreaterThan(0)
    expect(painPoints.some((pp) => !!pp.clusterId)).toBe(true)
  })
})
