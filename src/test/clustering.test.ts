import { describe, it, expect } from 'vitest'
import { localStubCluster, parseClusterResponse, painPointSignature, type Cluster } from '../store/clustering'
import type { PainPoint } from '../store/types'

function makePP(id: string, title: string, description = ''): PainPoint {
  return {
    id,
    title,
    description,
    submittedBy: 'Tester',
    department: 'Quality',
    status: 'open',
    linkedApplicationId: null,
    submittedAt: '2026-06-01',
  }
}

describe('localStubCluster', () => {
  it('assigns every pain point to exactly one theme', () => {
    const pps = [
      makePP('a', 'Manual visual inspection defect rate'),
      makePP('b', 'Automate the line to cut cycle time'),
      makePP('c', 'Something completely unrelated'),
    ]
    const clusters = localStubCluster(pps)
    const assigned = clusters.flatMap((c) => c.painPointIds)
    expect(assigned.sort()).toEqual(['a', 'b', 'c'])
  })

  it('omits empty themes and is deterministic', () => {
    const pps = [makePP('a', 'visual inspection quality')]
    const first = localStubCluster(pps)
    const second = localStubCluster(pps)
    expect(first).toEqual(second)
    expect(first.every((c) => c.painPointIds.length > 0)).toBe(true)
  })
})

describe('parseClusterResponse', () => {
  const known = new Set(['p1', 'p2', 'p3'])

  it('parses a well-formed object', () => {
    const raw = { clusters: [{ label: 'Quality', summary: 'QC stuff', painPointIds: ['p1', 'p2'] }] }
    const out = parseClusterResponse(raw, known)
    expect(out).toHaveLength(1)
    expect(out[0].label).toBe('Quality')
    expect(out[0].painPointIds).toEqual(['p1', 'p2'])
  })

  it('parses a JSON string payload', () => {
    const raw = JSON.stringify({ clusters: [{ label: 'Logistics', summary: '', painPointIds: ['p3'] }] })
    const out = parseClusterResponse(raw, known)
    expect(out).toHaveLength(1)
    expect(out[0].painPointIds).toEqual(['p3'])
  })

  it('drops pain-point ids the model invented', () => {
    const raw = { clusters: [{ label: 'X', summary: '', painPointIds: ['p1', 'ghost-99'] }] }
    const out = parseClusterResponse(raw, known)
    expect(out[0].painPointIds).toEqual(['p1'])
  })

  it('skips clusters with no valid ids and no label', () => {
    const raw = { clusters: [{ label: '', painPointIds: ['p1'] }, { label: 'Y', painPointIds: ['ghost'] }] }
    expect(parseClusterResponse(raw, known)).toEqual([] as Cluster[])
  })

  it('returns empty on malformed input without throwing', () => {
    expect(parseClusterResponse('not json', known)).toEqual([])
    expect(parseClusterResponse(null, known)).toEqual([])
    expect(parseClusterResponse({ nope: true }, known)).toEqual([])
  })
})

describe('painPointSignature', () => {
  it('is stable for the same pain points regardless of order', () => {
    const a = makePP('a', 'Inspection', 'desc a')
    const b = makePP('b', 'Routing', 'desc b')
    expect(painPointSignature([a, b])).toBe(painPointSignature([b, a]))
  })

  it('changes when a pain point is added or removed', () => {
    const a = makePP('a', 'Inspection', 'desc a')
    const b = makePP('b', 'Routing', 'desc b')
    expect(painPointSignature([a])).not.toBe(painPointSignature([a, b]))
  })

  it('changes when a pain point title or description is edited', () => {
    const before = makePP('a', 'Inspection', 'desc a')
    const editedTitle = makePP('a', 'Inspection automated', 'desc a')
    const editedDesc = makePP('a', 'Inspection', 'desc a, revised')
    expect(painPointSignature([before])).not.toBe(painPointSignature([editedTitle]))
    expect(painPointSignature([before])).not.toBe(painPointSignature([editedDesc]))
  })
})
