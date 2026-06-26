import { Fragment, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, Lightbulb, Users, Calendar, Truck } from 'lucide-react'
import { useBridgeStore } from '../store/store'
import OwnerCard from '../components/OwnerCard'
import DemoHint from '../components/DemoHint'
import type { Stage } from '../store/types'

const STAGE_LABELS: Record<string, string> = {
  submitted: 'Application submitted',
  named_contact: 'Named contact assigned',
  owner_assigned: 'Internal Lead assigned',
  in_review: 'Internal Lead reviewing',
  signal_sent: '2-week decision sent',
  decision_go: 'Decision: Go',
  decision_redirect: 'Decision: Redirect',
  matched_pain_owner: 'Matched to pain point',
  path_to_production: 'Idea → Car',
}

const NEXT_STEP: Record<string, string> = {
  submitted: 'A named Audi contact will be assigned within 48 hours.',
  named_contact: 'Your Internal Lead is being assigned. Expect first contact shortly.',
  owner_assigned: 'Your Internal Lead is reviewing your application.',
  in_review: 'Your Internal Lead is preparing the 2-week decision. Expect a yes or no soon.',
  signal_sent: 'Decision imminent. Your Internal Lead will send a Go or Redirect decision.',
  decision_go: 'Pilot confirmed. Your Internal Lead will reach out to set up next steps.',
  decision_redirect: "You've been added to the BRIDGE Community. Explore open pain points below and join upcoming events.",
  matched_pain_owner: 'Matched to a pain point. Pilot scope being defined.',
  path_to_production: 'In production. Your technology is going into the car.',
}


// ── Forked Timeline ──────────────────────────────────────────────────────────

const PRE_FORK: Array<{ key: Stage; label: string }> = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'named_contact', label: 'Named' },
  { key: 'owner_assigned', label: 'Lead' },
  { key: 'in_review', label: 'Review' },
  { key: 'signal_sent', label: '2-Wk Signal' },
]

