// Network viz: Startups → Pain Points → Pilots → Departments
// Ported from thefifthring, seeded with real Bridge data

const startups = [
  { x: 80,  y: 100, label: 'VisionQual' },
  { x: 60,  y: 210, label: 'FlowRoute' },
  { x: 100, y: 320, label: 'GridMind' },
  { x: 70,  y: 430, label: 'CarbonLens' },
]

const hubs = [
  { x: 360, y: 160, label: 'Pain · QA throughput' },
  { x: 400, y: 300, label: 'Pain · logistics delay' },
  { x: 340, y: 430, label: 'Pain · energy peaks' },
]

const pilots = [
  { x: 670, y: 120, label: 'Pilot — QC AI' },
  { x: 700, y: 240, label: 'Pilot — Logistics' },
  { x: 660, y: 360, label: 'Pilot — Energy' },
  { x: 690, y: 470, label: 'Pilot — Carbon' },
]

const departments = [
  { x: 920, y: 90,  label: 'Quality' },
  { x: 960, y: 195, label: 'Logistics' },
  { x: 940, y: 300, label: 'Production' },
  { x: 920, y: 400, label: 'R&D' },
  { x: 880, y: 490, label: 'Procurement' },
]

const edges: [{ x: number; y: number }, { x: number; y: number }][] = [
  [startups[0], hubs[0]],
  [startups[1], hubs[0]],
  [startups[1], hubs[1]],
  [startups[2], hubs[1]],
  [startups[2], hubs[2]],
  [startups[3], hubs[2]],
  [hubs[0], pilots[0]],
  [hubs[0], pilots[1]],
  [hubs[1], pilots[1]],
  [hubs[1], pilots[2]],
  [hubs[2], pilots[2]],
  [hubs[2], pilots[3]],
  [pilots[0], departments[0]],
  [pilots[1], departments[1]],
  [pilots[1], departments[2]],
  [pilots[2], departments[2]],
  [pilots[2], departments[3]],
  [pilots[3], departments[3]],
  [pilots[3], departments[4]],
]

export default function NetworkViz() {
  return (
    <svg viewBox="0 0 1000 560" style={{ width: '100%', height: '100%', display: 'block' }}>
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
      <rect width="1000" height="560" fill="url(#nv-grid)" />

      {/* Column labels */}
      {[
        { x: 80,  label: 'STARTUPS' },
        { x: 370, label: 'PAIN POINTS' },
        { x: 680, label: 'PILOTS' },
        { x: 925, label: 'DEPARTMENTS' },
      ].map(c => (
        <text
          key={c.label}
          x={c.x}
          y={34}
          textAnchor="middle"
          fill="var(--text-faint)"
          style={{ fontFamily: 'IBM Plex Mono', fontSize: 9, letterSpacing: 3 }}
        >
          {c.label}
        </text>
      ))}

      {/* Edges — base */}
      {edges.map(([a, b], i) => {
        const mx = (a.x + b.x) / 2
        const d = `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`
        return (
          <path key={`base-${i}`} d={d} stroke="var(--border-strong)" strokeWidth="1" fill="none" />
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
      {([...startups, ...hubs, ...pilots, ...departments] as { x: number; y: number; label: string }[]).map((n, i) => {
        const isHub = (hubs as { x: number; y: number; label: string }[]).includes(n)
        return (
          <g key={i}>
            {isHub && <circle cx={n.x} cy={n.y} r="22" fill="url(#nv-glow)" />}
            <circle
              cx={n.x} cy={n.y}
              r={isHub ? 5 : 3.5}
              fill={isHub ? 'var(--lime)' : 'var(--text)'}
              opacity={isHub ? 1 : 0.8}
            />
            <circle
              cx={n.x} cy={n.y}
              r={isHub ? 10 : 7}
              stroke={isHub ? 'var(--lime)' : 'var(--border-strong)'}
              strokeOpacity="0.4"
              fill="none"
            />
            <text
              x={n.x + 13}
              y={n.y + 4}
              fill="var(--text-muted)"
              style={{ fontFamily: 'IBM Plex Mono', fontSize: 9.5, letterSpacing: 0.5 }}
            >
              {n.label}
            </text>
          </g>
        )
      })}

      {/* Scan line */}
      <rect
        x="0" y="0" width="1000" height="60"
        fill="url(#nv-scan)"
        className="animate-scan-y"
      />
    </svg>
  )
}
