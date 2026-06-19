import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type {
  Application,
  Owner,
  PainPoint,
  PoolMember,
  CommunityEvent,
  SystemMetrics,
} from './types'
import type { BridgeData, BridgeRepository } from './repository'
import { type Cluster, parseClusterResponse, localStubCluster, ClusterRateLimitError } from './clustering'

const METRICS_ID = 1

/**
 * Supabase-backed persistence. Tables use quoted camelCase columns that match the
 * TS field names exactly, so rows map directly to the domain types with no
 * translation layer (see supabase/schema.sql).
 *
 * Clustering is delegated to the `cluster-pain-points` Edge Function (Slice 4),
 * which calls the LLM, persists the assignments, and returns the raw result that
 * parseClusterResponse turns into typed Clusters.
 */
export class SupabaseRepository implements BridgeRepository {
  private client: SupabaseClient

  constructor(url: string, anonKey: string) {
    this.client = createClient(url, anonKey)
  }

  async loadAll(): Promise<BridgeData | null> {
    try {
      const [apps, owners, pps, pool, events, metricsRows, clusters] = await Promise.all([
        this.client.from('applications').select('*'),
        this.client.from('owners').select('*'),
        this.client.from('pain_points').select('*'),
        this.client.from('pool_members').select('*'),
        this.client.from('community_events').select('*'),
        this.client.from('system_metrics').select('*').eq('id', METRICS_ID).single(),
        this.client.from('pain_point_clusters').select('*'),
      ])
      const metrics = metricsRows.data as (SystemMetrics & { id: number }) | null
      if (!metrics) return null // not provisioned yet — let the store keep its seed
      return {
      applications: (apps.data ?? []) as Application[],
      owners: (owners.data ?? []) as Owner[],
      painPoints: (pps.data ?? []) as PainPoint[],
      poolMembers: (pool.data ?? []) as PoolMember[],
      communityEvents: (events.data ?? []) as CommunityEvent[],
        metrics,
        clusters: (clusters.data ?? []) as Cluster[],
      }
    } catch {
      // Backend unreachable or not provisioned — degrade to seed (story 19).
      return null
    }
  }

  async saveApplication(app: Application): Promise<void> {
    await this.client.from('applications').upsert(app)
  }
  async saveOwner(owner: Owner): Promise<void> {
    await this.client.from('owners').upsert(owner)
  }
  async savePainPoint(painPoint: PainPoint): Promise<void> {
    await this.client.from('pain_points').upsert(painPoint)
  }
  async savePoolMember(member: PoolMember): Promise<void> {
    await this.client.from('pool_members').upsert(member)
  }
  async saveMetrics(metrics: SystemMetrics): Promise<void> {
    await this.client.from('system_metrics').upsert({ ...metrics, id: METRICS_ID })
  }
  async saveClusters(clusters: Cluster[]): Promise<void> {
    if (clusters.length) await this.client.from('pain_point_clusters').upsert(clusters)
  }

  async clusterPainPoints(painPoints: PainPoint[]): Promise<Cluster[]> {
    const { data, error } = await this.client.functions.invoke('cluster-pain-points', {
      body: { painPoints: painPoints.map((p) => ({ id: p.id, title: p.title, description: p.description, department: p.department })) },
    })
    // Rate limit is surfaced explicitly so the UI can say so (not a silent fallback).
    if (data && (data as { rateLimited?: boolean }).rateLimited) {
      throw new ClusterRateLimitError()
    }
    if (error) {
      // Function unreachable / not deployed — fall back to the local stub so the
      // button still works during setup.
      return localStubCluster(painPoints)
    }
    const knownIds = new Set(painPoints.map((p) => p.id))
    const clusters = parseClusterResponse(data, knownIds)
    if (clusters.length === 0) return localStubCluster(painPoints)
    return clusters
  }

  async reseed(): Promise<BridgeData> {
    // Re-seeding a live database is a deliberate, destructive admin action and is
    // handled out-of-band (supabase/seed.sql). Here we just re-read current state.
    const data = await this.loadAll()
    if (!data) throw new Error('Database not provisioned — run supabase/seed.sql')
    return data
  }
}
