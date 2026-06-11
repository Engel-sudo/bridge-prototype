import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { useBridgeStore } from '../store/store'
import StatusTimeline from '../components/StatusTimeline'
import OwnerCard from '../components/OwnerCard'
import DemoHint from '../components/DemoHint'

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
  decision_redirect: 'Redirected with a referral. Your Internal Lead will send contact details.',
  matched_pain_owner: 'Matched to a pain point. Pilot scope being defined.',
  path_to_production: 'In production. Your technology is going into the car.',
}

export default function FounderStatus() {
  const { id } = useParams()
  const { applications, owners } = useBridgeStore()
  // With an :id, track that specific application. Without one, default to the
  // demo founder (Jonas / VisionQual) so /founder stays a valid landing.
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
  const currentLabel = STAGE_LABELS[app.stage] || app.stage
  const isGo = app.stage === 'decision_go' || app.stage === 'path_to_production'
  const isRedirect = app.stage === 'decision_redirect'
  const daysLeft = 14 - app.daysInProcess

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '80px 40px 60px', maxWidth: '860px', margin: '0 auto' }}
    >
      <DemoHint persona="You are the founder" hint="This page updates live when your Internal Lead advances the stage in the Internal Lead Console." />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '36px' }}>
        <span className="kicker">founder view</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 4vw, 42px)', color: 'var(--text)', lineHeight: 1.1 }}>
            {app.companyName}
          </h1>
          <span style={{
            fontFamily: 'AudiType', fontSize: '11px',
            color: 'var(--blue)', background: 'rgba(59,130,246,0.12)', padding: '4px 10px', borderRadius: '0',
          }}>
            External
          </span>
        </div>
        <div style={{ fontFamily: 'AudiType', fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
          {app.technology} · {app.founderName}
        </div>
      </motion.div>

      {/* Status card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'var(--surface)',
          border: `1px solid ${isGo ? 'var(--accent)' : isRedirect ? 'var(--red)' : 'var(--border)'}`,
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

          {/* Countdown / overdue */}
          {!isGo && !isRedirect && (
            daysLeft < 0 ? (
              <div style={{
                background: 'var(--red-dim)',
                border: '1px solid var(--red)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 20px',
                textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--red)', marginBottom: '4px' }}>
                  Decision overdue
                </div>
                <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '36px', color: 'var(--red)', lineHeight: 1 }}>
                  {Math.abs(daysLeft)}
                </div>
                <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--red)' }}>days past deadline</div>
              </div>
            ) : (
              <div style={{
                background: 'var(--accent-dim)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 20px',
                textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginBottom: '4px' }}>
                  2-week decision in
                </div>
                <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '36px', color: daysLeft <= 3 ? 'var(--red)' : 'var(--accent)', lineHeight: 1 }}>
                  {daysLeft}
                </div>
                <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>days remaining</div>
              </div>
            )
          )}

          {isGo && (
            <div style={{
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 20px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '20px', color: 'var(--accent)' }}>GO</div>
              <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--accent)' }}>decision sent</div>
            </div>
          )}

          {isRedirect && (
            <div style={{
              background: 'var(--red-dim)',
              border: '1px solid var(--red)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 20px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '20px', color: 'var(--red)' }}>REDIRECT</div>
              <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--red)' }}>with referral</div>
            </div>
          )}
        </div>

        {/* Rail */}
        <StatusTimeline current={app.stage} />

        {/* Promise bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1px',
          background: 'var(--border)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          marginTop: '24px',
        }}>
          {[
            { label: '48h to a name', done: ['named_contact','owner_assigned','in_review','signal_sent','decision_go','decision_redirect'].includes(app.stage), value: 'Named contact' },
            { label: '2 weeks to a decision', done: ['decision_go','decision_redirect','path_to_production'].includes(app.stage), value: `Day ${app.daysInProcess} of 14` },
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
            <div style={{
              width: '44px', height: '44px', borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '13px', color: 'var(--accent)' }}>TBA</span>
            </div>
            <div>
              <div style={{ fontFamily: 'AudiType', fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
                Your Internal Lead is being assigned.
              </div>
              <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginTop: '2px' }}>
                A named Audi contact within 48 hours.
              </div>
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
    </motion.div>
  )
}
