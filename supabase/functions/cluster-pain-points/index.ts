// Supabase Edge Function (Deno): groups pain points into themes with Groq (free tier).
//
// Deploy:  supabase functions deploy cluster-pain-points
// Secret:  supabase secrets set GROQ_API_KEY=your-groq-key
//
// This is the ONLY place the LLM provider appears. To switch providers later,
// change only this file — the client contract ({ clusters: [...] }) stays the same.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface InputPainPoint {
  id: string
  title: string
  description: string
  department: string
}

const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function listOf(painPoints: InputPainPoint[]): string {
  return painPoints.map((p) => `- id=${p.id} [${p.department}] ${p.title}: ${p.description}`).join('\n')
}

// Two-stage grouping: Stage A proposes candidate themes (label + summary) with
// no id assignment, so the summary is written for a theme the model just
// invented rather than backfilled for whatever ids a one-shot call happened to
// bucket together. Stage B then classifies each pain point id into one of the
// FIXED stage-A labels (or "Other") — per-item classification, which LLMs do
// far more reliably than holistic set partitioning, and it cannot invent new
// themes or merge unrelated domains under a broad catch-all.

function buildStageAPrompt(painPoints: InputPainPoint[]): string {
  return [
    'You are helping Audi match factory "pain points" (problems posted by employees)',
    'to the kind of startup or solution that could solve them.',
    '',
    'Propose 3-5 candidate THEMES that group these pain points. A good theme is a',
    'capability/solution domain a SINGLE type of startup could plausibly address',
    '(e.g. "Automated Quality Inspection", "Predictive Energy & Grid Management")',
    '— not a vague abstraction ("Process Improvement") and not the CURRENT state',
    'being manual/legacy (that is not a theme; the TARGET solution domain is). Do',
    'not group on shared words like "manual" or "spreadsheet" alone.',
    '',
    'Actively look for real groupings: two pain points belong in the same theme',
    'whenever the SAME vendor/product category could pitch a roadmap covering',
    'both, even if the immediate technical fix differs (e.g. a quality-inspection',
    'vendor could plausibly cover both a computer-vision line check and an',
    'ultrasonic weld check — both are inspection/sensing problems). Only split',
    'into separate themes when the pain points need fundamentally different kinds',
    'of vendor (e.g. a supply-chain routing vendor vs. a carbon-accounting vendor).',
    'A singleton theme should be rare — only when a pain point is genuinely',
    'unrelated to every other one.',
    '',
    'Do NOT assign pain point ids yet — only propose the candidate themes.',
    '',
    'For each theme write a "summary": ONE concrete sentence (max ~20 words) naming',
    'the shared capability gap and the kind of startup that would close it. Start',
    'with the capability, not filler like "These points belong together".',
    '',
    'Return ONLY a JSON object of the form:',
    '{"themes":[{"label":"short capability/domain name","summary":"one concrete sentence"}]}',
    '',
    'Pain points (for context only, do not assign yet):',
    listOf(painPoints),
  ].join('\n')
}

function buildStageBPrompt(painPoints: InputPainPoint[], themes: { label: string; summary: string }[]): string {
  const themeList = themes.map((t, i) => `${i + 1}. ${t.label} — ${t.summary}`).join('\n')
  return [
    'Classify each pain point below into EXACTLY ONE of these fixed themes.',
    'Do not invent new themes or rename these. Only pick a theme if it is a',
    'genuine match for the kind of startup/solution needed — do not force a',
    'pain point into the closest-sounding theme if it actually needs a',
    'different solution. If no theme is a genuine match, classify it as "Other".',
    '',
    'Themes:',
    themeList,
    'Other. Does not fit any theme above.',
    '',
    'Pain points:',
    listOf(painPoints),
    '',
    'COVERAGE CHECK: every id must appear in exactly one assignment — do not drop any.',
    '',
    'Return ONLY a JSON object of the form:',
    '{"assignments":[{"id":"id1","label":"exact theme label from the list above"}]}',
  ].join('\n')
}

