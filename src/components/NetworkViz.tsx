// Network viz: Startups → Pain Points → Pilots → Departments
// viewBox 1000×310 (3.2:1 ratio) so SVG fills full width at any container size
// All nodes and edges derived from useBridgeStore — no hardcoded data.

import { useBridgeStore } from '../store/store'

const START_Y = 40
const RANGE = 260
const COL = { startup: 80, pain: 370, pilot: 650, dept: 900 }

function spacing(count: number) {
  return RANGE / Math.max(count - 1, 1)
}

function ys(count: number): number[] {
  if (count === 0) return []
  if (count === 1) return [START_Y + RANGE / 2]
  const sp = spacing(count)
  return Array.from({ length: count }, (_, i) => START_Y + i * sp)
}

interface NodeDef {
  x: number
  y: number
  label: string
  color: string
  isHub?: boolean
}

export default function NetworkViz() {
  const applications = useBridgeStore((s) => s.applications)
  const painPoints = useBridgeStore((s) => s.painPoints)

  // Pain points that have been matched (have a linked application)
  const matchedPPs = painPoints.filter((pp) => pp.linkedApplicationId !== null)

  // Set of app ids that have at least one matched pain point
  const matchedAppIds = new Set(matchedPPs.map((pp) => pp.linkedApplicationId as string))

  // Unique departments from matched pain points only
  const deptLabels = Array.from(new Set(matchedPPs.map((pp) => pp.department)))

  // --- Y positions ---
  const startupYs = ys(applications.length)
  const ppYs = ys(matchedPPs.length)
  const pilotYs = ppYs // same positions as matched pain points
  const deptYs = ys(deptLabels.length)

  // --- Node arrays ---
  const startupNodes: NodeDef[] = applications.map((app, i) => ({
    x: COL.startup,
    y: startupYs[i],
    label: app.companyName,
    color: matchedAppIds.has(app.id) ? 'var(--lime)' : 'var(--text)',
  }))

  const ppNodes: NodeDef[] = matchedPPs.map((pp, i) => ({
    x: COL.pain,
    y: ppYs[i],
    label: pp.title.length > 28 ? pp.title.slice(0, 28) + '…' : pp.title,
    color: 'var(--lime)',
    isHub: true,
  }))

  const pilotNodes: NodeDef[] = matchedPPs.map((pp, i) => ({
    x: COL.pilot,
    y: pilotYs[i],
    label: 'Pilot — ' + pp.department,
    color: 'var(--blue)',
  }))

  const deptNodes: NodeDef[] = deptLabels.map((dept, i) => ({
    x: COL.dept,
    y: deptYs[i],
    label: dept,
    color: 'var(--text-muted)',
  }))

  // --- Edges ---
  type Coord = { x: number; y: number }
  const edges: [Coord, Coord][] = []

  // Application → MatchedPainPoint
  matchedPPs.forEach((pp, ppIdx) => {
    const appIdx = applications.findIndex((a) => a.id === pp.linkedApplicationId)
    if (appIdx !== -1) {
      edges.push([startupNodes[appIdx], ppNodes[ppIdx]])
    }
  })

  // MatchedPainPoint → Pilot (one-to-one by index)
  matchedPPs.forEach((_pp, i) => {
    edges.push([ppNodes[i], pilotNodes[i]])
  })

  // Pilot → Department
  matchedPPs.forEach((pp, i) => {
    const deptIdx = deptLabels.indexOf(pp.department)
    if (deptIdx !== -1) {
      edges.push([pilotNodes[i], deptNodes[deptIdx]])
    }
  })

  const hasMatches = matchedPPs.length > 0

  return (
    <svg
      viewBox="0 0 1000 310"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <defs>
        <linearGradient id="nv-edge" x1="0" x2="1">
          <stop offset="0%"   stopColor="var(--lime)" stopOpacity="0.04" />
          <stop offset="50%"  stopColor="var(--lime)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--lime)" stopOpacity="0.04" />
        </linearGradient>
        <radialGradient id="nv-glow">
          <stop offset="0%"   stopColor="var(--lime)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--lime)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nv-scan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--lime)" stopOpacity="0" />
          <stop offset="50%"  stopColor="var(--lime)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--lime)" stopOpacity="0" />
        </linearGradient>
        <pattern id="nv-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="var(--grid)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Background grid */}
      <rect width="1000" height="310" fill="url(#nv-grid)" />

      {/* Column labels */}
      {[
        { x: COL.startup, label: 'STARTUPS' },
        { x: COL.pain,    label: 'PAIN POINTS' },
        { x: COL.pilot,   label: 'PILOTS' },
        { x: COL.dept,    label: 'DEPARTMENTS' },
      ].map((c) => (
        <text
          key={c.label}
          x={c.x}
          y={22}
          textAnchor="middle"
          fill="var(--text-faint)"
          style={{ fontFamily: 'IBM Plex Mono', fontSize: 9, letterSpacing: 3 }}
        >
          {c.label}
        </text>
      ))}

      {/* No-matches placeholder */}
      {!hasMatches && (
        <text
          x={370}
          y={155}
          textAnchor="middle"
          fill="var(--text-faint)"
          style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, letterSpacing: 1 }}
        >
          No matches yet
        </text>
      )}

      {/* Edges — base */}
      {edges.map(([a, b], i) => {
        const mx = (a.x + b.x) / 2
        const d = `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`
        return (
          <path
            key={`base-${i}`}
            d={d}
            stroke="var(--border-strong)"
            strokeWidth="1"
            fill="none"
          />
        )
      })}

      {/* Edges — animated lime overlay */}
      {edges.map(([a, b], i) => {
        const mx = (a.x + b.x) / 2
        const d = `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`
        return (
          <path
            key={`anim-${i}`}
            d={d}
            stroke="url(#nv-edge)"
            strokeWidth="1.25"
            fill="none"
            strokeDasharray="4 8"
            className="animate-dash"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        )
      })}

      {/* Nodes */}
      {([...startupNodes, ...ppNodes, ...pilotNodes, ...deptNodes] as NodeDef[]).map((n, i) => (
        <g key={i}>
          {n.isHub && <circle cx={n.x} cy={n.y} r="16" fill="url(#nv-glow)" />}
          <circle
            cx={n.x}
            cy={n.y}
            r={n.isHub ? 5 : 3.5}
            fill={n.color}
            opacity={n.isHub ? 1 : 0.8}
          />
          <circle
            cx={n.x}
            cy={n.y}
            r={n.isHub ? 10 : 7}
            stroke={n.isHub ? 'var(--lime)' : 'var(--border-strong)'}
            strokeOpacity="0.4"
            fill="none"
          />
          <text
            x={n.x + 13}
            y={n.y + 4}
            fill={n.color}
            style={{ fontFamily: 'IBM Plex Mono', fontSize: 9.5, letterSpacing: 0.5 }}
          >
            {n.label}
          </text>
        </g>
      ))}

      {/* Scan line */}
      <rect x="0" y="0" width="1000" height="40" fill="url(#nv-scan)" className="animate-scan-y" />
    </svg>
  )
}
