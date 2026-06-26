import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Zap, Check, X, ExternalLink, Users, AlertCircle, Trash2 } from 'lucide-react'
import { useBridgeStore } from '../store/store'
import { useAuthStore } from '../store/authStore'
import StatusTimeline from '../components/StatusTimeline'
import OwnerCard from '../components/OwnerCard'
import DemoHint from '../components/DemoHint'
import type { Application } from '../store/types'

const isOverdue = (a: Application) =>
  a.daysInProcess > 14 &&
  !['decision_go', 'decision_redirect', 'matched_pain_owner', 'path_to_production'].includes(a.stage)

const STAGE_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  named_contact: 'Named Contact',
  owner_assigned: 'Lead Assigned',
  in_review: 'In Review',
  signal_sent: '2-Week Decision',
  decision_go: 'Go',
  decision_redirect: 'Redirect',
  matched_pain_owner: 'Pain Matched',
  path_to_production: 'In Production',
}

const stageColor: Record<string, string> = {
  submitted: 'var(--text-faint)',
  named_contact: 'var(--blue)',
  owner_assigned: 'var(--accent)',
  in_review: 'var(--amber)',
  signal_sent: 'var(--amber)',
  decision_go: 'var(--accent)',
  decision_redirect: 'var(--red)',
  matched_pain_owner: 'var(--accent)',
  path_to_production: 'var(--accent)',
}

