import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'
import { useBridgeStore } from '../store/store'
import DemoHint from '../components/DemoHint'
import { TRL_LABELS } from '../store/types'

const DEPARTMENTS = ['Quality', 'Production', 'Logistics', 'R&D', 'Procurement', 'Innovation & Ventures']

const ACCEPTED_STAGES = new Set(['decision_go', 'matched_pain_owner', 'path_to_production'])

const STATUS_COLOR: Record<string, string> = {
  open: 'var(--text-faint)',
  matched: 'var(--accent)',
  in_pilot: 'var(--blue)',
}
const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  matched: 'Matched to startup',
  in_pilot: 'In pilot',
}

function trlLabel(trl?: number): string {
  if (!trl) return ''
  const entry = [...TRL_LABELS].reverse().find(t => trl >= t.value)
  return entry ? entry.label : ''
}

export default function FloorView() {
  const { addPainPoint, painPoints, applications } = useBridgeStore()
  const [form, setForm] = useState({ title: '', description: '', department: 'Quality', submittedBy: '' })
  const [submitted, setSubmitted] = useState(false)
  const [lastSubmitter, setLastSubmitter] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.submittedBy.trim()) return
    const id = `pp${Date.now()}`
    addPainPoint({
      id,
      title: form.title,
      description: form.description,
      submittedBy: form.submittedBy,
      department: form.department,
      status: 'open',
      linkedApplicationId: null,
      submittedAt: new Date().toISOString().slice(0, 10),
    })
    setLastSubmitter(form.submittedBy)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setForm({ title: '', description: '', department: 'Quality', submittedBy: form.submittedBy })
    }, 2000)
  }

  const acceptedStartups = applications.filter(a => ACCEPTED_STAGES.has(a.stage))

  // Show pain points submitted by the current user (matched by name after first submit)
  const myPainPoints = lastSubmitter
    ? painPoints.filter(pp => pp.submittedBy.toLowerCase() === lastSubmitter.toLowerCase())
    : []
  const hasMatch = myPainPoints.some(pp => pp.status === 'matched' || pp.status === 'in_pilot')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ padding: 'clamp(72px, 12vw, 80px) clamp(16px, 5vw, 40px) 60px', maxWidth: '640px', margin: '0 auto' }}
    >
      <DemoHint persona="You are a floor worker" hint="Report a pain point in seconds — no manager approval needed. See which startups are already solving problems like yours." />

      {/* Pain point submission */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '40px' }}>
        <span className="kicker">the floor</span>
        <h1 style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 6vw, 36px)', color: 'var(--text)', lineHeight: 1.1 }}>
          Report a Pain Point
        </h1>
        <p style={{ fontFamily: 'AudiType', fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Spot a problem on the line? Tell us about it below.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{ marginBottom: '48px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', padding: '20px' }}>
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: '24px 0' }}
              >
                <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '22px', color: 'var(--accent)' }}>Submitted.</div>
                <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginTop: '6px' }}>Thanks — your pain point has been logged.</div>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>Your name *</label>
                  <input className="input" placeholder="e.g. Anna Richter" value={form.submittedBy} onChange={e => setForm(f => ({ ...f, submittedBy: e.target.value }))} required style={{ fontSize: '16px', padding: '12px 14px' }} />
                </div>
                <div>
                  <label style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>Department *</label>
                  <select className="input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} style={{ fontSize: '16px', padding: '12px 14px' }}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>What's the problem? *</label>
                  <input className="input" placeholder="Describe it in one sentence" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required style={{ fontSize: '16px', padding: '12px 14px' }} />
                </div>
                <div>
                  <label style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>Give us more detail</label>
                  <textarea className="input" placeholder="What's the impact? Anything you've already tried?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: '90px', fontSize: '16px', padding: '12px 14px' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', minHeight: '48px' }}>Submit</button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* My submissions history — shown after first submit */}
      <AnimatePresence>
        {myPainPoints.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ marginBottom: '48px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <span className="kicker">your submissions</span>
              {hasMatch && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    fontFamily: 'AudiType', fontSize: '11px', color: 'var(--accent)',
                    background: 'var(--accent-dim)', padding: '3px 10px',
                    border: '1px solid var(--border-strong)',
                  }}
                >
                  <Zap size={11} /> Matched to a startup!
                </motion.span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {myPainPoints.map(pp => (
                <div key={pp.id} style={{
                  background: 'var(--surface)',
                  border: `1px solid ${pp.status !== 'open' ? 'var(--border-strong)' : 'var(--border)'}`,
                  padding: '14px 18px',
                  borderLeft: pp.status !== 'open' ? `3px solid ${STATUS_COLOR[pp.status]}` : undefined,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ fontFamily: 'AudiType', fontWeight: 600, fontSize: '14px', color: 'var(--text)', lineHeight: 1.3 }}>
                      {pp.title}
                    </div>
                    <span style={{
                      fontFamily: 'AudiType', fontSize: '11px',
                      color: STATUS_COLOR[pp.status],
                      background: pp.status !== 'open' ? `${STATUS_COLOR[pp.status]}18` : 'transparent',
                      padding: '2px 8px', whiteSpace: 'nowrap',
                    }}>
                      {STATUS_LABEL[pp.status]}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>
                    {pp.department} · {pp.submittedAt}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Startup feed */}
      {acceptedStartups.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ marginBottom: '10px' }}>
            <span className="kicker">startups working with audi</span>
          </div>
          <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-faint)', marginBottom: '14px', lineHeight: 1.5 }}>
            These companies are tackling problems just like the ones you report.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {acceptedStartups.map((a, i) => {
              const trl = trlLabel(a.trl)
              const hasMvp = a.hasMvp ?? a.productStage === 'MVP'
              const stageLabel = a.stage === 'path_to_production' ? 'In Production'
                : a.stage === 'matched_pain_owner' ? 'In Pilot'
                : 'Accepted'
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.05 }}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px 20px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>
                      {a.companyName}
                    </div>
                    <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 8px' }}>
                      {stageLabel}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 8px', lineHeight: 1.5 }}>
                    {a.technology.length > 100 ? `${a.technology.slice(0, 100)}…` : a.technology}
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {trl && (
                      <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--blue)', background: 'rgba(59,130,246,0.1)', padding: '2px 8px' }}>
                        {trl}
                      </span>
                    )}
                    {hasMvp && (
                      <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', padding: '2px 8px', border: '1px solid var(--border)' }}>
                        MVP ✓
                      </span>
                    )}
                    {a.targetDepartment && (
                      <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', padding: '2px 8px', border: '1px solid var(--border)' }}>
                        {a.targetDepartment}
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