function ForkedTimeline({ current }: { current: Stage }) {
  const isGo = (['decision_go', 'matched_pain_owner', 'path_to_production'] as Stage[]).includes(current)
  const isRedirect = current === 'decision_redirect'
  const pastFork = isGo || isRedirect
  const pfIdx = PRE_FORK.findIndex(s => s.key === current)

  const pfStatus = (key: Stage): 'done' | 'active' | 'pending' => {
    if (pastFork) return 'done'
    const i = PRE_FORK.findIndex(s => s.key === key)
    if (pfIdx < 0 || i > pfIdx) return 'pending'
    return i < pfIdx ? 'done' : 'active'
  }

  const goNodeStatus = (key: 'decision_go' | 'path_to_production'): 'done' | 'active' | 'pending' => {
    if (!isGo) return 'pending'
    if (key === 'decision_go') return (current === 'matched_pain_owner' || current === 'path_to_production') ? 'done' : 'active'
    return current === 'path_to_production' ? 'active' : 'pending'
  }

  const connBg = (on: boolean, red = false) =>
    on ? (red ? 'var(--red)' : 'var(--accent)') : 'var(--border)'

  const NodeEl = ({ status, color }: { status: 'done' | 'active' | 'pending'; color?: 'red' | 'blue' }) => {
    const c = color === 'red' ? 'var(--red)' : color === 'blue' ? 'var(--blue)' : 'var(--accent)'
    const sz = status === 'active' ? 16 : 12
    return (
      <div style={{
        width: sz, height: sz, flexShrink: 0, borderRadius: 0,
        background: status !== 'pending' ? c : 'var(--bg)',
        border: `2px solid ${status !== 'pending' ? c : 'var(--border-strong)'}`,
        transition: 'all 0.3s',
      }} />
    )
  }

  const Label = ({ text, highlight, color = 'var(--text)' }: { text: string; highlight: boolean; color?: string }) => (
    <div style={{ fontFamily: 'AudiType', fontSize: '9px', textAlign: 'center', width: '54px', lineHeight: 1.3, color: highlight ? color : 'var(--text-faint)', fontWeight: highlight ? 700 : 400 }}>
      {text}
    </div>
  )

  const Conn = ({ on, red = false }: { on: boolean; red?: boolean }) => (
    <div style={{ flexShrink: 0, width: '20px', height: '2px', background: connBg(on, red) }} />
  )

  const borderCol = pastFork ? 'var(--border-strong)' : 'var(--border)'

  return (
    <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: '560px' }}>

        {/* Pre-fork linear rail */}
        <div style={{ display: 'flex', alignItems: 'center', paddingTop: '20px' }}>
          {PRE_FORK.map((s, i) => {
            const status = pfStatus(s.key)
            const isLast = i === PRE_FORK.length - 1
            return (
              <Fragment key={s.key}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <NodeEl status={status} />
                  <Label text={s.label} highlight={status === 'active'} />
                </div>
                {!isLast && (
                  <Conn on={pastFork || pfStatus(PRE_FORK[i + 1].key) !== 'pending'} />
                )}
              </Fragment>
            )
          })}
          <Conn on={pastFork} />
        </div>

        {/* Fork column — borderLeft draws the vertical junction bar */}
        <div style={{ display: 'flex', flexDirection: 'column', borderLeft: `2px solid ${borderCol}` }}>

          {/* GO branch */}
          <div style={{ display: 'flex', alignItems: 'center', paddingTop: '20px', paddingBottom: '12px' }}>
            <Conn on={isGo} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <NodeEl status={goNodeStatus('decision_go')} />
              <Label text="GO" highlight={isGo && current === 'decision_go'} color="var(--accent)" />
            </div>
            <Conn on={current === 'matched_pain_owner' || current === 'path_to_production'} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <NodeEl status={goNodeStatus('path_to_production')} />
              <Label text="Idea → Car" highlight={current === 'path_to_production'} color="var(--accent)" />
            </div>
          </div>

          {/* REDIRECT branch */}
          <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '20px', paddingTop: '12px' }}>
            <Conn on={isRedirect} red />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <NodeEl status={isRedirect ? 'active' : 'pending'} color={isRedirect ? 'red' : undefined} />
              <Label text="Redirect" highlight={isRedirect} color="var(--red)" />
            </div>
            <Conn on={isRedirect} red />
            {/* Community terminal — circle node to distinguish */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <div style={{
                width: isRedirect ? 14 : 12, height: isRedirect ? 14 : 12, flexShrink: 0,
                borderRadius: '50%',
                background: isRedirect ? 'var(--blue)' : 'var(--bg)',
                border: `2px solid ${isRedirect ? 'var(--blue)' : 'var(--border-strong)'}`,
                transition: 'all 0.3s',
              }} />
              <Label text="Community" highlight={isRedirect} color="var(--blue)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function FounderStatus() {
  const { id } = useParams()
  const { applications, owners, painPoints } = useBridgeStore()

  const app = id
    ? applications.find(a => a.id === id)
    : applications.find(a => a.id === 'APP-2024-0047') || applications[0]

  if (!app) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ padding: '120px 40px 60px', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}
      >
        <span className="kicker">founder view</span>
        <h1 style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 4vw, 42px)', color: 'var(--text)', lineHeight: 1.1, marginBottom: '12px' }}>
          Application not found
        </h1>
        <p style={{ fontFamily: 'AudiType', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          No application matches <span style={{ fontFamily: 'AudiType', color: 'var(--text)' }}>{id}</span>. Check the link from your confirmation.
        </p>
        <Link to="/apply" className="btn-primary" style={{ textDecoration: 'none' }}>Apply to BRIDGE</Link>
      </motion.div>
    )
  }

  const owner = owners.find(o => o.id === app.ownerId)
  const isGo = app.stage === 'decision_go' || app.stage === 'matched_pain_owner' || app.stage === 'path_to_production'
  const isRedirect = app.stage === 'decision_redirect'
  const daysLeft = 14 - app.daysInProcess
  const currentLabel = STAGE_LABELS[app.stage] || app.stage
  const openPainPoints = painPoints.filter(pp => pp.status === 'open' && pp.sharedWithCommunity !== false)

  const [tab, setTab] = useState<'status' | 'community'>('status')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '80px 40px 60px', maxWidth: '860px', margin: '0 auto' }}
    >
      <DemoHint
        persona="You are the founder"
        hint={
          isRedirect
            ? "You've been redirected — but you're in the BRIDGE Community now. Access open pain points and upcoming events below."
            : isGo
            ? "Your GO decision is confirmed. The Community tab is now open — explore open pain points and upcoming events."
            : "This page updates live when your Internal Lead advances the stage in the Internal Lead Console."
        }
      />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
        <span className="kicker">founder view</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 4vw, 42px)', color: 'var(--text)', lineHeight: 1.1 }}>
            {app.companyName}
          </h1>
          <span style={{
            fontFamily: 'AudiType', fontSize: '11px',
            color: isRedirect ? 'var(--blue)' : isGo ? 'var(--accent)' : 'var(--blue)',
            background: isRedirect ? 'rgba(59,130,246,0.12)' : isGo ? 'var(--accent-dim)' : 'rgba(59,130,246,0.12)',
            padding: '4px 10px', borderRadius: '0',
          }}>
            {isRedirect ? 'Community' : 'External'}
          </span>
        </div>
        <div style={{ fontFamily: 'AudiType', fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
          {app.technology} · {app.founderName}
        </div>
      </motion.div>

      {/* Tabs — Community only unlocks on GO */}
      {isGo && (
        <div role="tablist" style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)', marginBottom: '28px' }}>
          {(['status', 'community'] as const).map(t => {
            const active = tab === t
            return (
              <button
                key={t}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t)}
                style={{
                  fontFamily: 'AudiType', fontSize: '13px', fontWeight: active ? 700 : 500,
                  color: active ? 'var(--text)' : 'var(--text-muted)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '10px 16px',
                  borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                  marginBottom: '-1px', transition: 'color 0.15s',
                }}
              >
                {t === 'status' ? 'Status' : 'Community'}
              </button>
            )
          })}
        </div>
      )}

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {tab === 'status' && (
          <StatusTab
            app={app}
            owner={owner}
            isGo={isGo}
            isRedirect={isRedirect}
            daysLeft={daysLeft}
            currentLabel={currentLabel}
            openPainPoints={openPainPoints}
          />
        )}
        {tab === 'community' && <CommunityTab openPainPoints={openPainPoints} />}
      </motion.div>
    </motion.div>
  )
}