function Initials({ name, color }: { name: string; color: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '0', flexShrink: 0,
      background: `${color}18`, border: `1px solid ${color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'AudiType', fontWeight: 700, fontSize: '13px', color,
    }}>
      {initials}
    </div>
  )
}

export default function OwnerConsole() {
  const { applications, owners, advanceStage, revertApplication, assignOwner, decide, deleteApplication, metrics, painPoints, poolMembers, addToPool } = useBridgeStore()
  const isAdmin = useAuthStore(s => s.role) === 'admin'
  const owner = owners.find(o => o.id === 'o3') || owners[0]
  const unassigned = applications.filter(a => a.ownerId === null)
  const myApps = applications.filter(a => a.ownerId === owner.id || a.ownerId === 'o2')
  const queue = [...unassigned, ...myApps]
  const [selected, setSelected] = useState<Application | null>(queue[0] || null)
  const [advancing, setAdvancing] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [addedToPool, setAddedToPool] = useState<string | null>(null)

  // Undo toast — holds the pre-action snapshot for 6 seconds after any stage change
  const [undoSnap, setUndoSnap] = useState<{ prev: Application; label: string } | null>(null)
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showUndo(prev: Application, label: string) {
    if (undoTimer.current) clearTimeout(undoTimer.current)
    setUndoSnap({ prev, label })
    undoTimer.current = setTimeout(() => setUndoSnap(null), 6000)
  }

  function handleUndo() {
    if (!undoSnap) return
    if (undoTimer.current) clearTimeout(undoTimer.current)
    revertApplication(undoSnap.prev)
    const reverted = useBridgeStore.getState().applications.find(a => a.id === undoSnap.prev.id)
    if (reverted) setSelected(reverted)
    setUndoSnap(null)
  }

  const matchedPPCount = painPoints.filter(pp => pp.status === 'matched' || pp.status === 'in_pilot').length
  const linkedPP = (appId: string) => painPoints.find(pp => pp.linkedApplicationId === appId) ?? null
  const selectedPP = selected ? linkedPP(selected.id) : null
  const DEPLOY_LABEL: Record<string, string> = { cloud: 'Cloud (SaaS)', onprem: 'On-premise', edge: 'On the machine / edge', hybrid: 'Hybrid' }
  const ext = (url: string) => (url.startsWith('http') ? url : `https://${url}`)

  function handleAdvance(appId: string) {
    const prev = applications.find(a => a.id === appId)
    setAdvancing(true)
    setTimeout(() => {
      advanceStage(appId)
      const updated = useBridgeStore.getState().applications.find(a => a.id === appId)
      if (updated) setSelected(updated)
      setAdvancing(false)
      if (prev) showUndo(prev, `Advanced to ${STAGE_LABELS[updated?.stage ?? '']}`)
    }, 600)
  }

  function handleClaim(appId: string) {
    const prev = applications.find(a => a.id === appId)
    setClaiming(true)
    setTimeout(() => {
      assignOwner(appId, owner.id)
      const updated = useBridgeStore.getState().applications.find(a => a.id === appId)
      if (updated) setSelected(updated)
      setClaiming(false)
      if (prev) showUndo(prev, `Claimed ${prev.companyName}`)
    }, 600)
  }

  function handleDecide(appId: string, outcome: 'go' | 'redirect') {
    const prev = applications.find(a => a.id === appId)
    setAdvancing(true)
    setTimeout(() => {
      decide(appId, outcome)
      const updated = useBridgeStore.getState().applications.find(a => a.id === appId)
      if (updated) setSelected(updated)
      setAdvancing(false)
      if (prev) showUndo(prev, outcome === 'go' ? 'Decision: GO' : 'Decision: Redirect')
    }, 600)
  }

  // Admin-only: remove a junk/test application. Re-point the detail at whatever
  // is left in the queue so the panel never references a deleted row.
  function handleDelete(app: Application) {
    if (!window.confirm(`Delete application “${app.companyName}” (${app.id})? This can't be undone.`)) return
    deleteApplication(app.id)
    const remaining = useBridgeStore.getState().applications
    setSelected(remaining.find(a => a.ownerId === null || a.ownerId === owner.id || a.ownerId === 'o2') ?? remaining[0] ?? null)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '80px 40px 60px', maxWidth: '1280px', margin: '0 auto' }}
    >
      <DemoHint persona="You are an Audi Internal Lead" hint="Claim a new (amber) startup, advance its stage, then make the Go or Redirect call at the 2-week decision. Try the overdue one." />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
        <span className="kicker">internal lead console</span>
        <h1 style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 3.5vw, 38px)', color: 'var(--text)', lineHeight: 1.1 }}>
          Startup Queue
        </h1>
        <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {queue.length} startups · {unassigned.length} unclaimed · {queue.filter(isOverdue).length} overdue
        </p>
      </motion.div>

      {/* KPI strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1px',
          background: 'var(--border)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          marginBottom: '28px',
        }}
      >
        {[
          { kicker: 'Implementations',     value: metrics.implementations,        color: 'var(--accent)',  caption: 'idea → car · primary KPI' },
          { kicker: 'Pain points matched', value: matchedPPCount,                 color: 'var(--blue)',  caption: 'linked to a startup' },
          { kicker: 'Startups in queue',   value: myApps.length,                  color: 'var(--text)',  caption: 'active in pipeline' },
          { kicker: 'Avg days to decision', value: `${owner.avgDaysToSignal}d`,    color: owner.avgDaysToSignal <= 14 ? 'var(--accent)' : 'var(--amber)', caption: 'target: 14 days' },
        ].map(item => (
          <div key={item.kicker} style={{ background: 'var(--surface)', padding: '18px 20px' }}>
            <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '4px' }}>
              {item.kicker}
            </span>
            <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '28px', color: item.color, lineHeight: 1 }}>
              {item.value}
            </div>
            <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>
              {item.caption}
            </div>
          </div>
        ))}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px' }}>
        {/* Queue list */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <span className="kicker" style={{ marginBottom: '10px', display: 'block' }}>
            startup queue {unassigned.length > 0 && `· ${unassigned.length} new`}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {queue.map(app => {
              const isSelected = selected?.id === app.id
              const isUnassigned = app.ownerId === null
              const overdue = isOverdue(app)
              const accentColor = isUnassigned ? 'var(--amber)' : stageColor[app.stage] || 'var(--text-faint)'
              const pp = linkedPP(app.id)
              return (
                <button
                  key={app.id}
                  onClick={() => setSelected(app)}
                  style={{
                    background: isSelected ? 'var(--surface-2)' : 'var(--surface)',
                    // Use per-side longhands (not `border` + `borderLeft`) so React
                    // doesn't warn about mixing shorthand/non-shorthand on rerender.
                    borderTop: `1px solid ${isSelected ? 'var(--accent)' : isUnassigned ? 'var(--amber)' : overdue ? 'var(--red)' : 'var(--border)'}`,
                    borderRight: `1px solid ${isSelected ? 'var(--accent)' : isUnassigned ? 'var(--amber)' : overdue ? 'var(--red)' : 'var(--border)'}`,
                    borderBottom: `1px solid ${isSelected ? 'var(--accent)' : isUnassigned ? 'var(--amber)' : overdue ? 'var(--red)' : 'var(--border)'}`,
                    borderLeft: `3px solid ${isUnassigned ? 'var(--amber)' : overdue ? 'var(--red)' : isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    width: '100%',
                  }}
                >
                  {/* Avatar */}
                  <Initials name={app.companyName} color={accentColor} />

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '13px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {app.companyName}
                      </span>
                      <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: overdue ? 'var(--red)' : 'var(--text-faint)', flexShrink: 0 }}>
                        day {app.daysInProcess}
                      </span>
                    </div>

                    {/* Tech tag + stage badge */}
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: pp ? '6px' : 0 }}>
                      <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>
                        {app.technology}
                      </span>
                      <span style={{
                        fontFamily: 'AudiType', fontSize: '11px',
                        color: accentColor, background: `${accentColor}18`, padding: '1px 6px', borderRadius: '0',
                      }}>
                        {isUnassigned ? 'Unclaimed' : STAGE_LABELS[app.stage]}
                      </span>
                      {overdue && (
                        <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--red)', background: 'var(--red-dim)', padding: '1px 6px', borderRadius: '0', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <AlertCircle size={9} /> overdue
                        </span>
                      )}
                    </div>

                    {/* Linked pain point */}
                    {pp && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid var(--border)' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                        <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {pp.title}
                        </span>
                      </div>
                    )}
                  </div>

                  <ChevronRight size={13} color={isSelected ? 'var(--accent)' : 'var(--text-faint)'} style={{ flexShrink: 0, marginTop: '2px' }} />
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {/* App header */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <Initials name={selected.companyName} color={selected.ownerId === null ? 'var(--amber)' : stageColor[selected.stage] || 'var(--accent)'} />
                    <div>
                      <span className="kicker" style={{ marginBottom: '2px' }}>{selected.id}</span>
                      <h2 style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: '22px', color: 'var(--text)', lineHeight: 1.1 }}>
                        {selected.companyName}
                      </h2>
                      <div style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {selected.technology} · {selected.founderName}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: isOverdue(selected) ? 'var(--red)' : 'var(--text-faint)' }}>
                      day {selected.daysInProcess} · decision by {selected.signalDeadline}
                    </span>
                    {isOverdue(selected) && (
                      <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--red)', background: 'var(--red-dim)', padding: '3px 8px', borderRadius: '0' }}>
                        Overdue
                      </span>
                    )}
                    {selected.ownerId !== null && (
                      <Link to={`/founder/${selected.id}`} className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <ExternalLink size={13} /> View as founder
                      </Link>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(selected)}
                        aria-label="Delete application"
                        title="Delete this application (admin)"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'AudiType', fontSize: '13px', fontWeight: 600, padding: '8px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--red)', background: 'transparent', border: '1px solid var(--red)' }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    )}
                    {selected.ownerId === null ? (
                      <button className="btn-primary" onClick={() => handleClaim(selected.id)} disabled={claiming} style={{ opacity: claiming ? 0.7 : 1 }}>
                        <Zap size={14} />
                        {claiming ? 'Claiming…' : 'Claim Startup'}
                      </button>
                    ) : selected.stage === 'signal_sent' ? (
                      <>
                        <button className="btn-primary" onClick={() => handleDecide(selected.id, 'go')} disabled={advancing} style={{ opacity: advancing ? 0.7 : 1 }}>
                          <Check size={14} /> Go
                        </button>
                        <button
                          onClick={() => handleDecide(selected.id, 'redirect')}
                          disabled={advancing}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'AudiType', fontSize: '13px', fontWeight: 600, padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--red)', background: 'transparent', border: '1px solid var(--red)', opacity: advancing ? 0.7 : 1 }}
                        >
                          <X size={14} /> Redirect
                        </button>
                      </>
                    ) : !['decision_redirect', 'path_to_production'].includes(selected.stage) ? (
                      <button className="btn-primary" onClick={() => handleAdvance(selected.id)} disabled={advancing} style={{ opacity: advancing ? 0.7 : 1 }}>
                        <Zap size={14} />
                        {advancing ? 'Advancing…' : 'Advance Stage'}
                      </button>
                    ) : null}

                    {selected.stage === 'decision_redirect' && (() => {
                      const alreadyInPool = poolMembers.some(m => m.applicationId === selected.id)
                      const justAdded = addedToPool === selected.id
                      if (alreadyInPool || justAdded) {
                        return (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'AudiType', fontSize: '11px', color: 'var(--blue)', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', padding: '5px 10px', borderRadius: 'var(--radius-sm)' }}>
                            <Users size={11} /> In community pool
                          </span>
                        )
                      }
                      return (
                        <button
                          onClick={() => {
                            addToPool({ id: `pm-${selected.id}`, name: selected.founderName, company: selected.companyName, type: 'startup', techArea: selected.technology, addedAt: new Date().toISOString().slice(0, 10), addedByName: owner.name, applicationId: selected.id, notes: `Added from BRIDGE pipeline. ${selected.notes}` })
                            setAddedToPool(selected.id)
                          }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'AudiType', fontSize: '13px', fontWeight: 600, padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--blue)', background: 'transparent', border: '1px solid rgba(59,130,246,0.4)', transition: 'all 0.15s' }}
                        >
                          <Users size={14} /> Add to community pool
                        </button>
                      )
                    })()}
                  </div>
                </div>

                <StatusTimeline current={selected.stage} />
              </div>

              {/* Owner */}
              {selected.ownerId && (() => {
                const o = owners.find(o => o.id === selected.ownerId)
                return o ? <OwnerCard owner={o} /> : null
              })()}

              {/* Full application detail — everything the founder submitted */}
              <div className="card" style={{ padding: '16px' }}>
                <span className="kicker" style={{ marginBottom: '12px', display: 'block' }}>application detail</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {([
                    ['Founder', selected.founderName],
                    selected.region && ['Region', selected.region],
                    ['Funding', selected.funding],
                    ['Team size', `${selected.teamSize} people`],
                    selected.targetDepartment && ['Target dept', selected.targetDepartment],
                    selected.productStage && ['Current stage', selected.productStage],
                    selected.trl ? ['TRL', `T${selected.trl}`] : null,
                    selected.monthsToMarket && ['Months to market', selected.monthsToMarket],
                    selected.partnerType && ['Partnership', selected.partnerType],
                    selected.timeline && ['Timeline', selected.timeline],
                    selected.complianceCert && ['Compliance', selected.complianceCert],
                    (selected.deployment && selected.deployment.length)
                      ? ['Runs as', selected.deployment.map(k => DEPLOY_LABEL[k] ?? k).join(', ')] : null,
                    selected.connectsTo && ['Connects to', selected.connectsTo],
                    selected.wantsVisit === true ? ['Plant visit', 'Requested'] : null,
                    ['Submitted', selected.submittedAt],
                  ].filter(Boolean) as [string, string][]).map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                      <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', flexShrink: 0 }}>{label}</span>
                      <span style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text)', textAlign: 'right' }}>{value}</span>
                    </div>
                  ))}

                  {(selected.website || selected.linkedin) && (
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', paddingTop: '4px' }}>
                      {selected.website && <a href={ext(selected.website)} target="_blank" rel="noreferrer" style={{ fontFamily: 'AudiType', fontSize: '12px', color: 'var(--accent)' }}>Website ↗</a>}
                      {selected.linkedin && <a href={ext(selected.linkedin)} target="_blank" rel="noreferrer" style={{ fontFamily: 'AudiType', fontSize: '12px', color: 'var(--accent)' }}>LinkedIn ↗</a>}
                    </div>
                  )}
                </div>

                {([
                  selected.teamMembers && ['Team members', selected.teamMembers],
                  selected.formerProjects && ['Former projects / traction', selected.formerProjects],
                  selected.milestones && ['Milestones — next 24 months', selected.milestones],
                ].filter(Boolean) as [string, string][]).map(([label, text]) => (
                  <div key={label} style={{ marginTop: '14px' }}>
                    <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '4px' }}>{label}</span>
                    <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>{text}</p>
                  </div>
                ))}
              </div>

              {/* Linked pain point */}
              {selectedPP && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderLeft: '3px solid var(--accent)',
                    borderRadius: 'var(--radius)',
                    padding: '16px 20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className="kicker" style={{ margin: 0 }}>linked pain point</span>
                    <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: '0' }}>
                      {selectedPP.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'AudiType', fontWeight: 600, fontSize: '14px', color: 'var(--text)', marginBottom: '4px' }}>
                    {selectedPP.title}
                  </div>
                  <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginBottom: '8px' }}>
                    {selectedPP.department} · submitted by {selectedPP.submittedBy}
                  </div>
                  <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                    {selectedPP.description}
                  </p>
                </motion.div>
              )}

              {/* Notes */}
              <div className="card" style={{ padding: '16px' }}>
                <span className="kicker" style={{ marginBottom: '8px', display: 'block' }}>notes</span>
                <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {selected.notes}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Undo toast — appears for 6 seconds after any stage change */}
      <AnimatePresence>
        {undoSnap && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
              background: 'var(--surface)', border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius)', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: '14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.18)', zIndex: 1000,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text)' }}>
              {undoSnap.label}
            </span>
            <button
              onClick={handleUndo}
              className="btn-secondary"
              style={{ padding: '5px 14px', fontSize: '12px', fontWeight: 700 }}
            >
              Undo
            </button>
            <button
              onClick={() => { if (undoTimer.current) clearTimeout(undoTimer.current); setUndoSnap(null) }}
              aria-label="Dismiss"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '16px', lineHeight: 1, padding: '2px 4px' }}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
