import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, CheckCircle, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBridgeStore } from '../store/store'
import { useAuthStore } from '../store/authStore'
import DemoHint from '../components/DemoHint'
import type { Application } from '../store/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const MONO = "'AudiType', sans-serif"
const SANS = "'AudiType', sans-serif"
const EXTENDED = "'AudiType Extended', 'AudiType', sans-serif"
const LIME = 'var(--accent)'
const LIME_DIM = 'var(--accent-dim)'
const LIME_BORDER = 'var(--text)'
const GLASS_BG = 'color-mix(in srgb, var(--bg) 65%, transparent)'
const SURFACE = 'var(--surface-2)'
const MUTED = 'var(--text-muted)'
const ON_SURFACE = 'var(--text)'
const BORDER_SUBTLE = 'var(--border)'
const BORDER_MED = 'var(--border-strong)'


const REGIONS = ['Bavaria', 'Baden-Württemberg', 'Hesse', 'Other Germany', 'Outside Germany']
const NEARBY = ['Bavaria', 'Baden-Württemberg']

interface FormData {
  founderName: string
  companyName: string
  region: string
  wantsVisit: boolean | null
  teamSize: string
  funding: string
  technology: string
  targetDepartment: string
  stage: string
  ask: string
  trl: number
  milestones: string
  monthsToMarket: string
  apiStandards: string
  complianceCert: string
  hasEdgeArch: boolean
  hasCloudNative: boolean
  partnerType: string
  timeline: string
}

const EMPTY: FormData = {
  founderName: '',
  companyName: '',
  region: '',
  wantsVisit: null,
  teamSize: '',
  funding: '',
  technology: '',
  targetDepartment: '',
  stage: '',
  ask: '',
  trl: 0,
  milestones: '',
  monthsToMarket: '',
  apiStandards: '',
  complianceCert: 'None / Self-Audit',
  hasEdgeArch: false,
  hasCloudNative: false,
  partnerType: '',
  timeline: '',
}

function generateId() {
  const num = Math.floor(Math.random() * 900) + 100
  return `B-DD-${num}-ALPHA`
}

function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// ─── Subcomponents ─────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: MONO, fontSize: '11px', color: MUTED, marginBottom: '10px' }}>
      {children}
    </p>
  )
}

function ApplyInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%', background: SURFACE, border: `1px solid ${BORDER_MED}`,
        borderRadius: '0', padding: '13px 16px', fontSize: '13px',
        color: ON_SURFACE, fontFamily: SANS, outline: 'none',
        transition: 'border-color 0.15s',
        ...props.style,
      }}
      onFocus={e => { e.currentTarget.style.borderColor = LIME_BORDER }}
      onBlur={e => { e.currentTarget.style.borderColor = BORDER_MED }}
    />
  )
}

function ApplyTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: '100%', background: SURFACE, border: `1px solid ${BORDER_MED}`,
        borderRadius: '0', padding: '13px 16px', fontSize: '13px',
        color: ON_SURFACE, fontFamily: SANS, outline: 'none', resize: 'vertical',
        minHeight: '100px', lineHeight: '1.65', transition: 'border-color 0.15s',
        ...props.style,
      }}
      onFocus={e => { e.currentTarget.style.borderColor = LIME_BORDER }}
      onBlur={e => { e.currentTarget.style.borderColor = BORDER_MED }}
    />
  )
}

function ApplySelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        width: '100%', background: SURFACE, border: `1px solid ${BORDER_MED}`,
        borderRadius: '0', padding: '13px 16px', fontSize: '13px',
        color: ON_SURFACE, fontFamily: SANS, outline: 'none',
        appearance: 'none', cursor: 'pointer', transition: 'border-color 0.15s',
        ...props.style,
      }}
      onFocus={e => { e.currentTarget.style.borderColor = LIME_BORDER }}
      onBlur={e => { e.currentTarget.style.borderColor = BORDER_MED }}
    />
  )
}

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
      <span style={{ fontFamily: MONO, color: LIME, fontSize: '18px', fontWeight: 700 }}>{num}</span>
      <h2 style={{ fontFamily: MONO, fontSize: '13px', color: ON_SURFACE, margin: 0 }}>{title}</h2>
      <div style={{ flex: 1, height: '1px', background: BORDER_SUBTLE }} />
    </div>
  )
}

