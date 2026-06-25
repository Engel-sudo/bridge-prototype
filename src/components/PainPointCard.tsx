import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Check, X, Eye, EyeOff } from 'lucide-react'
import type { PainPoint, PainPointStatus } from '../store/types'
import { useBridgeStore } from '../store/store'
import { useAuthStore } from '../store/authStore'

const statusStyles: Record<string, { color: string; bg: string; label: string }> = {
  open: { color: 'var(--amber)', bg: 'rgba(245,158,11,0.12)', label: 'Open' },
  matched: { color: 'var(--accent)', bg: 'var(--accent-dim)', label: 'Matched' },
  in_pilot: { color: 'var(--blue)', bg: 'rgba(59,130,246,0.12)', label: 'In Pilot' },
}

const DEPARTMENTS = ['Quality', 'Production', 'Logistics', 'R&D', 'Procurement', 'Innovation & Ventures']
const STATUSES: PainPointStatus[] = ['open', 'matched', 'in_pilot']

interface Props {
  painPoint: PainPoint
  showMatch?: boolean
  clusterLabel?: string
}

const iconBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '26px', height: '26px', border: '1px solid var(--border-strong)',
  background: 'transparent', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-faint)',
}

export default function PainPointCard({ painPoint, showMatch, clusterLabel }: Props) {
  const navigate = useNavigate()
  const { role } = useAuthStore()
  const { applications, matchPainPoint, updatePainPoint, deletePainPoint } = useBridgeStore()
  const canMatch = role === 'internal_lead' || role === 'admin'
  const isAdmin = role === 'admin'
  const style = statusStyles[painPoint.status]
  const linkedApp = applications.find(a => a.id === painPoint.linkedApplicationId)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({
    title: painPoint.title,
    description: painPoint.description,
    department: painPoint.department,
    status: painPoint.status,
  })

  function startEdit() {
    setDraft({ title: painPoint.title, description: painPoint.description, department: painPoint.department, status: painPoint.status })
    setEditing(true)
  }
  function save() {
    updatePainPoint({ ...painPoint, ...draft })
    setEditing(false)
  }
  function remove() {
    if (window.confirm(`Delete pain point “${painPoint.title}”? This can't be undone.`)) {
      deletePainPoint(painPoint.id)
    }
  }

  // Default-shared: only an explicit false hides it from the community.
  const isShared = painPoint.sharedWithCommunity !== false
  function toggleShared() {
    updatePainPoint({ ...painPoint, sharedWithCommunity: !isShared })
  }

  // ── Admin edit mode ─────────────────────────────────────────────────────
  if (editing) {
    return (
      <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>Editing pain point</span>
        <input className="input" value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} placeholder="Title" />
        <textarea className="input" value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} placeholder="Description" style={{ minHeight: '70px' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <select className="input" value={draft.department} onChange={e => setDraft(d => ({ ...d, department: e.target.value }))}>
            {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
          </select>
          <select className="input" value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value as PainPointStatus }))}>
            {STATUSES.map(s => <option key={s} value={s}>{statusStyles[s].label}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={() => setEditing(false)} style={{ ...iconBtn, width: 'auto', padding: '0 12px', gap: '6px', fontFamily: 'AudiType', fontSize: '12px' }}><X size={13} /> Cancel</button>
          <button onClick={save} className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}><Check size={13} /> Save</button>
        </div>
      </div>
    )
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {isAdmin && !isShared && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontFamily: 'AudiType', fontSize: '11px',
              color: 'var(--text-faint)', background: 'var(--surface-2)', padding: '3px 8px',
            }}>
              <EyeOff size={11} /> Hidden
            </span>
          )}
          <span style={{
            fontFamily: 'AudiType', fontSize: '11px',
            color: style.color, background: style.bg, padding: '3px 8px', borderRadius: '0',
          }}>
            {style.label}
          </span>
          {isAdmin && (
            <>
              <button
                title={isShared ? 'Shared with community — click to hide' : 'Hidden from community — click to share'}
                aria-label={isShared ? 'Hide from community' : 'Share with community'}
                onClick={toggleShared}
                style={{ ...iconBtn, color: isShared ? 'var(--accent)' : 'var(--text-faint)', borderColor: isShared ? 'var(--accent)' : 'var(--border-strong)' }}
              >
                {isShared ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
              <button title="Edit" onClick={startEdit} style={iconBtn}><Pencil size={13} /></button>
              <button title="Delete" onClick={remove} style={{ ...iconBtn, color: 'var(--red)', borderColor: 'var(--red)' }}><Trash2 size={13} /></button>
            </>
          )}
        </div>
      </div>

      {clusterLabel && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ width: '5px', height: '5px', background: 'var(--accent)', display: 'inline-block' }} />
          <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--accent)' }}>{clusterLabel}</span>
        </div>
      )}

      <div
        style={{
          fontFamily: 'AudiType', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5',
          marginBottom: '10px',
        }}
      >
        {painPoint.description}
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
