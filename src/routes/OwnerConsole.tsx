import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Zap, Check, X, ExternalLink } from 'lucide-react'
import { useBridgeStore } from '../store/store'
import StatusTimeline from '../components/StatusTimeline'
import OwnerCard from '../components/OwnerCard'
import DemoHint from '../components/DemoHint'
import type { Application } from '../store/types'

// Overdue = past the 2-week signal with no decision yet.
const isOverdue = (a: Application) =>
  a.daysInProcess > 14 &&
  !['decision_go', 'decision_redirect', 'matched_pain_owner', 'path_to_production'].includes(a.stage)

const STAGE_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  named_contact: 'Named Contact',
  owner_assigned: 'Owner Assigned',
  in_review: 'In Review',
  signal_sent: '2-Week Signal',
  decision_go: 'Decision: Go',
  decision_redirect: 'Decision: Redirect',
  matched_pain_owner: 'Matched to Pain Owner',
  path_to_production: 'Idea → Car',
}

const stageColor: Record<string, string> = {
  submitted: 'var(--text-faint)',
  named_contact: 'var(--blue)',
  owner_assigned: 'var(--lime)',
  in_review: 'var(--amber)',
  signal_sent: 'var(--amber)',
  decision_go: 'var(--lime)',
  decision_redirect: 'var(--red)',
  matched_pain_owner: 'var(--lime)',
  path_to_production: 'var(--lime)',
}

