import type {
  Application,
  Owner,
  PainPoint,
  PoolMember,
  CommunityEvent,
  SystemMetrics,
} from './types'
import {
  seedApplications,
  seedOwners,
  seedPainPoints,
  seedMetrics,
  seedPoolMembers,
  seedCommunityEvents,
} from './seed'
import { type Cluster, localStubCluster } from './clustering'
import { SupabaseRepository } from './supabaseRepository'

/** The full set of data the store holds. */
export interface BridgeData {
  applications: Application[]
  owners: Owner[]
  painPoints: PainPoint[]
  metrics: SystemMetrics
  poolMembers: PoolMember[]
  communityEvents: CommunityEvent[]
  clusters: Cluster[]
}

/**
 * Persistence seam. The store keeps an in-memory copy for the UI and delegates
 * loading/saving to an implementation of this interface. Business logic (stage
 * progression, metric maths) stays in the store; the repository just persists.
 */
export interface BridgeRepository {
  /** Hydrate the store. Return null to keep the store's seed-initialised state. */
  loadAll(): Promise<BridgeData | null>
  saveApplication(app: Application): Promise<void>
  saveOwner(owner: Owner): Promise<void>
  savePainPoint(painPoint: PainPoint): Promise<void>
  deletePainPoint(id: string): Promise<void>
  savePoolMember(member: PoolMember): Promise<void>
  saveCommunityEvent(event: CommunityEvent): Promise<void>
  saveMetrics(metrics: SystemMetrics): Promise<void>
  saveClusters(clusters: Cluster[]): Promise<void>
  /** Group the given pain points into themes. */
  clusterPainPoints(painPoints: PainPoint[]): Promise<Cluster[]>
  /** Restore the demo's seed state and return it. */
  reseed(): Promise<BridgeData>
}

function freshSeed(): BridgeData {
  return {
    applications: seedApplications,
    owners: seedOwners,
    painPoints: seedPainPoints,
    metrics: seedMetrics,
    poolMembers: seedPoolMembers,
    communityEvents: seedCommunityEvents,
    clusters: [],
  }
}

/**
 * Default implementation — wraps the in-memory seed. Saves are no-ops (the store
 * already holds the data); loadAll returns null so the store keeps its seed init.
 * Clustering uses the deterministic local stub.
 */
export class InMemoryRepository implements BridgeRepository {
  async loadAll(): Promise<BridgeData | null> {
    return null
  }
  async saveApplication(): Promise<void> {}
  async saveOwner(): Promise<void> {}
  async savePainPoint(): Promise<void> {}
  async deletePainPoint(): Promise<void> {}
  async savePoolMember(): Promise<void> {}
  async saveCommunityEvent(): Promise<void> {}
  async saveMetrics(): Promise<void> {}
  async saveClusters(): Promise<void> {}
  async clusterPainPoints(painPoints: PainPoint[]): Promise<Cluster[]> {
    return localStubCluster(painPoints)
  }
  async reseed(): Promise<BridgeData> {
    return freshSeed()
  }
}

// ── Repository selection ────────────────────────────────────────────────────
// Singleton, swappable for tests via setRepository(). getRepository() returns the
// Supabase implementation when its env vars are present (see Slice 3), otherwise
// the in-memory default.

let repository: BridgeRepository | null = null

export function setRepository(repo: BridgeRepository | null): void {
  repository = repo
}

export function getRepository(): BridgeRepository {
  if (repository) return repository
  repository = createDefaultRepository()
  return repository
}

function createDefaultRepository(): BridgeRepository {
  // Use Supabase when configured (Slice 3), otherwise the in-memory seed.
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (url && key) return new SupabaseRepository(url, key)
  return new InMemoryRepository()
}
