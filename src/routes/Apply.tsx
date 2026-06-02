import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, CheckCircle, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBridgeStore } from '../store/store'
import DemoHint from '../components/DemoHint'
import type { Application } from '../store/types'

const STEPS = [
  { title: 'Your startup', subtitle: 'Tell us who you are' },
  { title: 'The technology', subtitle: 'What problem are you solving?' },
  { title: 'The ask', subtitle: 'What do you need from Audi?' },
]

const REGIONS = ['Bavaria', 'Baden-Württemberg', 'Hesse', 'Other Germany', 'Outside Germany'] as const
type Region = typeof REGIONS[number]
const NEARBY: Region[] = ['Bavaria', 'Baden-Württemberg']

interface FormData {
  founderName: string
  companyName: string
  region: Region | ''
  teamSize: string
  funding: string
  technology: string
  targetDepartment: string
  stage: string
  ask: string
}

const EMPTY: FormData = {
  founderName: '',
  companyName: '',
  region: '',
  teamSize: '',
  funding: '',
  technology: '',
  targetDepartment: '',
  stage: '',
  ask: '',
}

function generateId() {
  const num = Math.floor(Math.random() * 900) + 100
  return `APP-2026-0${num}`
}

function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function Apply() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(EMPTY)
  const [appId, setAppId] = useState('')
  const [done, setDone] = useState(false)
  const [visitConfirmed, setVisitConfirmed] = useState(false)
  const { addApplication } = useBridgeStore()
  const navigate = useNavigate()

  function canNext() {
    if (step === 0) return data.founderName.trim() && data.companyName.trim() && data.region
    if (step === 1) return data.technology.trim()
    return data.ask.trim()
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      submit()
    }
  }

  function submit() {
    const id = generateId()
    setAppId(id)
    const app: Application = {
      id,
      founderId: `f${Date.now()}`,
      founderName: data.founderName,
      founderInitials: data.founderName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      companyName: data.companyName,
      technology: data.technology,
      stage: 'submitted',
      submittedAt: new Date().toISOString().slice(0, 10),
      daysInProcess: 0,
      ownerId: null,
      signalDeadline: addDays(14),
      notes: data.ask,
      funding: data.stage || 'Undisclosed',
      teamSize: parseInt(data.teamSize) || 1,
    }
    addApplication(app)
    setDone(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '80px 40px 60px', maxWidth: '640px', margin: '0 auto' }}
    >
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
              >
                <CheckCircle size={56} color="var(--lime)" style={{ margin: '0 auto 16px' }} />
              </motion.div>
              <h1 style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: '36px', color: 'var(--text)', lineHeight: 1.1, marginBottom: '8px' }}>
                Your application is in.
              </h1>
              <p style={{ fontFamily: 'IBM Plex Sans', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                You'll hear from a named Audi contact within 48 hours.<br />
                We'll give you a yes or no within 2 weeks. A real decision, on a real deadline.
              </p>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--lime)', borderRadius: 'var(--radius)', padding: '28px', marginBottom: '24px' }}>
              <span className="kicker">application ID</span>
              <div style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: '32px', color: 'var(--lime)', marginBottom: '24px' }}>{appId}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginTop: '4px' }}>
                {[
                  { label: '48h', desc: 'Named contact assigned', color: 'var(--lime)' },
                  { label: `By ${addDays(14)}`, desc: 'Yes or no signal', color: 'var(--lime)' },
                ].map(({ label, desc, color }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.12 }}
                    style={{ background: 'var(--surface)', padding: '16px' }}
                  >
                    <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: '22px', color, lineHeight: 1, marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{desc}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {NEARBY.includes(data.region as Region) && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.35 }}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderLeft: '3px solid var(--lime)',
                  borderRadius: 'var(--radius)',
                  padding: '20px 24px',
                  marginBottom: '24px',
                }}
              >
                <span className="kicker" style={{ marginBottom: '6px', display: 'block' }}>You're close to us</span>
                <p style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
                  Since you're based nearby, your Owner can arrange a plant visit in Ingolstadt or Neckarsulm within your first two weeks. This is optional but recommended.
                </p>
                {visitConfirmed ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'IBM Plex Sans', fontSize: '13px', fontWeight: 600, color: 'var(--lime)' }}>
                    <Check size={16} color="var(--lime)" />
                    Visit requested
                  </div>
                ) : (
                  <button className="btn-secondary" onClick={() => setVisitConfirmed(true)}>
                    Yes, I'd like a visit
                  </button>
                )}
              </motion.div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => navigate(`/founder/${appId}`)}>
                Track application
              </button>
              <button className="btn-secondary" onClick={() => { setDone(false); setStep(0); setData(EMPTY); setVisitConfirmed(false) }}>
                Submit another
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DemoHint persona="You are a startup founder" hint="Fill the 3 steps and submit. You'll get a tracked application you can follow in the Founder view." />

            {/* Header */}
            <div style={{ marginBottom: '36px' }}>
              <span className="kicker">apply to bridge</span>
              <h1 style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 'clamp(24px, 4vw, 36px)', color: 'var(--text)', lineHeight: 1.1 }}>
                The Door
              </h1>
              <p style={{ fontFamily: 'IBM Plex Sans', fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
                48h to a name. 2 weeks to a yes or no.
              </p>
            </div>

            {/* Step indicators */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '0' }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? '1' : '0 0 auto' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '4px',
                    background: i < step ? 'var(--lime)' : i === step ? 'rgba(200,240,0,0.15)' : 'var(--surface-2)',
                    border: `2px solid ${i <= step ? 'var(--lime)' : 'var(--border-strong)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {i < step ? (
                      <CheckCircle size={14} color="#0A0B0D" />
                    ) : (
                      <span style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '12px', color: i === step ? 'var(--lime)' : 'var(--text-faint)' }}>{i + 1}</span>
                    )}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: '2px', background: i < step ? 'var(--lime)' : 'var(--border)', margin: '0 8px' }} />
                  )}
                </div>
              ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '20px', color: 'var(--text)', marginBottom: '4px' }}>
                    {STEPS[step].title}
                  </h2>
                  <p style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {STEPS[step].subtitle}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {step === 0 && (
                    <>
                      <div>
                        <label style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Full name *</label>
                        <input className="input" placeholder="Jonas Weber" value={data.founderName} onChange={e => setData(d => ({ ...d, founderName: e.target.value }))} />
                      </div>
                      <div>
                        <label style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Company name *</label>
                        <input className="input" placeholder="Your startup name" value={data.companyName} onChange={e => setData(d => ({ ...d, companyName: e.target.value }))} />
                      </div>
                      <div>
                        <label style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Where is your startup based? *</label>
                        <select className="input" value={data.region} onChange={e => setData(d => ({ ...d, region: e.target.value as Region }))}>
                          <option value="">Select a region…</option>
                          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Team size</label>
                          <input className="input" type="number" placeholder="6" value={data.teamSize} onChange={e => setData(d => ({ ...d, teamSize: e.target.value }))} />
                        </div>
                        <div>
                          <label style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Funding stage</label>
                          <select className="input" value={data.stage} onChange={e => setData(d => ({ ...d, stage: e.target.value }))}>
                            <option value="">Select…</option>
                            <option>Pre-seed</option>
                            <option>Seed</option>
                            <option>Series A</option>
                            <option>Bootstrapped</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <div>
                        <label style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Technology / product *</label>
                        <textarea className="input" placeholder="Describe what you build and how it works" value={data.technology} onChange={e => setData(d => ({ ...d, technology: e.target.value }))} />
                      </div>
                      <div>
                        <label style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Target department at Audi</label>
                        <select className="input" value={data.targetDepartment} onChange={e => setData(d => ({ ...d, targetDepartment: e.target.value }))}>
                          <option value="">Select if known…</option>
                          <option>Production</option>
                          <option>Quality</option>
                          <option>Logistics</option>
                          <option>R&D</option>
                          <option>Procurement</option>
                          <option>Not sure yet</option>
                        </select>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <div>
                      <label style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>What do you need? *</label>
                      <textarea
                        className="input"
                        style={{ minHeight: '120px' }}
                        placeholder="Pilot opportunity? Data access? Co-development? Be specific. Vague asks get slow responses."
                        value={data.ask}
                        onChange={e => setData(d => ({ ...d, ask: e.target.value }))}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
              {step > 0 ? (
                <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>
                  Back
                </button>
              ) : <div />}
              <button
                className="btn-primary"
                onClick={handleNext}
                disabled={!canNext()}
                style={{ opacity: canNext() ? 1 : 0.4 }}
              >
                {step === STEPS.length - 1 ? 'Submit application' : 'Continue'}
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
