import type { PainPoint, Application } from './types'

export interface MatchResult {
  startupId: string
  confidence: 'high' | 'medium'
  reason: string
}

/** painPointId → ranked list of startup matches */
export type MatchResults = Record<string, MatchResult[]>

// ── Signature ───────────────────────────────────────────────────────────────
// Fingerprint of the exact set of pain points + applications the last match
// run covered. Lets computeMatches skip a redundant LLM call when nothing
// has changed since the last run.

function hash(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return h >>> 0
}

export function matchSignature(painPoints: PainPoint[], apps: Application[]): string {
  const ppPart = painPoints.map(p => `${p.id}:${hash(p.title + p.description)}`).sort().join('|')
  const appPart = apps.map(a => `${a.id}:${hash(a.technology)}`).sort().join('|')
  return `${ppPart}__${appPart}`
}

// ── Curated seed matches ─────────────────────────────────────────────────────
// Hand-written match reasons for the seed pain points × seed startups.
// These are shown immediately on load — no API key needed, no latency.
// When VITE_GROQ_API_KEY is present, Groq replaces these with live reasoning.

const SEED_MATCHES: MatchResults = {
  pp1: [
    { startupId: 'APP-2024-0047', confidence: 'high',   reason: "VisionQual's AI vision system directly replaces the manual 4-second dwell inspection — purpose-built for exactly this production bottleneck." },
    { startupId: 'APP-2026-0061', confidence: 'medium',  reason: "TorqueIQ's assembly-line telemetry can flag upstream anomalies before they reach the QC station, reducing false-positive inspection load." },
  ],
  pp2: [
    { startupId: 'APP-2024-0058', confidence: 'medium',  reason: "GridMind's factory-floor monitoring infrastructure could be extended to surface cross-pilot project status, addressing the visibility gap." },
    { startupId: 'APP-2024-0047', confidence: 'medium',  reason: "VisionQual already operates across production lines — their data layer could serve as a shared register for active pilot tracking." },
  ],
  pp3: [
    { startupId: 'APP-2024-0031', confidence: 'high',   reason: "FlowRoute's ML-based adaptive routing was built for OEM supply chains — it directly replaces the static 2021 routing tables causing the 18-hour delay." },
  ],
  pp4: [
    { startupId: 'APP-2024-0052', confidence: 'high',   reason: "CarbonLens provides real-time per-vehicle carbon tracking, replacing the quarterly spreadsheet process with the live disclosure tooling regulators are now requiring." },
    { startupId: 'APP-2024-0058', confidence: 'medium',  reason: "GridMind's energy monitoring feeds directly into emissions calculations — pairing with CarbonLens could automate the full Scope 2 reporting chain." },
  ],
  pp5: [
    { startupId: 'APP-2024-0058', confidence: 'high',   reason: "GridMind's AI load balancing was built precisely for factory changeover spikes — their pilots show ~12% cost reduction, matching the target stated in this pain point." },
    { startupId: 'APP-2026-0061', confidence: 'medium',  reason: "TorqueIQ's real-time assembly telemetry can identify which specific line operations drive the largest energy spikes, giving GridMind better prediction inputs." },
  ],
  pp6: [
    { startupId: 'APP-2024-0031', confidence: 'medium',  reason: "FlowRoute's logistics optimisation lowers supply-chain risk, which is part of what makes the current 9-week financial vetting feel necessary — less risk, faster track." },
    { startupId: 'APP-2024-0047', confidence: 'medium',  reason: "VisionQual's existing automotive-adjacent traction and seed funding give them a stronger qualification profile than typical early-stage startups." },
  ],
  pp7: [
    { startupId: 'APP-2026-0061', confidence: 'high',   reason: "TorqueIQ's precision in-line telemetry can detect weld anomalies in real time — eliminating the need to sacrifice 3 units per day for structural validation." },
    { startupId: 'APP-2024-0047', confidence: 'high',   reason: "VisionQual's vision system can perform non-destructive weld integrity checks inline, augmenting or replacing the destructive sampling cycle entirely." },
  ],
  pp8: [
    { startupId: 'APP-2026-0061', confidence: 'medium',  reason: "TorqueIQ's real-world assembly telemetry can compress physical prototype sign-off by providing live performance data earlier in the loop." },
    { startupId: 'APP-2024-0052', confidence: 'medium',  reason: "CarbonLens's per-model real-time data pipeline could replace one of the four cross-functional sign-off gates currently required for R&D prototype validation." },
  ],
}

// ── Local stub ───────────────────────────────────────────────────────────────
// Returns curated seed matches for known pain point IDs, and falls back to
// keyword scoring for any pain points added at runtime.

const KEYWORD_MAP: { test: RegExp; tag: string }[] = [
  { test: /quality|inspect|defect|vision|detect|sensor|integrity|qc/i,       tag: 'Quality' },
  { test: /produc|manufactur|assembly|torque|energy|load|factory|line/i,     tag: 'Production' },
  { test: /logistic|supply|rout|delivery|chain|transport|inbound/i,          tag: 'Logistics' },
  { test: /carbon|footprint|sustainab|emission|co2|prototype|twin/i,         tag: 'R&D' },
  { test: /procurement|supplier|qualif|onboard|vendor/i,                     tag: 'Procurement' },
  { test: /innovation|visib|dashboard|register|silo|cross.depart/i,          tag: 'Innovation' },
]

