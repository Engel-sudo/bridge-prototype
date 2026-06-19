// Supabase Edge Function (Deno): groups pain points into themes with Google Gemini.
//
// Deploy:  supabase functions deploy cluster-pain-points
// Secret:  supabase secrets set GEMINI_API_KEY=your-google-ai-studio-key
//
// This is the ONLY place the LLM provider appears. To switch to Claude/Haiku later,
// change only this file — the client contract ({ clusters: [...] }) stays the same.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface InputPainPoint {
  id: string
  title: string
  description: string
  department: string
}

const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_URL = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function buildPrompt(painPoints: InputPainPoint[]): string {
  const list = painPoints
    .map((p) => `- id=${p.id} [${p.department}] ${p.title}: ${p.description}`)
    .join('\n')
  return [
    'You group Audi factory "pain points" (problems posted by employees) into a small',
    'set of clear themes (aim for 3–6). Every pain point id must appear in exactly one',
    'cluster. Use the exact ids given.',
    '',
    'Return ONLY JSON of the form:',
    '{"clusters":[{"label":"short theme name","summary":"one sentence","painPointIds":["id1","id2"]}]}',
    '',
    'Pain points:',
    list,
  ].join('\n')
}

// deno-lint-ignore no-explicit-any
function extractJson(geminiResponse: any): unknown {
  const text: string | undefined =
    geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) return { clusters: [] }
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = fenced ? fenced[1] : text
  try {
    return JSON.parse(raw)
  } catch {
    return { clusters: [] }
  }
}

function slugify(label: string): string {
  return 'cl-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// @ts-ignore Deno global is available in the Edge runtime
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    // @ts-ignore Deno global
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) throw new Error('GEMINI_API_KEY not set')

    const { painPoints } = (await req.json()) as { painPoints: InputPainPoint[] }
    if (!Array.isArray(painPoints) || painPoints.length === 0) {
      return new Response(JSON.stringify({ clusters: [] }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch(GEMINI_URL(geminiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(painPoints) }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      }),
    })
    const parsed = extractJson(await res.json()) as {
      clusters?: { label?: string; summary?: string; painPointIds?: string[] }[]
    }

    const known = new Set(painPoints.map((p) => p.id))
    const clusters = (parsed.clusters ?? [])
      .filter((c) => typeof c.label === 'string' && c.label.trim())
      .map((c) => ({
        id: slugify(c.label as string),
        label: (c.label as string).trim(),
        summary: typeof c.summary === 'string' ? c.summary.trim() : '',
        painPointIds: (c.painPointIds ?? []).filter((id) => known.has(id)),
      }))
      .filter((c) => c.painPointIds.length > 0)

    // Persist clusters + assignments using the service role (available in the
    // function env automatically as SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).
    // @ts-ignore Deno global
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // @ts-ignore Deno global
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (supabaseUrl && serviceKey) {
      const db = createClient(supabaseUrl, serviceKey)
      if (clusters.length) {
        await db.from('pain_point_clusters').upsert(clusters)
        for (const c of clusters) {
          await db.from('pain_points').update({ clusterId: c.id }).in('id', c.painPointIds)
        }
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
