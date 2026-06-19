import type { Application, PainPoint, Stage } from './types'

/**
 * Whether a founder at the given application stage has earned BRIDGE community
 * access. Acceptance (decision_go) and everything downstream unlocks it; a
 * redirect does not — redirected founders join the pool the existing way (an
 * admin adds them, like Elena Vogel).
 */
const COMMUNITY_STAGES: ReadonlySet<Stage> = new Set<Stage>([
  'decision_go',
  'matched_pain_owner',
  'path_to_production',
])

export function canAccessCommunity(stage: Stage): boolean {
  return COMMUNITY_STAGES.has(stage)
}

/**
 * Returns an array of `weeks` numbers representing pipeline depth over time.
 * Index 0 = oldest week, index (weeks-1) = most recent week.
 * Pipeline depth = count of apps submitted on or before end-of-week that are
 * not yet redirected (stage !== 'decision_redirect').
 */
export function getPipelineDepthSeries(
  applications: Application[],
  weeks: number,
): number[] {
  const today = new Date()
  const series: number[] = []

  for (let i = 0; i < weeks; i++) {
    const endOfWeek = new Date(
      today.getTime() - (weeks - 1 - i) * 7 * 24 * 60 * 60 * 1000,
    )
    const count = applications.filter((app) => {
      const submitted = new Date(app.submittedAt)
      return submitted <= endOfWeek && app.stage !== 'decision_redirect'
    }).length
    series.push(count)
  }

  return series
}

/**
 * Returns 12-point sparkline series for each of the five dashboard metrics.
 * Index 0 = 11 weeks ago, index 11 = this week.
 */
export function getSparklineSeries(
  applications: Application[],
  painPoints: PainPoint[],
): Record<string, number[]> {
  const WEEKS = 12
  const today = new Date()

  const implementations: number[] = []
  const signal: number[] = []
  const openPainPoints: number[] = []
  const totalPainPoints: number[] = []

  let lastKnownSignal = 14 // default carry-forward value

  for (let i = 0; i < WEEKS; i++) {
    const endOfWeek = new Date(
      today.getTime() - (WEEKS - 1 - i) * 7 * 24 * 60 * 60 * 1000,
    )

    // implementations: cumulative path_to_production apps submitted <= endOfWeek
    const implCount = applications.filter((app) => {
      const submitted = new Date(app.submittedAt)
      return app.stage === 'path_to_production' && submitted <= endOfWeek
    }).length
    implementations.push(implCount)

    // signal: average daysInProcess of decided apps submitted <= endOfWeek
    const decidedApps = applications.filter((app) => {
      const submitted = new Date(app.submittedAt)
      return (
        submitted <= endOfWeek &&
        (app.stage === 'decision_go' ||
          app.stage === 'decision_redirect' ||
          app.stage === 'path_to_production')
      )
    })
    if (decidedApps.length > 0) {
      const avg =
        decidedApps.reduce((sum, app) => sum + app.daysInProcess, 0) /
        decidedApps.length
      lastKnownSignal = Math.round(avg * 10) / 10
    }
    signal.push(lastKnownSignal)

    // openPainPoints: count of open pain points submitted <= endOfWeek
    const openCount = painPoints.filter((pp) => {
      const submitted = new Date(pp.submittedAt)
      return pp.status === 'open' && submitted <= endOfWeek
    }).length
    openPainPoints.push(openCount)

    // totalPainPoints: cumulative pain points submitted <= endOfWeek
    const totalCount = painPoints.filter((pp) => {
      const submitted = new Date(pp.submittedAt)
      return submitted <= endOfWeek
    }).length
    totalPainPoints.push(totalCount)
  }

  // pilots: reuse getPipelineDepthSeries
  const pilots = getPipelineDepthSeries(applications, WEEKS)

  return {
    implementations,
    pilots,
    signal,
    openPainPoints,
    totalPainPoints,
  }
}

/**
 * Groups pain points by department, computes each dept's share as a percentage,
 * sorts descending, and returns the top 4 entries.
 */
export function getDeptBarData(
  painPoints: PainPoint[],
): { label: string; pct: number }[] {
  if (painPoints.length === 0) return []

  const counts: Record<string, number> = {}
  for (const pp of painPoints) {
    counts[pp.department] = (counts[pp.department] ?? 0) + 1
  }

  const total = painPoints.length

  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      pct: Math.round((count / total) * 1000) / 10, // rounds to 1 decimal
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4)
}
