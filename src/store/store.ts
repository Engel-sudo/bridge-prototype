import { create } from 'zustand'
import type { Application, PainPoint, Owner, SystemMetrics, Stage, PoolMember, CommunityEvent, TruckStop } from './types'
import { seedApplications, seedOwners, seedPainPoints, seedMetrics, seedPoolMembers, seedCommunityEvents, seedTruckStops } from './seed'
import { getRepository } from './repository'
import type { Cluster } from './clustering'
import { painPointSignature } from './clustering'

interface BridgeStore {
  applications: Application[]
  owners: Owner[]
  painPoints: PainPoint[]
  metrics: SystemMetrics
  poolMembers: PoolMember[]
  communityEvents: CommunityEvent[]
  truckStops: TruckStop[]
  clusters: Cluster[]
  // Fingerprint of the pain-point set the current clusters were computed from.
  // Lets clusterPainPoints skip a redundant LLM call when nothing changed.
  clusterSignature: string | null

  hydrate: () => Promise<void>
  addApplication: (app: Application) => void
  deleteApplication: (appId: string) => void
  advanceStage: (appId: string) => void
  assignOwner: (appId: string, ownerId: string) => void
  decide: (appId: string, outcome: 'go' | 'redirect') => void
  addPainPoint: (pp: PainPoint) => void
  updatePainPoint: (pp: PainPoint) => void
  deletePainPoint: (ppId: string) => void
  matchPainPoint: (ppId: string, appId: string) => void
  addToPool: (member: PoolMember) => void
  addCommunityEvent: (event: CommunityEvent) => void
  updateCommunityEvent: (event: CommunityEvent) => void
  deleteCommunityEvent: (eventId: string) => void
  addTruckStop: (stop: TruckStop) => void
  updateTruckStop: (stop: TruckStop) => void
  deleteTruckStop: (stopId: string) => void
  clusterPainPoints: () => Promise<'unchanged' | 'grouped'>
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
  truckStops: seedTruckStops,
  clusters: [],
  clusterSignature: null,

  // Load persisted state from the backend on app start. With the in-memory
  // repository this is a no-op (returns null) and the seed state is kept.
  hydrate: async () => {
    const data = await getRepository().loadAll()
    if (!data) return
    // Persisted clusters were computed from data.painPoints — derive the same
    // signature now so the idempotency gate recognizes "already grouped"
    // across a page reload instead of treating clusterSignature as unset and
    // re-calling the LLM on the very next "Group by theme" press.
    const clusterSignature = data.clusters.length > 0 ? painPointSignature(data.painPoints) : null
    set({ ...data, clusterSignature })
  },

  addApplication: (app) => {
    // A new application enters at stage 'submitted' — not yet an active pilot,
    // so the activePilots count (Audi-wide narrative figure) is untouched.
    set((state) => ({ applications: [app, ...state.applications] }))
    void getRepository().saveApplication(app)
  },

  // Admin delete — remove an application (e.g. junk test submissions) and
  // persist the deletion.
  deleteApplication: (appId) => {
    set((state) => ({ applications: state.applications.filter((a) => a.id !== appId) }))
    void getRepository().deleteApplication(appId)
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

  // Admin edit — replace a pain point's fields in place and persist.
  updatePainPoint: (pp) => {
    set((state) => ({
      painPoints: state.painPoints.map((p) => (p.id === pp.id ? pp : p)),
    }))
    void getRepository().savePainPoint(pp)
  },

  // Admin delete — remove a pain point and persist the deletion.
  deletePainPoint: (ppId) => {
    set((state) => ({ painPoints: state.painPoints.filter((p) => p.id !== ppId) }))
    void getRepository().deletePainPoint(ppId)
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

  // Admin creates a community event (invitations) and persists it.
  addCommunityEvent: (event) => {
    set((state) => ({ communityEvents: [event, ...state.communityEvents] }))
    void getRepository().saveCommunityEvent(event)
  },

  // Admin edit — replace a community event's fields in place and persist.
  updateCommunityEvent: (event) => {
    set((state) => ({
      communityEvents: state.communityEvents.map((e) => (e.id === event.id ? event : e)),
    }))
    void getRepository().saveCommunityEvent(event)
  },

  // Admin delete — remove a community event and persist the deletion.
  deleteCommunityEvent: (eventId) => {
    set((state) => ({ communityEvents: state.communityEvents.filter((e) => e.id !== eventId) }))
    void getRepository().deleteCommunityEvent(eventId)
  },

  // Admin manages the recruiting truck's tour route.
  addTruckStop: (stop) => {
    set((state) => ({ truckStops: [...state.truckStops, stop] }))
    void getRepository().saveTruckStop(stop)
  },

  updateTruckStop: (stop) => {
    set((state) => ({
      truckStops: state.truckStops.map((s) => (s.id === stop.id ? stop : s)),
    }))
    void getRepository().saveTruckStop(stop)
  },

  deleteTruckStop: (stopId) => {
    set((state) => ({ truckStops: state.truckStops.filter((s) => s.id !== stopId) }))
    void getRepository().deleteTruckStop(stopId)
  },

  // On-demand grouping. Delegates to the repository (local stub in the demo,
  // Gemini Edge Function when Supabase is configured), then stamps each pain
  // point with its theme so the map can group and filter by cluster.
  clusterPainPoints: async () => {
    const painPoints = get().painPoints
    const signature = painPointSignature(painPoints)
    // Idempotency gate: if the pain-point set is unchanged since the last
    // grouping, reuse the existing themes instead of re-running the LLM (which
    // would otherwise re-roll labels/groupings on every press).
    if (signature === get().clusterSignature && get().clusters.length > 0) return 'unchanged'
    const clusters = await getRepository().clusterPainPoints(painPoints)
    const assignment = new Map<string, string>()
    for (const c of clusters) for (const id of c.painPointIds) assignment.set(id, c.id)
    set((state) => ({
      clusters,
      clusterSignature: signature,
      painPoints: state.painPoints.map((pp) => ({
        ...pp,
        clusterId: assignment.get(pp.id) ?? null,
      })),
    }))
    void getRepository().saveClusters(clusters)
    return 'grouped'
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
      truckStops: seedTruckStops,
      clusters: [],
      clusterSignature: null,
    })
    void getRepository().reseed().catch(() => {})
  },
}))