function slugify(label: string): string {
  return 'cl-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// deno-lint-ignore no-explicit-any
function extractJson(groqResponse: any): unknown {
  const text: string | undefined = groqResponse?.choices?.[0]?.message?.content
  if (!text) return { clusters: [] }
  try {
    return JSON.parse(text)
  } catch {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (fenced) {
      try {
        return JSON.parse(fenced[1])
      } catch {
        return { clusters: [] }
      }
    }
    return { clusters: [] }
  }
}

// deno-lint-ignore no-explicit-any
async function callGroq(groqKey: string, prompt: string): Promise<{ rateLimited: true } | { data: any }> {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      // Deterministic run: temperature 0 + fixed seed so the same set of pain
      // points yields the same themes/assignments. The store's idempotency gate
      // is the hard guarantee; this keeps a *fresh* grouping repeatable too.
      temperature: 0,
      seed: 7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a precise classification assistant that outputs only JSON.' },
        { role: 'user', content: prompt },
      ],
    }),
  })
  // Surface a rate limit distinctly so the caller can show "rate limit reached"
  // rather than treating it as a bug.
  if (res.status === 429) return { rateLimited: true }
  return { data: extractJson(await res.json()) }
}

// @ts-ignore Deno global is available in the Edge runtime
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    // @ts-ignore Deno global
    const groqKey = Deno.env.get('GROQ_API_KEY')
    if (!groqKey) throw new Error('GROQ_API_KEY not set')

    const { painPoints } = (await req.json()) as { painPoints: InputPainPoint[] }
    if (!Array.isArray(painPoints) || painPoints.length === 0) {
      return new Response(JSON.stringify({ clusters: [] }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // Stage A: propose candidate themes (label + summary), no id assignment yet.
    const stageA = await callGroq(groqKey, buildStageAPrompt(painPoints))
    if ('rateLimited' in stageA) {
      return new Response(JSON.stringify({ clusters: [], rateLimited: true }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }
    const themes = ((stageA.data?.themes ?? []) as { label?: unknown; summary?: unknown }[])
      .filter((t): t is { label: string; summary: string } => typeof t.label === 'string' && t.label.trim().length > 0)
      .map((t) => ({ label: t.label.trim(), summary: typeof t.summary === 'string' ? t.summary.trim() : '' }))

    if (themes.length === 0) {
      return new Response(JSON.stringify({ clusters: [] }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // Stage B: classify each pain point id into one of the FIXED stage-A
    // themes (or "Other") — per-item classification, not set partitioning.
    const stageB = await callGroq(groqKey, buildStageBPrompt(painPoints, themes))
    if ('rateLimited' in stageB) {
      return new Response(JSON.stringify({ clusters: [], rateLimited: true }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }
    const assignments = (stageB.data?.assignments ?? []) as { id?: unknown; label?: unknown }[]

    const known = new Set(painPoints.map((p) => p.id))
    const byLabel = new Map(themes.map((t) => [t.label, { label: t.label, summary: t.summary, painPointIds: [] as string[] }]))
    const other: string[] = []
    const assignedIds = new Set<string>()
    for (const a of assignments) {
      const id = typeof a.id === 'string' ? a.id : ''
      const label = typeof a.label === 'string' ? a.label.trim() : ''
      if (!id || !known.has(id)) continue
      assignedIds.add(id)
      const bucket = byLabel.get(label)
      if (label === 'Other' || !bucket) other.push(id)
      else bucket.painPointIds.push(id)
    }
    // Ids the model omitted entirely (coverage check failed) also fall to Other
    // rather than being silently dropped from the map.
    for (const p of painPoints) if (!assignedIds.has(p.id)) other.push(p.id)

    const clusters = [...byLabel.values()]
      .filter((c) => c.painPointIds.length > 0)
      .map((c) => ({ id: slugify(c.label), label: c.label, summary: c.summary, painPointIds: c.painPointIds }))
    if (other.length) {
      clusters.push({ id: slugify('Other'), label: 'Other', summary: 'Does not fit any theme above.', painPointIds: other })
    }

    // Persist clusters + assignments using the service role (provided to the
    // function automatically as SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).
    // @ts-ignore Deno global
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // @ts-ignore Deno global
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (supabaseUrl && serviceKey && clusters.length) {
      const db = createClient(supabaseUrl, serviceKey)
      // Clear the previous run's themes first (FK ON DELETE SET NULL also resets
      // every pain_points.clusterId), then write this run's fresh themes.
      await db.from('pain_point_clusters').delete().not('id', 'is', null)
      await db.from('pain_point_clusters').upsert(clusters)
      for (const c of clusters) {
        await db.from('pain_points').update({ clusterId: c.id }).in('id', c.painPointIds)
      }
    }

    return new Response(JSON.stringify({ clusters }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