// ── Status Tab ───────────────────────────────────────────────────────────────

function StatusTab({
  app, owner, isGo, isRedirect, daysLeft, currentLabel, openPainPoints,
}: {
  app: import('../store/types').Application
  owner: import('../store/types').Owner | undefined
  isGo: boolean
  isRedirect: boolean
  daysLeft: number
  currentLabel: string
  openPainPoints: import('../store/types').PainPoint[]
}) {
  return (
    <>
      {/* Status card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'var(--surface)',
          border: `1px solid ${isGo ? 'var(--accent)' : isRedirect ? 'var(--border)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          padding: '28px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="kicker">current status</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isGo && <CheckCircle size={20} color="var(--accent)" />}
              {isRedirect && <XCircle size={20} color="var(--red)" />}
              {!isGo && !isRedirect && <Clock size={20} color="var(--amber)" />}
              <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '20px', color: isGo ? 'var(--accent)' : isRedirect ? 'var(--red)' : 'var(--text)' }}>
                {currentLabel}
              </span>
            </div>
          </div>

          {/* Countdown / badge */}
          {!isGo && !isRedirect && (
            daysLeft < 0 ? (
              <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)', padding: '14px 20px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--red)', marginBottom: '4px' }}>Decision overdue</div>
                <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '36px', color: 'var(--red)', lineHeight: 1 }}>{Math.abs(daysLeft)}</div>
                <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--red)' }}>days past deadline</div>
              </div>
            ) : (
              <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', padding: '14px 20px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginBottom: '4px' }}>2-week decision in</div>
                <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '36px', color: daysLeft <= 3 ? 'var(--red)' : 'var(--accent)', lineHeight: 1 }}>{daysLeft}</div>
                <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>days remaining</div>
              </div>
            )
          )}

          {isGo && (
            <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', padding: '14px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '20px', color: 'var(--accent)' }}>GO</div>
              <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--accent)' }}>decision sent</div>
            </div>
          )}

          {isRedirect && (
            <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid var(--blue)', borderRadius: 'var(--radius-sm)', padding: '14px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '13px', color: 'var(--blue)' }}>BRIDGE</div>
              <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '13px', color: 'var(--blue)' }}>COMMUNITY</div>
              <div style={{ fontFamily: 'AudiType', fontSize: '10px', color: 'var(--blue)', marginTop: '2px' }}>access granted</div>
            </div>
          )}
        </div>

        {/* Forked timeline — replaces the old linear StatusTimeline */}
        <ForkedTimeline current={app.stage} />

        {/* Promise bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginTop: '24px' }}>
          {[
            { label: '48h to a name', done: ['named_contact','owner_assigned','in_review','signal_sent','decision_go','decision_redirect','matched_pain_owner','path_to_production'].includes(app.stage), value: 'Named contact' },
            { label: '2 weeks to a decision', done: ['decision_go','decision_redirect','matched_pain_owner','path_to_production'].includes(app.stage), value: `Day ${app.daysInProcess} of 14` },
          ].map(({ label, done, value }) => (
            <div key={label} style={{ background: 'var(--surface)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>{label}</div>
                <div style={{ fontFamily: 'AudiType', fontSize: '13px', color: done ? 'var(--accent)' : 'var(--text-muted)', marginTop: '2px' }}>{value}</div>
              </div>
              <div style={{ width: '8px', height: '8px', borderRadius: '0', background: done ? 'var(--accent)' : 'var(--border-strong)' }} />
            </div>
          ))}
        </div>

        {/* Next step */}
        <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', flexShrink: 0, marginTop: '1px' }}>Next</span>
          <span style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {NEXT_STEP[app.stage]}
          </span>
        </div>
      </motion.div>

      {/* Owner card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <span className="kicker" style={{ marginBottom: '10px', display: 'block' }}>your internal lead</span>
        {owner ? (
          <OwnerCard owner={owner} />
        ) : (
          <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '13px', color: 'var(--accent)' }}>TBA</span>
            </div>
            <div>
              <div style={{ fontFamily: 'AudiType', fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>Your Internal Lead is being assigned.</div>
              <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginTop: '2px' }}>A named Audi contact within 48 hours.</div>
            </div>
          </div>
        )}
      </motion.div>

      {/* App meta */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}
      >
        {[
          { label: 'Application ID', value: app.id },
          { label: 'Decision deadline', value: app.signalDeadline },
          { label: 'Days remaining', value: `${Math.max(0, 14 - app.daysInProcess)} of 14` },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'var(--surface)', padding: '14px 16px' }}>
            <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text)' }}>{value}</div>
          </div>
        ))}
      </motion.div>

      {/* Community access section — only shown for redirected founders */}
      {isRedirect && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginTop: '32px' }}>
          <div style={{ padding: '20px 24px', background: 'rgba(59,130,246,0.06)', border: '1px solid var(--border)', borderLeft: '3px solid var(--blue)', borderRadius: 'var(--radius)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Users size={15} color="var(--blue)" />
              <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>You're in the BRIDGE Community</span>
            </div>
            <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Your technology didn't fit the current roadmap — but you're exactly the kind of team BRIDGE wants to stay close to. You now have access to Audi's open pain points, upcoming events, and the BRIDGE truck tour. If you see a problem you can solve, you're welcome to apply again.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Lightbulb size={14} color="var(--text-faint)" />
            <span className="kicker">open pain points</span>
          </div>
          <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-faint)', marginBottom: '14px', lineHeight: 1.5 }}>
            These are real problems Audi hasn't solved yet. If you have technology that could address one, you're welcome to apply through BRIDGE.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {openPainPoints.map((pp, i) => (
              <motion.div
                key={pp.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.04 }}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px 20px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: 'AudiType', fontWeight: 600, fontSize: '14px', color: 'var(--text)', lineHeight: 1.3 }}>{pp.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <Users size={11} color="var(--text-faint)" />
                    <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>{pp.department}</span>
                  </div>
                </div>
                <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{pp.description}</p>
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop: '20px', padding: '18px 22px', background: 'var(--accent-dim)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '15px', color: 'var(--text)', marginBottom: '2px' }}>See a problem you can solve?</div>
              <div style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)' }}>Community members can apply directly — you already know the process.</div>
            </div>
            <Link to="/apply" style={{ fontFamily: 'AudiType', fontWeight: 600, fontSize: '13px', color: 'var(--accent-contrast)', background: 'var(--accent)', border: 'none', padding: '10px 20px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap', display: 'inline-block' }}>
              Apply to BRIDGE
            </Link>
          </div>
        </motion.div>
      )}
    </>
  )
}

