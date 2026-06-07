import { describe, it, expect } from 'vitest'
import { getPipelineDepthSeries, getSparklineSeries, getDeptBarData } from '../store/derive'
import type { Application, PainPoint } from '../store/types'

// ── Fixtures ──────────────────────────────────────────────────────────────

function makeApp(overrides: Partial<Application> = {}): Application {
  return {
    id: 'APP-001',
    founderId: 'f1',
    founderName: 'Test Founder',
    founderInitials: 'TF',
    companyName: 'TestCo',
    technology: 'Test tech',
    stage: 'in_review',
    submittedAt: new Date().toISOString().slice(0, 10),
    daysInProcess: 5,
    ownerId: null,
    signalDeadline: '',
    notes: '',
    funding: '',
    teamSize: 2,
    ...overrides,
  }
}

function makePainPoint(overrides: Partial<PainPoint> = {}): PainPoint {
  return {
    id: 'pp1',
    title: 'Test pain',
    description: '',
    submittedBy: 'Tester',
    department: 'R&D',
    status: 'open',
    linkedApplicationId: null,
    submittedAt: new Date().toISOString().slice(0, 10),
    ...overrides,
  }
}

const today = new Date().toISOString().slice(0, 10)
const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
const tenWeeksAgo = new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

// ── getPipelineDepthSeries ─────────────────────────────────────────────────

describe('getPipelineDepthSeries', () => {
  it('returns an array with the requested number of weeks', () => {
    const result = getPipelineDepthSeries([], 12)
    expect(result).toHaveLength(12)
  })

  it('counts an active app submitted this week in the current bucket', () => {
    const apps = [makeApp({ submittedAt: today, stage: 'in_review' })]
    const result = getPipelineDepthSeries(apps, 4)
    expect(result[result.length - 1]).toBe(1)
  })

  it('excludes decision_redirect apps from pipeline depth', () => {
    const apps = [makeApp({ submittedAt: today, stage: 'decision_redirect' })]
    const result = getPipelineDepthSeries(apps, 4)
    expect(result[result.length - 1]).toBe(0)
  })

  it('does not count a future app in earlier weeks', () => {
    const apps = [makeApp({ submittedAt: today, stage: 'in_review' })]
    const result = getPipelineDepthSeries(apps, 4)
    // Oldest bucket (index 0) was 3 weeks ago — app wasn't submitted yet
    expect(result[0]).toBe(0)
  })

  it('counts an old app in all subsequent weeks', () => {
    const apps = [makeApp({ submittedAt: tenWeeksAgo, stage: 'in_review' })]
    const result = getPipelineDepthSeries(apps, 12)
    // Should appear in every bucket from week it was submitted onward
    expect(result[result.length - 1]).toBe(1)
    expect(result[0]).toBe(0) // 12 weeks ago — older than 10 weeks ago
  })
})

// ── getSparklineSeries ─────────────────────────────────────────────────────

describe('getSparklineSeries', () => {
  it('returns exactly 5 keys', () => {
    const result = getSparklineSeries([], [])
    expect(Object.keys(result)).toHaveLength(5)
  })

  it('each series has exactly 12 data points', () => {
    const result = getSparklineSeries([], [])
    for (const series of Object.values(result)) {
      expect(series).toHaveLength(12)
    }
  })

  it('returns the expected series keys', () => {
    const result = getSparklineSeries([], [])
    expect(result).toHaveProperty('implementations')
    expect(result).toHaveProperty('pilots')
    expect(result).toHaveProperty('signal')
    expect(result).toHaveProperty('openPainPoints')
    expect(result).toHaveProperty('totalPainPoints')
  })

  it('implementations series ends at 0 when no path_to_production apps', () => {
    const apps = [makeApp({ stage: 'in_review', submittedAt: twoWeeksAgo })]
    const result = getSparklineSeries(apps, [])
    expect(result.implementations[11]).toBe(0)
  })

  it('counts open pain points submitted this week', () => {
    const pps = [makePainPoint({ status: 'open', submittedAt: today })]
    const result = getSparklineSeries([], pps)
    expect(result.openPainPoints[11]).toBe(1)
  })
})

// ── getDeptBarData ─────────────────────────────────────────────────────────

describe('getDeptBarData', () => {
  it('returns empty array for no pain points', () => {
    expect(getDeptBarData([])).toEqual([])
  })

  it('returns at most 4 entries', () => {
    const pps = ['A', 'B', 'C', 'D', 'E'].map((dept, i) =>
      makePainPoint({ id: `pp${i}`, department: dept })
    )
    expect(getDeptBarData(pps)).toHaveLength(4)
  })

  it('percentages reflect department share', () => {
    const pps = [
      makePainPoint({ id: 'pp1', department: 'R&D' }),
      makePainPoint({ id: 'pp2', department: 'R&D' }),
      makePainPoint({ id: 'pp3', department: 'Production' }),
    ]
    const result = getDeptBarData(pps)
    const rd = result.find(r => r.label === 'R&D')
    const prod = result.find(r => r.label === 'Production')
    expect(rd?.pct).toBeCloseTo(66.7, 0)
    expect(prod?.pct).toBeCloseTo(33.3, 0)
  })

  it('sorts entries descending by percentage', () => {
    const pps = [
      makePainPoint({ id: 'pp1', department: 'Small' }),
      makePainPoint({ id: 'pp2', department: 'Big' }),
      makePainPoint({ id: 'pp3', department: 'Big' }),
    ]
    const result = getDeptBarData(pps)
    expect(result[0].label).toBe('Big')
  })
})
