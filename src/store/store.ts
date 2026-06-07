import { create } from 'zustand'
import type { Application, PainPoint, Owner, SystemMetrics, Stage, PoolMember, CommunityEvent } from './types'
import { seedApplications, seedOwners, seedPainPoints, seedMetrics, seedPoolMembers, seedCommunityEvents } from './seed'

interface BridgeStore {
  applications: Application[]
  owners: Owner[]
  painPoints: PainPoint[]
  metrics: SystemMetrics
  poolMembers: PoolMember[]
  communityEvents: CommunityEvent[]

  addApplication: (app: Application) => void
  advanceStage: (appId: string) => void
  assignOwner: (appId: string, ownerId: string) => void
  decide: (appId: string, outcome: 'go' | 'redirect') => void
  addPainPoint: (pp: PainPoint) => void
  matchPainPoint: (ppId: string, appId: string) => void
  addToPool: (member: PoolMember) => void
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

export const useBridgeStore = create<BridgeStore>((set) => ({
  applications: seedApplications,
  owners: seedOwners,
  painPoints: seedPainPoints,
  metrics: seedMetrics,
  poolMembers: seedPoolMembers,
  communityEvents: seedCommunityEvents,

  addApplication: (app) =>
    set((state) => ({
      // A new application enters at stage 'submitted' — not yet an active pilot,
      // so the activePilots count (Audi-wide narrative figure) is untouched.
      applications: [app, ...state.applications],
    })),

  advanceStage: (appId) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId ? { ...a, stage: nextStage(a.stage) } : a
      ),
      metrics: (() => {
        const app = state.applications.find((a) => a.id === appId)
        if (!app) return state.metrics
        const next = nextStage(app.stage)
        if (next === 'path_to_production') {
          return {
            ...state.metrics,
            implementations: state.metrics.implementations + 1,
            implementationsThisQuarter: state.metrics.implementationsThisQuarter + 1,
          }
        }
        return state.metrics
      })(),
    })),

  assignOwner: (appId, ownerId) =>
    set((state) => {
      const app = state.applications.find((a) => a.id === appId)
      if (!app || app.ownerId) return state
      // Claiming a startup names the contact and assigns the owner in one move —
      // jump straight to owner_assigned rather than stepping through named_contact.
      const claimedStage: Stage =
        STAGE_ORDER.indexOf(app.stage) < STAGE_ORDER.indexOf('owner_assigned')
          ? 'owner_assigned'
          : app.stage
      return {
        applications: state.applications.map((a) =>
          a.id === appId ? { ...a, ownerId, stage: claimedStage } : a
        ),
        owners: state.owners.map((o) =>
          o.id === ownerId ? { ...o, startupsOwned: o.startupsOwned + 1 } : o
        ),
      }
    }),

  // The 2-week yes/no call. Branches off the linear stage walk to set an
  // explicit Go or Redirect outcome — decision_redirect is otherwise unreachable.
  decide: (appId, outcome) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId
          ? { ...a, stage: outcome === 'go' ? 'decision_go' : 'decision_redirect' }
          : a
      ),
    })),

  addPainPoint: (pp) =>
    set((state) => ({ painPoints: [pp, ...state.painPoints] })),

  matchPainPoint: (ppId, appId) =>
    set((state) => ({
      painPoints: state.painPoints.map((pp) =>
        pp.id === ppId
          ? { ...pp, status: 'matched', linkedApplicationId: appId }
          : pp
      ),
    })),

  addToPool: (member) =>
    set((state) => ({
      poolMembers: state.poolMembers.some(m => m.id === member.id)
        ? state.poolMembers
        : [member, ...state.poolMembers],
    })),

  // Restore all seed state — lets a presenter reset between testers without a
  // page reload. In-memory only, no storage touched.
  resetDemo: () =>
    set(() => ({
      applications: seedApplications,
      owners: seedOwners,
      painPoints: seedPainPoints,
      metrics: seedMetrics,
      poolMembers: seedPoolMembers,
      communityEvents: seedCommunityEvents,
    })),
}))
