import { motion } from 'framer-motion'
import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { useBridgeStore } from '../store/store'
import StatusTimeline from '../components/StatusTimeline'
import OwnerCard from '../components/OwnerCard'

const STAGE_LABELS: Record<string, string> = {
  submitted: 'Application submitted',
  named_contact: 'Named contact assigned',
  owner_assigned: 'Owner assigned',
  in_review: 'Owner reviewing',
  signal_sent: '2-week signal sent',
  decision_go: 'Decision: Go',
  decision_redirect: 'Decision: Redirect',
  matched_pain_owner: 'Matched to pain owner',
  path_to_production: 'Idea → Car',
}

export default function FounderStatus() {
  const { applications, owners } = useBridgeStore()
  const app = applications.find(a => a.id === 'APP-2024-0047') || applications[0]
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
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '36px' }}>
        <span className="kicker">founder view</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 'clamp(24px, 4vw, 42px)', color: 'var(--text)', lineHeight: 1.1 }}>
            {app.companyName}
          </h1>
          <span style={{
            fontFamily: 'IBM Plex Mono', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--blue)', background: 'rgba(59,130,246,0.12)', padding: '4px 10px', borderRadius: '4px',
          }}>
            External
          </span>
        </div>
        <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
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
          border: `1px solid ${isGo ? 'var(--lime)' : isRedirect ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          padding: '28px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="kicker">current status</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isGo && <CheckCircle size={20} color="var(--lime)" />}
              {isRedirect && <XCircle size={20} color="var(--red)" />}
              {!isGo && !isRedirect && <Clock size={20} color="var(--amber)" />}
              <span style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '20px', color: isGo ? 'var(--lime)' : isRedirect ? 'var(--red)' : 'var(--text)' }}>
                {currentLabel}
              </span>
            </div>
          </div>

          {/* Countdown */}
          {!isGo && !isRedirect && (
            <div style={{
              background: 'rgba(200,240,0,0.06)',
              border: '1px solid rgba(200,240,0,0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 20px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
                2-week signal in
              </div>
              <div style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: '36px', color: daysLeft <= 3 ? 'var(--red)' : 'var(--lime)', lineHeight: 1 }}>
                {Math.max(0, daysLeft)}
              </div>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.08em' }}>days remaining</div>
            </div>
          )}

          {isGo && (
            <div style={{
              background: 'rgba(200,240,0,0.1)',
              border: '1px solid var(--lime)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 20px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: '20px', color: 'var(--lime)' }}>GO</div>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--lime)', letterSpacing: '0.08em' }}>signal sent</div>
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
              <div style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: '20px', color: 'var(--red)' }}>REDIRECT</div>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--red)', letterSpacing: '0.08em' }}>with referral</div>
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
            { label: '2 weeks to yes/no', done: ['decision_go','decision_redirect','path_to_production'].includes(app.stage), value: `Day ${app.daysInProcess} of 14` },
          ].map(({ label, done, value }) => (
            <div key={label} style={{ background: 'var(--surface)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: done ? 'var(--lime)' : 'var(--text-muted)', marginTop: '2px' }}>{value}</div>
              </div>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: done ? 'var(--lime)' : 'var(--border-strong)' }} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Jonas quote */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ marginBottom: '24px', padding: '20px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', borderLeft: '3px solid var(--blue)' }}
      >
        <div style={{ fontFamily: 'IBM Plex Sans', fontStyle: 'italic', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '8px' }}>
          "I don't have the runway to wait for someone to figure out their internal approvals. BMW gave us a supplier number in week six."
        </div>
        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.08em' }}>
          Jonas Weber · CEO, VisionQual · 14 months runway
        </div>
      </motion.div>

      {/* Owner card */}
      {owner && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <span className="kicker" style={{ marginBottom: '10px', display: 'block' }}>your owner</span>
          <OwnerCard owner={owner} />
        </motion.div>
      )}

      {/* App meta */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}
      >
        {[
          { label: 'Application ID', value: app.id },
          { label: 'Signal deadline', value: app.signalDeadline },
          { label: 'Days remaining', value: `${Math.max(0, 14 - app.daysInProcess)} of 14` },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'var(--surface)', padding: '14px 16px' }}>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text)' }}>{value}</div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}