// ── Community Tab (GO founders) ──────────────────────────────────────────────

function CommunityTab({ openPainPoints }: { openPainPoints: import('../store/types').PainPoint[] }) {
  return (
    <div>
      <div style={{ marginBottom: '28px', padding: '20px 24px', background: 'var(--accent-dim)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', borderLeft: '3px solid var(--accent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Users size={15} color="var(--accent)" />
          <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>You're in the BRIDGE Community</span>
        </div>
        <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 14px' }}>
          Your GO decision opens up the full community. Explore Audi's open pain points below — your Internal Lead may match you to one as you move toward a pilot.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/community?tab=events" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'AudiType', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', padding: '7px 14px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}>
            <Calendar size={13} /> Events
          </Link>
          <Link to="/community?tab=tour" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'AudiType', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', padding: '7px 14px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}>
            <Truck size={13} /> BRIDGE Truck Tour
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <Lightbulb size={14} color="var(--text-faint)" />
        <span className="kicker">open pain points</span>
      </div>
      <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-faint)', marginBottom: '14px', lineHeight: 1.5 }}>
        Real problems Audi hasn't solved yet. Your Internal Lead can match you to one as you move toward a pilot.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {openPainPoints.map((pp, i) => (
          <motion.div
            key={pp.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 + i * 0.04 }}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px 20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <div style={{ fontFamily: 'AudiType', fontWeight: 600, fontSize: '14px', color: 'var(--text)', lineHeight: 1.3 }}>{pp.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <Users size={11} color="var(--text-faint)" />
                <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>{pp.department}</span>
              </div>
            </div>
            <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{pp.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

