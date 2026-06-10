interface Props {
  kicker: string
  value: string | number
  caption?: string
  accent?: 'lime' | 'red' | 'amber' | 'blue' | 'muted'
  size?: 'sm' | 'md' | 'lg'
}

const accentColor: Record<string, string> = {
  lime: 'var(--lime)',
  red: 'var(--red)',
  amber: 'var(--amber)',
  blue: 'var(--blue)',
  muted: 'var(--text-muted)',
}

const sizes: Record<string, string> = {
  sm: '28px',
  md: '40px',
  lg: 'clamp(40px, 6vw, 64px)',
}

export default function MetricStat({ kicker, value, caption, accent = 'lime', size = 'lg' }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span className="kicker">{kicker}</span>
      <span style={{
        fontFamily: 'Inter',
        fontWeight: 800,
        fontSize: sizes[size],
        lineHeight: 1,
        color: accentColor[accent],
      }}>
        {value}
      </span>
      {caption && (
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.08em' }}>
          {caption}
        </span>
      )}
    </div>
  )
}
