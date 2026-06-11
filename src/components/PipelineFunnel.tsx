interface FunnelStage {
  label: string
  value: number
  color: string
}

const stages: FunnelStage[] = [
  { label: 'Interest / Door', value: 27, color: 'var(--blue)' },
  { label: 'Internal Lead Assigned', value: 18, color: 'var(--accent)' },
  { label: 'Map / Match', value: 11, color: 'var(--accent-dim)' },
  { label: 'In Review', value: 7, color: 'var(--amber)' },
  { label: 'Signal Sent', value: 5, color: 'var(--amber)' },
  { label: 'Idea → Car', value: 3, color: 'var(--accent)' },
]

export default function PipelineFunnel() {
  const max = stages[0].value

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {stages.map((stage, i) => {
        const pct = (stage.value / max) * 100
        const isLast = i === stages.length - 1
        return (
          <div key={stage.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '120px', fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', textAlign: 'right', flexShrink: 0 }}>
              {stage.label}
            </div>
            <div style={{ flex: 1, height: isLast ? '20px' : '14px', background: 'var(--border)', borderRadius: '0', overflow: 'hidden', position: 'relative' }}>
              <div style={{
                width: `${pct}%`,
                height: '100%',
                background: isLast ? 'var(--accent)' : stage.color,
                borderRadius: '0',
                opacity: isLast ? 1 : 0.75,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{
              width: '28px',
              fontFamily: 'AudiType',
              fontWeight: 700,
              fontSize: isLast ? '18px' : '14px',
              color: isLast ? 'var(--accent)' : 'var(--text)',
              textAlign: 'right',
              flexShrink: 0,
            }}>
              {stage.value}
            </div>
          </div>
        )
      })}
    </div>
  )
}
