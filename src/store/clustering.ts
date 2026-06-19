import type { PainPoint } from './types'

/**
 * A theme produced by grouping pain points. In the demo this comes from a local
 * deterministic stub (see localStubCluster); in production it comes from the
 * cluster-pain-points Edge Function (Gemini), parsed via parseClusterResponse.
 */
export interface Cluster {
  id: string
  label: string
  summary: string
  painPointIds: string[]
}

function slugify(label: string): string {
  return 'cl-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// ── Local stub clusterer ────────────────────────────────────────────────────
// Deterministic keyword-based grouping. Stands in for the LLM until Slice 4
// wires up Gemini, so the whole "Group by theme" UX is demoable with no keys.

const THEME_RULES: { label: string; summary: string; test: RegExp }[] = [
  { label: 'Quality & Inspection', summary: 'Detecting defects and assuring quality on the line.', test: /\b(quality|inspect|defect|qc|visual)\b/i },
  { label: 'Automation & Throughput', summary: 'Speeding up or automating manual production steps.', test: /\b(automat|throughput|cycle time|bottleneck|manual|robot)\b/i },
  { label: 'Logistics & Supply', summary: 'Moving parts and materials through the plant and supply chain.', test: /\b(logistic|supply|inventory|warehouse|material|part)\b/i },
  { label: 'Visibility & Tracking', summary: 'Shared visibility into projects, pilots and data across silos.', test: /\b(visib|track|register|overview|silo|dashboard|cross-depart)\b/i },
  { label: 'Energy & Sustainability', summary: 'Energy use, emissions and sustainability on site.', test: /\b(energy|emission|co2|sustainab|power|carbon)\b/i },
]

const OTHER: { label: string; summary: string } = {
  label: 'Other',
  summary: 'Pain points that do not fall into a common theme yet.',
}

function themeFor(pp: PainPoint): { label: string; summary: string } {
  const hay = `${pp.title} ${pp.description}`
  return THEME_RULES.find((r) => r.test.test(hay)) ?? OTHER
}

/** Group pain points into themes deterministically. Empty themes are omitted. */
export function localStubCluster(painPoints: PainPoint[]): Cluster[] {
  const byLabel = new Map<string, Cluster>()
  for (const pp of painPoints) {
    const { label, summary } = themeFor(pp)
    const existing = byLabel.get(label)
    if (existing) existing.painPointIds.push(pp.id)
    else byLabel.set(label, { id: slugify(label), label, summary, painPointIds: [pp.id] })
  }
  return [...byLabel.values()]
}

// ── LLM response parser ─────────────────────────────────────────────────────
// The seam the real Gemini call plugs into. Maps raw model output (object or
// JSON string) to typed Clusters, dropping ids the model invented and tolerating
// malformed input without throwing.

interface RawCluster {
  label?: unknown
  summary?: unknown
  painPointIds?: unknown
}

export function parseClusterResponse(raw: unknown, knownIds: Set<string>): Cluster[] {
  let root: unknown = raw
  if (typeof raw === 'string') {
    try {
      root = JSON.parse(raw)
    } catch {
      return []
    }
  }
  const clustersRaw = (root as { clusters?: unknown } | null)?.clusters
  if (!Array.isArray(clustersRaw)) return []

  const out: Cluster[] = []
  for (const c of clustersRaw as RawCluster[]) {
    const label = typeof c?.label === 'string' ? c.label.trim() : ''
    if (!label) continue
    const summary = typeof c?.summary === 'string' ? c.summary.trim() : ''
    const ids = Array.isArray(c?.painPointIds)
      ? (c.painPointIds.filter((id): id is string => typeof id === 'string' && knownIds.has(id)))
      : []
    if (ids.length === 0) continue
    out.push({ id: slugify(label), label, summary, painPointIds: ids })
  }
  return out
}