function GlassCard({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={className} style={{
      background: GLASS_BG, backdropFilter: 'blur(24px)',
      border: `1px solid ${BORDER_SUBTLE}`, borderRadius: '0',
      transition: 'border-color 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── Portal Node SVG ───────────────────────────────────────────────────────────


// ─── Main Component ─────────────────────────────────────────────────────────────

export default function Apply() {
  const [data, setData] = useState<FormData>(EMPTY)
  const [appId, setAppId] = useState('')
  const [done, setDone] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [revealedIds, setRevealedIds] = useState<ReadonlySet<string>>(new Set())
  const sec1Ref = useRef<HTMLElement>(null)
  const sec2Ref = useRef<HTMLElement>(null)
  const sec3Ref = useRef<HTMLElement>(null)
  const sec4Ref = useRef<HTMLElement>(null)
  const { addApplication } = useBridgeStore()
  const loginAuth = useAuthStore(s => s.login)
  const navigate = useNavigate()

  // Inject page-scoped CSS once
  useEffect(() => {
    const id = 'apply-v2-styles'
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      .ap-reveal { opacity:0; transform:translateY(22px); transition:all 0.9s cubic-bezier(0.22,1,0.36,1); }
      .ap-reveal.in { opacity:1; transform:translateY(0); }
      .ap-lime-pulse { animation:ap-pulse 3s ease-in-out infinite; }
      @keyframes ap-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
      @media (prefers-reduced-motion: reduce) {
        .ap-reveal { transition:none; }
        .ap-lime-pulse { animation:none; }
      }
      .ap-trl { padding:11px 0; border:1px solid var(--border); border-radius:0; background:transparent; color:var(--text); font-family:'AudiType',sans-serif; font-size:12px; cursor:pointer; transition:all 0.15s; text-align:center; }
      .ap-trl:hover { border-color:var(--border-strong); }
      .ap-trl.sel { border-color:var(--text); background:var(--accent-dim); }
      .ap-check { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border:1px solid var(--border); border-radius:0; cursor:pointer; transition:background 0.15s; }
      .ap-check:hover { background:var(--accent-dim); }
      .ap-scroll::-webkit-scrollbar { width:2px; }
      .ap-scroll::-webkit-scrollbar-track { background:transparent; }
      .ap-scroll::-webkit-scrollbar-thumb { background:var(--border-strong); }
      .ap-ring { transition:stroke-dashoffset 0.8s ease-in-out; transform:rotate(-90deg); transform-origin:50% 50%; }
      .ap-error-ring { box-shadow: 0 0 0 1px var(--red) !important; }
      .ap-glass-card:hover { border-color:var(--border-strong) !important; }
      /* ── Responsive layout ─────────────────────────────────────── */
      .ap-main-grid { grid-template-columns: 220px 1fr; }
      .ap-form-2col { grid-template-columns: 1fr 1fr; }
      .ap-trl-grid  { grid-template-columns: repeat(9, 1fr); }
      @media (max-width: 900px) {
        .ap-main-grid { grid-template-columns: 1fr; }
        .ap-left-aside { display: none !important; }
      }
      @media (max-width: 640px) {
        .ap-form-2col { grid-template-columns: 1fr; }
        .ap-trl-grid  { grid-template-columns: repeat(5, 1fr); }
      }
    `
    document.head.appendChild(style)
  }, [])

  // Scroll reveal — tracks revealed IDs in state so React owns the className
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.ap-reveal[data-reveal-id]')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          const id = (e.target as HTMLElement).dataset.revealId
          if (id) setRevealedIds(prev => { const s = new Set(prev); s.add(id); return s })
        }
      }),
      { threshold: 0.06 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [done])

  const s1Done = !!(data.founderName && data.companyName && data.region)
  const s2Done = !!(data.trl > 0 && data.stage)
  const s3Done = !!(data.technology)
  const s4Done = !!(data.ask)
  const canSubmit = !!(s1Done && s2Done && s3Done && s4Done)

  function handleSubmitAttempt(e: React.FormEvent) {
    e.preventDefault()
    if (canSubmit) { submit(); return }
    setAttempted(true)
    const firstIncomplete =
      !s1Done ? sec1Ref :
      !s2Done ? sec2Ref :
      !s3Done ? sec3Ref :
      !s4Done ? sec4Ref : null
    firstIncomplete?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function submit() {
    if (!canSubmit) return
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
      funding: data.funding || 'Undisclosed',
      teamSize: parseInt(data.teamSize) || 1,
    }
    addApplication(app)
    loginAuth('startup', { appId: id })
    setDone(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const completedSections = [s1Done, s2Done, s3Done, s4Done].filter(Boolean).length
  const progressPct = Math.round((completedSections / 4) * 100)

  // ─── Done Screen ─────────────────────────────────────────────────────────────

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        style={{ minHeight: '100vh', background: 'var(--bg)', padding: '120px 40px 80px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}
      >
        <div style={{ maxWidth: '560px', width: '100%' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
            {/* Status badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: MONO, fontSize: '11px', color: LIME, border: `1px solid ${LIME_BORDER}`, padding: '6px 12px', borderRadius: '0', background: LIME_DIM }}>
                <span className="ap-lime-pulse" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: LIME }} />
                Application Logged
              </span>
            </div>

            <div style={{ marginBottom: '8px', fontFamily: MONO, fontSize: '11px', color: MUTED }}>Session ID</div>
            <h1 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 40px)', color: LIME, marginBottom: '16px', lineHeight: 1.1 }}>
              {appId}
            </h1>
            <p style={{ fontFamily: SANS, fontSize: '14px', color: MUTED, lineHeight: 1.7, marginBottom: '40px' }}>
              Your application is in the queue. A named Audi contact will reach out within 48 hours —<br />
              a real yes or no within <strong style={{ color: ON_SURFACE }}>14 days</strong>.
            </p>

            {/* Timeline cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: BORDER_SUBTLE, marginBottom: '24px', borderRadius: '0', overflow: 'hidden' }}>
              {[
                { val: '48h', desc: 'Named contact assigned' },
                { val: addDays(14), desc: 'Decision deadline' },
              ].map(({ val, desc }, i) => (
                <motion.div
                  key={val} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.12 }}
                  style={{ background: SURFACE, padding: '20px 24px' }}
                >
                  <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: '20px', color: LIME, marginBottom: '6px' }}>{val}</div>
                  <div style={{ fontFamily: MONO, fontSize: '11px', color: MUTED }}>{desc}</div>
                </motion.div>
              ))}
            </div>

            {data.wantsVisit === true && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ delay: 0.45 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontFamily: SANS, fontSize: '12px', color: LIME, background: LIME_DIM, border: `1px solid ${LIME_BORDER}`, padding: '12px 16px', borderRadius: '0' }}
              >
                <Check size={14} />
                Plant visit requested — your Internal Lead will reach out to schedule.
              </motion.div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => navigate(`/founder/${appId}`)}
                style={{ flex: 1, padding: '14px', background: LIME, color: 'var(--accent-contrast)', fontFamily: MONO, fontSize: '12px', fontWeight: 700, border: 'none', borderRadius: '0', cursor: 'pointer' }}
              >
                Track Application
              </button>
              <button
                onClick={() => { setDone(false); setData(EMPTY) }}
                style={{ padding: '14px 20px', background: 'transparent', color: MUTED, fontFamily: MONO, fontSize: '12px', border: `1px solid ${BORDER_MED}`, borderRadius: '0', cursor: 'pointer' }}
              >
                New
              </button>
            </div>

            {/* Footer note */}
            <div style={{ marginTop: '40px', padding: '16px', borderTop: `1px solid ${BORDER_SUBTLE}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--text-faint)' }}>{appId}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: MONO, fontSize: '11px', color: 'var(--text-faint)' }}>
                <ShieldCheck size={10} />
                AES-256
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  // ─── Main Form View ──────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      <div className="ap-main-grid" style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 40px 80px', display: 'grid', gap: '32px', position: 'relative', zIndex: 10 }}>

        {/* ── Left Sidebar ──────────────────────────────────────────────── */}
        <aside className="ap-left-aside" style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '100px', height: 'fit-content' }}>

          {/* Progress Nav */}
          <GlassCard style={{ padding: '20px' }} className="ap-glass-card">
            <h3 style={{ fontFamily: MONO, fontSize: '11px', color: MUTED, marginBottom: '24px' }}>Your Progress</h3>

            {/* Completion ring */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  <circle cx="50" cy="50" r="42" fill="transparent" stroke={BORDER_SUBTLE} strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="transparent" stroke={LIME} strokeWidth="8"
                    strokeDasharray="263.9" strokeDashoffset={263.9 * (1 - progressPct / 100)}
                    className="ap-ring" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: '11px', color: LIME }}>
                  {progressPct}%
                </div>
              </div>
              <div>
                <p style={{ fontFamily: MONO, fontSize: '11px', color: ON_SURFACE, fontWeight: 600 }}>{completedSections}/4</p>
                <p style={{ fontFamily: MONO, fontSize: '11px', color: MUTED }}>Sections done</p>
              </div>
            </div>

            <nav style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '7px', top: '4px', bottom: '4px', width: '1px', background: BORDER_SUBTLE }} />
              {[
                { num: '01', label: 'About you', done: s1Done },
                { num: '02', label: 'Where you are', done: s2Done },
                { num: '03', label: 'Your technology', done: s3Done },
                { num: '04', label: 'What you need', done: s4Done },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: i < 3 ? '16px' : 0, opacity: item.done ? 1 : 0.45, transition: 'opacity 0.3s', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '15px', height: '15px', borderRadius: '50%', flexShrink: 0,
                    border: `1px solid ${item.done ? LIME : 'var(--border-strong)'}`,
                    background: item.done ? LIME_DIM : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {item.done && <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: LIME }} />}
                  </div>
                  <div>
                    <p style={{ fontFamily: MONO, fontSize: '11px', color: item.done ? LIME : MUTED, marginBottom: '1px' }}>{item.num}</p>
                    <p style={{ fontFamily: MONO, fontSize: '11px', color: item.done ? ON_SURFACE : MUTED, fontWeight: item.done ? 600 : 400 }}>{item.label}</p>
                  </div>
                </div>
              ))}
            </nav>
          </GlassCard>

        </aside>

        {/* ── Center Form ────────────────────────────────────────────────── */}
        <section style={{ minWidth: 0 }}>
          <DemoHint persona="You are a startup founder" hint="Required to submit: Company Name, Founder Name, Region (§01) · TRL + Stage (§02) · Technology description (§03) · What you need from Audi (§04). All other fields are optional." />

          {/* Page header */}
          <div className="ap-reveal in" style={{ padding: '40px', border: `1px solid ${BORDER_SUBTLE}`, background: 'var(--surface)', borderRadius: '0', marginBottom: '40px' }}>
            <h1 style={{ fontFamily: EXTENDED, fontWeight: 700, fontSize: 'clamp(24px,3.5vw,36px)', color: ON_SURFACE, marginBottom: '0', lineHeight: 1.1 }}>
              Your application
            </h1>
          </div>

          <form onSubmit={handleSubmitAttempt} style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

            {/* ── Section 01: About you ─────────────────────────────────── */}
            <section ref={sec1Ref} className={`ap-reveal in${attempted && !s1Done ? ' ap-error-ring' : ''}`}>
              <SectionHeader num="01" title="About you" />
              <div className="ap-form-2col" style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <Label>Legal Company Name *</Label>
                  <ApplyInput placeholder="Your startup name" value={data.companyName} onChange={e => setData(d => ({ ...d, companyName: e.target.value }))} />
                </div>
                <div>
                  <Label>Founder Full Name *</Label>
                  <ApplyInput placeholder="Jonas Weber" value={data.founderName} onChange={e => setData(d => ({ ...d, founderName: e.target.value }))} />
                </div>
                <div>
                  <Label>Region *</Label>
                  <ApplySelect value={data.region} onChange={e => setData(d => ({ ...d, region: e.target.value, wantsVisit: null }))}>
                    <option value="">Select region…</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </ApplySelect>
                </div>
                <div>
                  <Label>Team Size</Label>
                  <ApplyInput type="number" placeholder="6" value={data.teamSize} onChange={e => setData(d => ({ ...d, teamSize: e.target.value }))} />
                </div>
                <div>
                  <Label>Funding Stage</Label>
                  <ApplySelect value={data.funding} onChange={e => setData(d => ({ ...d, funding: e.target.value }))}>
                    <option value="">Select…</option>
                    <option>Pre-seed</option>
                    <option>Seed</option>
                    <option>Series A</option>
                    <option>Bootstrapped</option>
                  </ApplySelect>
                </div>
                <div>
                  <Label>Target Department at Audi</Label>
                  <ApplySelect value={data.targetDepartment} onChange={e => setData(d => ({ ...d, targetDepartment: e.target.value }))}>
                    <option value="">Select if known…</option>
                    <option>Production</option>
                    <option>Quality</option>
                    <option>Logistics</option>
                    <option>R&D</option>
                    <option>Procurement</option>
                    <option>Not sure yet</option>
                  </ApplySelect>
                </div>
              </div>

              {/* Inline visit prompt for nearby regions */}
              <AnimatePresence>
                {NEARBY.includes(data.region) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }} style={{ overflow: 'hidden', marginTop: '20px' }}
                  >
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER_MED}`, borderLeft: `3px solid ${LIME}`, borderRadius: '0', padding: '18px 20px' }}>
                      <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: '13px', color: ON_SURFACE, marginBottom: '6px' }}>Would you like to meet in person?</p>
                      <p style={{ fontFamily: SANS, fontSize: '12px', color: MUTED, lineHeight: 1.6, marginBottom: '14px' }}>
                        You're nearby — your Internal Lead can arrange a plant visit in Ingolstadt or Neckarsulm within your first two weeks.
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[{ label: 'Yes, arrange a visit', val: true }, { label: 'No thanks', val: false }].map(opt => (
                          <button key={String(opt.val)} type="button" onClick={() => setData(d => ({ ...d, wantsVisit: opt.val }))}
                            style={{
                              fontFamily: SANS, fontSize: '12px', fontWeight: 600, padding: '8px 16px',
                              borderRadius: '0', cursor: 'pointer', transition: 'all 0.15s',
                              background: data.wantsVisit === opt.val ? (opt.val ? LIME_DIM : SURFACE) : 'transparent',
                              border: `1px solid ${data.wantsVisit === opt.val ? (opt.val ? LIME_BORDER : BORDER_MED) : BORDER_MED}`,
                              color: data.wantsVisit === opt.val ? (opt.val ? LIME : ON_SURFACE) : MUTED,
                            }}>
                            {opt.val && data.wantsVisit === true && <Check size={12} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />}
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* ── Section 02: Where you are ─────────────────────────────── */}
            <section ref={sec2Ref} data-reveal-id="s2" className={`ap-reveal${revealedIds.has('s2') ? ' in' : ''}${attempted && !s2Done ? ' ap-error-ring' : ''}`} style={{ background: GLASS_BG, backdropFilter: 'blur(24px)', border: `1px solid ${BORDER_SUBTLE}`, borderRadius: '0', padding: '32px' }}>
              <SectionHeader num="02" title="Where you are" />

              <div style={{ marginBottom: '28px' }}>
                <Label>Technology Readiness Level (TRL) *</Label>
                <div className="ap-trl-grid" style={{ display: 'grid', gap: '6px' }}>
                  {Array.from({ length: 9 }, (_, i) => i + 1).map(n => (
                    <button
                      key={n} type="button"
                      className={`ap-trl${data.trl === n ? ' sel' : ''}`}
                      onClick={() => setData(d => ({ ...d, trl: n }))}
                    >
                      T{n}
                    </button>
                  ))}
                </div>
                {data.trl > 0 && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: MONO, fontSize: '11px', color: LIME, marginTop: '10px' }}>
                    T{data.trl}: {['basic research principles observed', 'technology concept formulated', 'experimental proof of concept', 'validated in lab environment', 'validated in relevant environment', 'demonstrated in relevant environment', 'system prototype demonstrated in operational environment', 'system complete and qualified', 'actual system proven in operational environment'][data.trl - 1]}
                  </motion.p>
                )}
              </div>

              <div className="ap-form-2col" style={{ display: 'grid', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <Label>Current Stage *</Label>
                  <ApplySelect value={data.stage} onChange={e => setData(d => ({ ...d, stage: e.target.value }))}>
                    <option value="">Select…</option>
                    <option>Prototype / Lab POC</option>
                    <option>Pilot (Active Testing)</option>
                    <option>Series Production Ready</option>
                    <option>Commercial Scale Deployment</option>
                  </ApplySelect>
                </div>
                <div>
                  <Label>Months to Market</Label>
                  <ApplyInput type="number" placeholder="e.g. 18" value={data.monthsToMarket} onChange={e => setData(d => ({ ...d, monthsToMarket: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Major Milestones — Next 24 Months</Label>
                <ApplyTextarea placeholder="What are you building in the next 2 years?" value={data.milestones} onChange={e => setData(d => ({ ...d, milestones: e.target.value }))} />
              </div>
            </section>

            {/* ── Section 03: Your technology ───────────────────────────── */}
            <section ref={sec3Ref} data-reveal-id="s3" className={`ap-reveal${revealedIds.has('s3') ? ' in' : ''}${attempted && !s3Done ? ' ap-error-ring' : ''}`}>
              <SectionHeader num="03" title="Your technology" />

              <div className="ap-form-2col" style={{ display: 'grid', gap: '20px', marginBottom: '20px' }}>
                {/* Infrastructure */}
                <GlassCard style={{ padding: '20px' }} className="ap-glass-card">
                  <h4 style={{ fontFamily: MONO, fontSize: '11px', color: LIME, marginBottom: '16px' }}>Hosting & Infrastructure</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {[
                      { key: 'hasEdgeArch', label: 'Native Edge Architecture' },
                      { key: 'hasCloudNative', label: 'Cloud Native (K8s)' },
                    ].map(({ key, label }) => (
                      <label key={key} className="ap-check" style={{ cursor: 'pointer' }}>
                        <span style={{ fontFamily: MONO, fontSize: '11px', color: ON_SURFACE }}>{label}</span>
                        <input type="checkbox" checked={(data as unknown as Record<string, boolean>)[key]}
                          onChange={e => setData(d => ({ ...d, [key]: e.target.checked }))}
                          style={{ accentColor: LIME, width: '14px', height: '14px' }} />
                      </label>
                    ))}
                  </div>
                  <Label>API Standards</Label>
                  <ApplyInput placeholder="gRPC, REST, GraphQL…" value={data.apiStandards} onChange={e => setData(d => ({ ...d, apiStandards: e.target.value }))} />
                </GlassCard>

                {/* Compliance */}
                <GlassCard style={{ padding: '20px' }} className="ap-glass-card">
                  <h4 style={{ fontFamily: MONO, fontSize: '11px', color: LIME, marginBottom: '16px' }}>Compliance & Security</h4>
                  <div style={{ marginBottom: '12px' }}>
                    <Label>Certification</Label>
                    <ApplySelect value={data.complianceCert} onChange={e => setData(d => ({ ...d, complianceCert: e.target.value }))}>
                      <option>TISAX Label: ACTIVE</option>
                      <option>ISO 27001 Certified</option>
                      <option>SOC 2 Type II</option>
                      <option>None / Self-Audit</option>
                    </ApplySelect>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: `1px solid ${BORDER_SUBTLE}`, background: LIME_DIM, borderRadius: '0' }}>
                    <span style={{ fontFamily: MONO, fontSize: '11px', color: LIME }}>GDPR Data Isolation</span>
                    <CheckCircle size={14} color={LIME} />
                  </div>
                </GlassCard>
              </div>

              <div>
                <Label>Technology / Product Description *</Label>
                <ApplyTextarea placeholder="Describe what you build and how it works — be specific about the technical approach" value={data.technology} onChange={e => setData(d => ({ ...d, technology: e.target.value }))} />
              </div>
            </section>

            {/* ── Section 04: What you need from Audi ──────────────────── */}
            <section ref={sec4Ref} data-reveal-id="s4" className={`ap-reveal${revealedIds.has('s4') ? ' in' : ''}${attempted && !s4Done ? ' ap-error-ring' : ''}`} style={{ background: GLASS_BG, backdropFilter: 'blur(24px)', border: `1px solid ${BORDER_SUBTLE}`, borderRadius: '0', padding: '32px' }}>
              <SectionHeader num="04" title="What you need from Audi" />

              <div style={{ marginBottom: '20px' }}>
                <Label>What do you need from Audi? *</Label>
                <ApplyTextarea
                  style={{ minHeight: '120px' }}
                  placeholder="Pilot opportunity? Data access? Co-development? Plant access? Be specific — vague asks get slow responses."
                  value={data.ask}
                  onChange={e => setData(d => ({ ...d, ask: e.target.value }))}
                />
              </div>
              <div className="ap-form-2col" style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <Label>Desired Partnership Type</Label>
                  <ApplySelect value={data.partnerType} onChange={e => setData(d => ({ ...d, partnerType: e.target.value }))}>
                    <option value="">Select…</option>
                    <option>Pilot / POC</option>
                    <option>Co-development</option>
                    <option>Data partnership</option>
                    <option>Supplier integration</option>
                    <option>Licensing / IP deal</option>
                    <option>Not sure yet</option>
                  </ApplySelect>
                </div>
                <div>
                  <Label>Expected Integration Timeline</Label>
                  <ApplySelect value={data.timeline} onChange={e => setData(d => ({ ...d, timeline: e.target.value }))}>
                    <option value="">Select…</option>
                    <option>Under 3 months</option>
                    <option>3–6 months</option>
                    <option>6–12 months</option>
                    <option>12–24 months</option>
                    <option>Longer / custom</option>
                  </ApplySelect>
                </div>
              </div>
            </section>

            {/* ── Submit ────────────────────────────────────────────────── */}
            <div data-reveal-id="submit" className={`ap-reveal${revealedIds.has('submit') ? ' in' : ''}`} style={{ paddingTop: '8px' }}>
              <button
                type="submit"
                style={{
                  width: '100%', padding: '22px', background: canSubmit ? LIME : 'var(--surface-2)',
                  color: canSubmit ? 'var(--accent-contrast)' : 'var(--text-faint)', fontFamily: MONO, fontWeight: 700, fontSize: '13px',
                  border: canSubmit ? 'none' : '1px solid var(--border)',
                  borderRadius: '0', cursor: canSubmit ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                Submit Application
                <ShieldCheck size={16} />
              </button>

            </div>
          </form>
        </section>
      </div>

    </div>
  )
}
