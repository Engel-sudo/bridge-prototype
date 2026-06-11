import { useNavigate } from 'react-router-dom'
import type { PainPoint } from '../store/types'
import { useBridgeStore } from '../store/store'
import { useAuthStore } from '../store/authStore'

const statusStyles: Record<string, { color: string; bg: string; label: string }> = {
  open: { color: 'var(--amber)', bg: 'rgba(245,158,11,0.12)', label: 'Open' },
  matched: { color: 'var(--accent)', bg: 'var(--accent-dim)', label: 'Matched' },
  in_pilot: { color: 'var(--blue)', bg: 'rgba(59,130,246,0.12)', label: 'In Pilot' },
}

interface Props {
  painPoint: PainPoint
  showMatch?: boolean
}

function truncateWords(text: string, max: number): string {
  if (text.length <= max) return text
  const sliced = text.slice(0, max)
  const lastSpace = sliced.lastIndexOf(' ')
  return (lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced) + '…'
}

export default function PainPointCard({ painPoint, showMatch }: Props) {
  const navigate = useNavigate()
  const { role } = useAuthStore()
  const { applications, matchPainPoint } = useBridgeStore()
  const canMatch = role === 'internal_lead' || role === 'admin'
  const style = statusStyles[painPoint.status]
  const linkedApp = applications.find(a => a.id === painPoint.linkedApplicationId)

  return (
    <div className="card" style={{ padding: '16px', transition: 'all 0.15s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>
            {painPoint.department}
          </span>
          <div style={{ fontFamily: 'AudiType', fontWeight: 600, fontSize: '13px', color: 'var(--text)', marginTop: '3px', lineHeight: '1.4' }}>
            {painPoint.title}
          </div>
        </div>
        <span style={{
          fontFamily: 'AudiType', fontSize: '11px',
          color: style.color, background: style.bg, padding: '3px 8px', borderRadius: '0', flexShrink: 0,
        }}>
          {style.label}
        </span>
      </div>

      <div style={{ fontFamily: 'AudiType', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '10px' }}>
        {truncateWords(painPoint.description, 140)}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>
          by {painPoint.submittedBy} · {painPoint.submittedAt}
        </div>

        {linkedApp && (
          <div
            onClick={canMatch ? () => navigate('/owner') : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--accent-dim)', border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)', padding: '4px 8px',
              cursor: canMatch ? 'pointer' : 'default',
            }}
          >
            <div style={{ width: '6px', height: '6px', background: 'var(--accent)', borderRadius: '0' }} />
            <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--accent)' }}>
              {canMatch ? '→ ' : ''}{linkedApp.companyName}
            </span>
          </div>
        )}

        {canMatch && showMatch && painPoint.status === 'open' && (
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
