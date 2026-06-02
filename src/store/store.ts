import { create } from 'zustand'
import type { Application, PainPoint, Owner, Pilot, SystemMetrics, Stage } from './types'
import { seedApplications, seedOwners, seedPainPoints, seedPilots, seedMetrics } from './seed'

interface BridgeStore {
  applications: Application[]
  owners: Owner[]
  painPoints: PainPoint[]
  pilots: Pilot[]
  metrics: SystemMetrics

  addApplication: (app: Application) => void
  advanceStage: (appId: string) => void
  assignOwner: (appId: string, ownerId: string) => void
  addPainPoint: (pp: PainPoint) => void
  matchPainPoint: (ppId: string, appId: string) => void
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
  pilots: seedPilots,
  metrics: seedMetrics,

  addApplication: (app) =>
    set((state) => ({
      applications: [app, ...state.applications],
      metrics: {
        ...state.metrics,
        activePilots: state.metrics.activePilots + 1,
      },
    })),

  advanceStage: (appId) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId
          ? { ...a, stage: nextStage(a.stage) }
          : a
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

  addPainPoint: (pp) =>
    set((state) => ({
      painPoints: [pp, ...state.painPoints],
      metrics: {
        ...state.metrics,
        painPointsOpen: state.metrics.painPointsOpen + 1,
      },
    })),

  matchPainPoint: (ppId, appId) =>
    set((state) => ({
      painPoints: state.painPoints.map((pp) =>
        pp.id === ppId
          ? { ...pp, status: 'matched', linkedApplicationId: appId }
          : pp
      ),
      metrics: {
        ...state.metrics,
        painPointsOpen: Math.max(0, state.metrics.painPointsOpen - 1),
        painPointsMatched: state.metrics.painPointsMatched + 1,
      },
    })),
}))