export default function OwnerConsole() {
  const { applications, owners, advanceStage, assignOwner, decide, metrics } = useBridgeStore()
  const owner = owners.find(o => o.id === 'o3') || owners[0]
  // Unassigned applications (ownerId null) land in the inbox so they can be claimed.
  const unassigned = applications.filter(a => a.ownerId === null)
  const myApps = applications.filter(a => a.ownerId === owner.id || a.ownerId === 'o2')
  const queue = [...unassigned, ...myApps]
  const [selected, setSelected] = useState<Application | null>(queue[0] || null)
  const [advancing, setAdvancing] = useState(false)
  const [claiming, setClaiming] = useState(false)

  function handleAdvance(appId: string) {
    setAdvancing(true)
    setTimeout(() => {
      advanceStage(appId)
      const updated = useBridgeStore.getState().applications.find(a => a.id === appId)
      if (updated) setSelected(updated)
      setAdvancing(false)
    }, 600)
  }

  function handleClaim(appId: string) {
    setClaiming(true)
    setTimeout(() => {
      assignOwner(appId, owner.id)
      const updated = useBridgeStore.getState().applications.find(a => a.id === appId)
      if (updated) setSelected(updated)
      setClaiming(false)
    }, 600)
  }

  function handleDecide(appId: string, outcome: 'go' | 'redirect') {
    setAdvancing(true)
    setTimeout(() => {
      decide(appId, outcome)
      const updated = useBridgeStore.getState().applications.find(a => a.id === appId)
      if (updated) setSelected(updated)
      setAdvancing(false)
    }, 600)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '80px 40px 60px', maxWidth: '1200px', margin: '0 auto' }}
    >
      <DemoHint persona="You are an Audi owner" hint="Claim a new (amber) startup, advance its stage, then make the Go or Redirect call at the 2-week signal. Try the overdue one." />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
        <span className="kicker">owner console</span>
        <h1 style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 'clamp(24px, 3.5vw, 42px)', color: 'var(--text)', lineHeight: 1.1 }}>
          Owner Queue
        </h1>
      </motion.div>

      {/* KPI strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1px',
          background: 'var(--border)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          marginBottom: '32px',
        }}
      >
        {[
          { kicker: 'implementations', value: metrics.implementations, color: 'var(--lime)', caption: 'idea to car · KPI' },
          { kicker: 'connections (old metric)', value: metrics.connectionsThisQuarter, color: 'var(--red)', caption: 'not the goal anymore' },
          { kicker: 'startups owned', value: myApps.length, color: 'var(--text)', caption: 'in queue' },
          { kicker: 'avg days to signal', value: `${owner.avgDaysToSignal}d`, color: owner.avgDaysToSignal <= 14 ? 'var(--lime)' : 'var(--amber)', caption: 'target: 14 days' },
        ].map(item => (
          <div key={item.kicker} style={{ background: 'var(--surface)', padding: '20px' }}>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)', display: 'block', marginBottom: '4px' }}>
              {item.kicker}
            </span>
            <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: '32px', color: item.color, lineHeight: 1 }}>
              {item.value}
            </div>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', marginTop: '4px', letterSpacing: '0.08em' }}>
              {item.caption}
            </div>
          </div>
        ))}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px' }}>
        {/* Queue list */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <span className="kicker" style={{ marginBottom: '12px', display: 'block' }}>
            startup queue{unassigned.length > 0 && ` · ${unassigned.length} new`}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {queue.map(app => {
              const isSelected = selected?.id === app.id
              const isUnassigned = app.ownerId === null
              const color = isUnassigned ? 'var(--amber)' : stageColor[app.stage] || 'var(--text-faint)'
              return (
                <button
                  key={app.id}
                  onClick={() => setSelected(app)}
                  style={{
                    background: isSelected ? 'var(--surface-2)' : 'var(--surface)',
                    border: `1px solid ${isSelected ? 'var(--lime)' : isUnassigned ? 'var(--amber)' : 'var(--border)'}`,
                    borderLeft: isUnassigned ? '3px solid var(--amber)' : undefined,
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: '13px', color: 'var(--text)', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {app.companyName}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase',
                        color, background: `${color}18`, padding: '2px 6px', borderRadius: '3px',
                      }}>
                        {isUnassigned ? 'New · Unclaimed' : STAGE_LABELS[app.stage]}
                      </span>
                      <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)' }}>
                        day {app.daysInProcess}
                      </span>
                      {isOverdue(app) && (
                        <span style={{
                          fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase',
                          color: 'var(--red)', background: 'var(--red-dim)', padding: '2px 6px', borderRadius: '3px',
                        }}>
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={14} color={isSelected ? 'var(--lime)' : 'var(--text-faint)'} />
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
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {/* App header */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span className="kicker">{selected.id}</span>
                    <h2 style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: '24px', color: 'var(--text)', lineHeight: 1.1 }}>
                      {selected.companyName}
                    </h2>
                    <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {selected.technology}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: isOverdue(selected) ? 'var(--red)' : 'var(--text-faint)', letterSpacing: '0.08em' }}>
                      day {selected.daysInProcess} · deadline {selected.signalDeadline}
                    </span>
                    {isOverdue(selected) && (
                      <span style={{
                        fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: 'var(--red)', background: 'var(--red-dim)', padding: '3px 8px', borderRadius: '3px',
                      }}>
                        Overdue
                      </span>
                    )}
                    {selected.ownerId !== null && (
                      <Link
                        to={`/founder/${selected.id}`}
                        className="btn-secondary"
                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <ExternalLink size={13} />
                        View as founder
                      </Link>
                    )}
                    {selected.ownerId === null ? (
                      <button
                        className="btn-primary"
                        onClick={() => handleClaim(selected.id)}
                        disabled={claiming}
                        style={{ opacity: claiming ? 0.7 : 1 }}
                      >
                        <Zap size={14} />
                        {claiming ? 'Claiming…' : 'Claim Startup'}
                      </button>
                    ) : selected.stage === 'signal_sent' ? (
                      <>
                        <button
                          className="btn-primary"
                          onClick={() => handleDecide(selected.id, 'go')}
                          disabled={advancing}
                          style={{ opacity: advancing ? 0.7 : 1 }}
                        >
                          <Check size={14} />
                          Go
                        </button>
                        <button
                          onClick={() => handleDecide(selected.id, 'redirect')}
                          disabled={advancing}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            fontFamily: 'IBM Plex Sans', fontSize: '13px', fontWeight: 600,
                            padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                            color: 'var(--red)', background: 'transparent', border: '1px solid var(--red)',
                            opacity: advancing ? 0.7 : 1,
                          }}
                        >
                          <X size={14} />
                          Redirect
                        </button>
                      </>
                    ) : !['decision_redirect', 'path_to_production'].includes(selected.stage) ? (
                      <button
                        className="btn-primary"
                        onClick={() => handleAdvance(selected.id)}
                        disabled={advancing}
                        style={{ opacity: advancing ? 0.7 : 1 }}
                      >
                        <Zap size={14} />
                        {advancing ? 'Advancing…' : 'Advance Stage'}
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Rail */}
                <StatusTimeline current={selected.stage} />
              </div>

              {/* Owner + details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Owner card */}
                {selected.ownerId && (() => {
                  const owner = owners.find(o => o.id === selected.ownerId)
                  return owner ? <OwnerCard owner={owner} /> : null
                })()}

                {/* App info */}
                <div className="card" style={{ padding: '16px' }}>
                  <span className="kicker" style={{ marginBottom: '12px', display: 'block' }}>startup details</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { label: 'Founder', value: selected.founderName },
                      { label: 'Funding', value: selected.funding },
                      { label: 'Team', value: `${selected.teamSize} people` },
                      { label: 'Submitted', value: selected.submittedAt },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
                        <span style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text)' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="card" style={{ padding: '16px' }}>
                <span className="kicker" style={{ marginBottom: '8px', display: 'block' }}>notes</span>
                <p style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {selected.notes}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
