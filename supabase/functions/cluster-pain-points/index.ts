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

function buildPrompt(painPoints: InputPainPoint[]): string {
  const list = painPoints
    .map((p) => `- id=${p.id} [${p.department}] ${p.title}: ${p.description}`)
    .join('\n')
  return [
    'You group Audi factory "pain points" (problems posted by employees) into a small',
    'set of clear themes (aim for 3–6). Every pain point id must appear in exactly one',
    'cluster. Use the exact ids given. Themes should reflect the underlying problem and',
    'may cut across departments.',
    '',
    'Return ONLY a JSON object of the form:',
    '{"clusters":[{"label":"short theme name","summary":"one sentence","painPointIds":["id1","id2"]}]}',
    '',
    'Pain points:',
    list,
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

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are a precise clustering assistant that outputs only JSON.' },
          { role: 'user', content: buildPrompt(painPoints) },
        ],
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

    // Persist clusters + assignments using the service role (provided to the
    // function automatically as SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).
    // @ts-ignore Deno global
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // @ts-ignore Deno global
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (supabaseUrl && serviceKey && clusters.length) {
      const db = createClient(supabaseUrl, serviceKey)
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
