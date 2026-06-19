import { create } from 'zustand'
import type { Application, PainPoint, Owner, SystemMetrics, Stage, PoolMember, CommunityEvent } from './types'
import { seedApplications, seedOwners, seedPainPoints, seedMetrics, seedPoolMembers, seedCommunityEvents } from './seed'
import { getRepository } from './repository'
import type { Cluster } from './clustering'

interface BridgeStore {
  applications: Application[]
  owners: Owner[]
  painPoints: PainPoint[]
  metrics: SystemMetrics
  poolMembers: PoolMember[]
  communityEvents: CommunityEvent[]
  clusters: Cluster[]

  hydrate: () => Promise<void>
  addApplication: (app: Application) => void
  advanceStage: (appId: string) => void
  assignOwner: (appId: string, ownerId: string) => void
  decide: (appId: string, outcome: 'go' | 'redirect') => void
  addPainPoint: (pp: PainPoint) => void
  matchPainPoint: (ppId: string, appId: string) => void
  addToPool: (member: PoolMember) => void
  clusterPainPoints: () => Promise<void>
  resetDemo: () => void
}

const STAGE_ORDER: Stage[] = [
  'submitted',
  'named_contact',
  'owner_assigned',
  'in_review',
  'signal_sent',
  'decision_go',
  'matched_pain_owner',
  'path_to_production',
]

function nextStage(current: Stage): Stage {
  const idx = STAGE_ORDER.indexOf(current)
  if (idx === -1 || idx >= STAGE_ORDER.length - 1) return current
  return STAGE_ORDER[idx + 1]
}

export const useBridgeStore = create<BridgeStore>((set, get) => ({
  applications: seedApplications,
  owners: seedOwners,
  painPoints: seedPainPoints,
  metrics: seedMetrics,
  poolMembers: seedPoolMembers,
  communityEvents: seedCommunityEvents,
  clusters: [],

  // Load persisted state from the backend on app start. With the in-memory
  // repository this is a no-op (returns null) and the seed state is kept.
  hydrate: async () => {
    const data = await getRepository().loadAll()
    if (data) set(data)
  },

  addApplication: (app) => {
    // A new application enters at stage 'submitted' — not yet an active pilot,
    // so the activePilots count (Audi-wide narrative figure) is untouched.
    set((state) => ({ applications: [app, ...state.applications] }))
    void getRepository().saveApplication(app)
  },

  advanceStage: (appId) => {
    const app = get().applications.find((a) => a.id === appId)
    if (!app) return
    const next = nextStage(app.stage)
    const updated: Application = { ...app, stage: next }
    // Count an implementation only on the transition *into* production —
    // nextStage() is a no-op at the terminal stage, so guard against
    // re-advancing an already-finished app inflating the KPI.
    const reachedProduction = next === 'path_to_production' && app.stage !== 'path_to_production'
    const metrics = reachedProduction
      ? {
          ...get().metrics,
          implementations: get().metrics.implementations + 1,
          implementationsThisQuarter: get().metrics.implementationsThisQuarter + 1,
        }
      : get().metrics
    set((state) => ({
      applications: state.applications.map((a) => (a.id === appId ? updated : a)),
      metrics,
    }))
    void getRepository().saveApplication(updated)
    if (reachedProduction) void getRepository().saveMetrics(metrics)
  },

  assignOwner: (appId, ownerId) => {
    const state = get()
    const app = state.applications.find((a) => a.id === appId)
    if (!app || app.ownerId) return
    // Claiming a startup names the contact and assigns the owner in one move —
    // jump straight to owner_assigned rather than stepping through named_contact.
    const claimedStage: Stage =
      STAGE_ORDER.indexOf(app.stage) < STAGE_ORDER.indexOf('owner_assigned')
        ? 'owner_assigned'
        : app.stage
    const updatedApp: Application = { ...app, ownerId, stage: claimedStage }
    const owner = state.owners.find((o) => o.id === ownerId)
    const updatedOwner = owner ? { ...owner, startupsOwned: owner.startupsOwned + 1 } : null
    set((s) => ({
      applications: s.applications.map((a) => (a.id === appId ? updatedApp : a)),
      owners: s.owners.map((o) => (o.id === ownerId && updatedOwner ? updatedOwner : o)),
    }))
    void getRepository().saveApplication(updatedApp)
    if (updatedOwner) void getRepository().saveOwner(updatedOwner)
  },

  // The 2-week yes/no call. Branches off the linear stage walk to set an
  // explicit Go or Redirect outcome — decision_redirect is otherwise unreachable.
  decide: (appId, outcome) => {
    const app = get().applications.find((a) => a.id === appId)
    if (!app) return
    const updated: Application = {
      ...app,
      stage: outcome === 'go' ? 'decision_go' : 'decision_redirect',
    }
    set((state) => ({
      applications: state.applications.map((a) => (a.id === appId ? updated : a)),
    }))
    void getRepository().saveApplication(updated)
  },

  addPainPoint: (pp) => {
    set((state) => ({ painPoints: [pp, ...state.painPoints] }))
    void getRepository().savePainPoint(pp)
  },

  matchPainPoint: (ppId, appId) => {
    const pp = get().painPoints.find((p) => p.id === ppId)
    if (!pp) return
    const updated: PainPoint = { ...pp, status: 'matched', linkedApplicationId: appId }
    set((state) => ({
      painPoints: state.painPoints.map((p) => (p.id === ppId ? updated : p)),
    }))
    void getRepository().savePainPoint(updated)
  },

  addToPool: (member) => {
    if (get().poolMembers.some((m) => m.id === member.id)) return
    set((state) => ({ poolMembers: [member, ...state.poolMembers] }))
    void getRepository().savePoolMember(member)
  },

  // On-demand grouping. Delegates to the repository (local stub in the demo,
  // Gemini Edge Function when Supabase is configured), then stamps each pain
  // point with its theme so the map can group and filter by cluster.
  clusterPainPoints: async () => {
    const clusters = await getRepository().clusterPainPoints(get().painPoints)
    const assignment = new Map<string, string>()
    for (const c of clusters) for (const id of c.painPointIds) assignment.set(id, c.id)
    set((state) => ({
      clusters,
      painPoints: state.painPoints.map((pp) => ({
        ...pp,
        clusterId: assignment.get(pp.id) ?? null,
      })),
    }))
    void getRepository().saveClusters(clusters)
  },

  // Restore all seed state — lets a presenter reset between testers without a
  // page reload. Kept synchronous so the local UI/tests reset immediately; the
  // backend reseed (if any) is fired write-through.
  resetDemo: () => {
    set({
      applications: seedApplications,
      owners: seedOwners,
      painPoints: seedPainPoints,
      metrics: seedMetrics,
      poolMembers: seedPoolMembers,
      communityEvents: seedCommunityEvents,
      clusters: [],
    })
    void getRepository().reseed().catch(() => {})
  },
}))