function keywordMatch(pp: PainPoint, apps: Application[]): MatchResult[] {
  const eligible = apps.filter(a => a.stage !== 'decision_redirect')
  const ppText = `${pp.title} ${pp.description} ${pp.department}`.toLowerCase()
  const ppTags = KEYWORD_MAP.filter(r => r.test.test(ppText)).map(r => r.tag)
  const matches: MatchResult[] = []

  for (const app of eligible) {
    if (app.id === pp.linkedApplicationId) {
      matches.push({ startupId: app.id, confidence: 'high', reason: 'Directly matched by internal lead.' })
      continue
    }
    const appTags = KEYWORD_MAP.filter(r => r.test.test(app.technology)).map(r => r.tag)
    const shared = ppTags.filter(t => appTags.includes(t))
    if (shared.length >= 2) matches.push({ startupId: app.id, confidence: 'high', reason: `Strong relevance across ${shared.join(' and ')}.` })
    else if (shared.length === 1) matches.push({ startupId: app.id, confidence: 'medium', reason: `Relevant to this ${shared[0]} challenge.` })
  }

  return matches.sort((a, b) => {
    if (a.startupId === pp.linkedApplicationId) return -1
    if (b.startupId === pp.linkedApplicationId) return 1
    return a.confidence === 'high' && b.confidence !== 'high' ? -1 : 1
  })
}

export function localStubMatch(painPoints: PainPoint[], apps: Application[]): MatchResults {
  const results: MatchResults = {}
  for (const pp of painPoints) {
    results[pp.id] = SEED_MATCHES[pp.id] ?? keywordMatch(pp, apps)
  }
  return results
}

// ── LLM match via Groq ───────────────────────────────────────────────────────
// Called when VITE_GROQ_API_KEY is present. One call covers all pain points ×
// all startups. Result is parsed and merged with any explicit admin links.

const GROQ_MODEL = 'llama3-8b-8192'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

function buildPrompt(painPoints: PainPoint[], apps: Application[]): string {
  const ppList = painPoints.map(pp =>
    `- id: ${pp.id}\n  title: ${pp.title}\n  department: ${pp.department}\n  description: ${pp.description}`
  ).join('\n')

  const appList = apps
    .filter(a => a.stage !== 'decision_redirect')
    .map(a => `- id: ${a.id}\n  company: ${a.companyName}\n  technology: ${a.technology}`)
    .join('\n')

  return `You are a startup-corporate matching engine for Audi's BRIDGE venture-clienting programme.

Match each Audi pain point to the most relevant startups from the list below.

PAIN POINTS:
${ppList}

STARTUPS:
${appList}

Return ONLY valid JSON in this exact shape — no markdown, no explanation:
{
  "matches": [
    {
      "painPointId": "<id>",
      "startupId": "<id>",
      "confidence": "high" | "medium",
      "reason": "<one sentence explaining why this startup fits this pain point>"
    }
  ]
}

Rules:
- Only include matches where the startup's technology is genuinely relevant to the pain point.
- A startup can match multiple pain points. A pain point can have multiple startup matches.
- Use "high" for clear direct relevance, "medium" for partial or adjacent relevance.
- Omit low-relevance or irrelevant pairs entirely.`
}

interface RawMatch {
  painPointId?: unknown
  startupId?: unknown
  confidence?: unknown
  reason?: unknown
}

export function parseGroqResponse(raw: unknown, knownPPIds: Set<string>, knownAppIds: Set<string>): MatchResults {
  let root: unknown = raw
  if (typeof raw === 'string') {
    try { root = JSON.parse(raw) } catch { return {} }
  }
  const rawMatches = (root as { matches?: unknown } | null)?.matches
  if (!Array.isArray(rawMatches)) return {}

  const results: MatchResults = {}
  for (const m of rawMatches as RawMatch[]) {
    const ppId = typeof m.painPointId === 'string' ? m.painPointId : null
    const appId = typeof m.startupId === 'string' ? m.startupId : null
    const confidence = m.confidence === 'high' ? 'high' : m.confidence === 'medium' ? 'medium' : null
    const reason = typeof m.reason === 'string' ? m.reason.trim() : ''
    if (!ppId || !appId || !confidence || !knownPPIds.has(ppId) || !knownAppIds.has(appId)) continue
    if (!results[ppId]) results[ppId] = []
    results[ppId].push({ startupId: appId, confidence, reason })
  }
  return results
}

export async function matchViaGroq(painPoints: PainPoint[], apps: Application[]): Promise<MatchResults> {
  const key = import.meta.env.VITE_GROQ_API_KEY as string | undefined
  if (!key) throw new Error('No VITE_GROQ_API_KEY')

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: buildPrompt(painPoints, apps) }],
      temperature: 0.2,
      max_tokens: 1024,
    }),
  })

  if (res.status === 429) throw new Error('rate_limit')
  if (!res.ok) throw new Error(`groq_error_${res.status}`)

  const data = await res.json() as { choices?: { message?: { content?: string } }[] }
  const content = data.choices?.[0]?.message?.content ?? ''

  const knownPPIds = new Set(painPoints.map(p => p.id))
  const knownAppIds = new Set(apps.filter(a => a.stage !== 'decision_redirect').map(a => a.id))
  const llmResults = parseGroqResponse(content, knownPPIds, knownAppIds)

  // Merge: keep LLM results, but always inject explicit admin links at high confidence
  for (const pp of painPoints) {
    if (!pp.linkedApplicationId) continue
    const existing = llmResults[pp.id] ?? []
    if (!existing.find(m => m.startupId === pp.linkedApplicationId)) {
      llmResults[pp.id] = [
        { startupId: pp.linkedApplicationId, confidence: 'high', reason: 'Directly matched by internal lead.' },
        ...existing,
      ]
    }
  }

  return llmResults
}
