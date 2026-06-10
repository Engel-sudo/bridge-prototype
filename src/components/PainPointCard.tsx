import type { PainPoint } from '../store/types'
import { useBridgeStore } from '../store/store'

const statusStyles: Record<string, { color: string; bg: string; label: string }> = {
  open: { color: 'var(--amber)', bg: 'rgba(245,158,11,0.12)', label: 'Open' },
  matched: { color: 'var(--lime)', bg: 'rgba(214,255,0,0.10)', label: 'Matched' },
  in_pilot: { color: 'var(--blue)', bg: 'rgba(59,130,246,0.12)', label: 'In Pilot' },
}

interface Props {
  painPoint: PainPoint
  showMatch?: boolean
}

export default function PainPointCard({ painPoint, showMatch }: Props) {
  const { applications, matchPainPoint } = useBridgeStore()
  const style = statusStyles[painPoint.status]
  const linkedApp = applications.find(a => a.id === painPoint.linkedApplicationId)

  return (
    <div className="card" style={{ padding: '16px', transition: 'all 0.15s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
            {painPoint.department}
          </span>
          <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '13px', color: 'var(--text)', marginTop: '3px', lineHeight: '1.4' }}>
            {painPoint.title}
          </div>
        </div>
        <span style={{
          fontFamily: 'JetBrains Mono', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase',
          color: style.color, background: style.bg, padding: '3px 8px', borderRadius: '3px', flexShrink: 0,
        }}>
          {style.label}
        </span>
      </div>

      <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '10px' }}>
        {painPoint.description.length > 140 ? painPoint.description.slice(0, 140) + '…' : painPoint.description}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.08em' }}>
          by {painPoint.submittedBy} · {painPoint.submittedAt}
        </div>

        {linkedApp && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(214,255,0,0.08)', border: '1px solid rgba(214,255,0,0.2)',
            borderRadius: 'var(--radius-sm)', padding: '4px 8px',
          }}>
            <div style={{ width: '6px', height: '6px', background: 'var(--lime)', borderRadius: '1px' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'var(--lime)', letterSpacing: '0.08em' }}>
              → {linkedApp.companyName}
            </span>
          </div>
        )}

        {showMatch && painPoint.status === 'open' && (
          <select
            className="input"
            style={{ fontSize: '11px', padding: '4px 8px', width: 'auto', color: 'var(--text-faint)' }}
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) matchPainPoint(painPoint.id, e.target.value)
            }}
          >
            <option value="" disabled>Match to startup…</option>
            {applications.map(a => (
              <option key={a.id} value={a.id}>{a.companyName}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}
