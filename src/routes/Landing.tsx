import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, X, Check, Clock, UserX, Lightbulb, Timer, UserCheck, Target } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate:  { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease },
})

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { delay, duration: 0.55, ease },
})

const stations = [
  {
    step: '1',
    h3: 'Apply',
    name: 'The Door',
    body: 'Fill one short form. Get an answer in 2 weeks.',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M14 21V8h3a2 2 0 0 1 2 2v11" />
        <circle cx="11" cy="12" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    step: '2',
    h3: 'Your Internal Lead',
    name: 'The Internal Lead',
    body: 'One Audi person is responsible for your case from start to finish.',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1" />
      </svg>
    ),
  },
  {
    step: '3',
    h3: 'Get matched',
    name: 'The Map',
    body: 'Your idea is matched to a real problem on the line.',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3Z" />
        <path d="M9 3v15M15 6v15" />
      </svg>
    ),
  },
]

const badRows = [
  { icon: <Clock size={22} />, text: <><strong>4 months</strong> and still no answer</> },
  { icon: <UserX size={22} />, text: <>No one is responsible</> },
  { icon: <Lightbulb size={22} />, text: <>Good ideas get lost</> },
]

const goodRows = [
  { icon: <Timer size={22} />, text: <><strong>2 weeks</strong> to a yes or no</> },
  { icon: <UserCheck size={22} />, text: <>One named Internal Lead</> },
  { icon: <Target size={22} />, text: <>Matched to a real need</> },
]

export default function Landing() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const mouseGlowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (mouseGlowRef.current) {
        mouseGlowRef.current.style.left = `${e.clientX}px`
        mouseGlowRef.current.style.top = `${e.clientY}px`
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  function handleApplyNow() {
    login('startup', {})
    navigate('/apply')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Grain + cursor glow */}
      <div className="grain" />
      <div ref={mouseGlowRef} style={{ position: 'fixed', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(214,255,0,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1, transform: 'translate(-50%,-50%)', left: '-400px', top: '-400px' }} />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', textAlign: 'center', padding: '84px 32px 36px', overflow: 'hidden' }}>
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(214,255,0,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(214,255,0,0.035) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 25%, #000, transparent)',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 25%, #000, transparent)',
        }} />

        <div style={{ position: 'relative', maxWidth: '1080px', margin: '0 auto' }}>
          {/* Eyebrow */}
          <motion.span {...fadeUp(0.05)} style={{
            display: 'inline-flex', alignItems: 'center', gap: '9px',
            fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: '12px', color: 'var(--lime)',
            marginBottom: '24px',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lime)', display: 'inline-block' }} />
            Audi × Startups
          </motion.span>

          {/* H1 */}
          <motion.h1 {...fadeUp(0.1)} style={{
            fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 900,
            fontSize: 'clamp(40px, 7vw, 76px)', lineHeight: 1.02, letterSpacing: '-0.02em',
            color: 'var(--text)', marginBottom: '0',
          }}>
            Get your startup<br />into <span style={{ color: 'var(--lime)' }}>Audi</span>.
          </motion.h1>

          {/* CTAs */}
          <motion.div {...fadeUp(0.22)} style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '34px' }}>
            <button onClick={handleApplyNow} style={{
              display: 'inline-flex', alignItems: 'center', gap: '9px',
              fontFamily: "'Inter', system-ui", fontWeight: 600, fontSize: '15px',
              padding: '13px 24px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
              background: 'var(--lime)', color: '#050505', transition: 'opacity 0.15s, transform 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              Apply now <ArrowRight size={17} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── BRIDGE SECTION ───────────────────────────────────────────── */}
      <section id="how" style={{ padding: '30px 0 90px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 32px' }}>

          {/* "Three steps across" label */}
          <motion.div {...inView(0)} style={{ textAlign: 'center', marginBottom: '14px' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '11px', color: 'var(--text-faint)' }}>
              Three steps across
            </span>
          </motion.div>

          <motion.div {...inView(0.05)}>
            {/* Endpoints */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '11px', color: 'var(--text-faint)' }}>You start here</span>
                <span style={{ fontFamily: "'Inter', system-ui", fontWeight: 800, fontSize: 'clamp(20px, 3vw, 30px)', lineHeight: 1 }}>Your startup</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right', alignItems: 'flex-end' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '11px', color: 'var(--text-faint)' }}>You end here</span>
                <span style={{ fontFamily: "'Inter', system-ui", fontWeight: 800, fontSize: 'clamp(20px, 3vw, 30px)', lineHeight: 1, color: 'var(--lime)' }}>In an Audi</span>
              </div>
            </div>

            {/* Bridge graphic */}
            <div style={{ position: 'relative', height: '96px', marginBottom: '8px' }}>
              {/* Cable arc */}
              <div style={{
                position: 'absolute', left: '6%', right: '6%', top: 0, height: '70px',
                border: '2px solid var(--lime)', borderBottom: 'none',
                borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
                opacity: 0.55,
              }} />
              {/* Tower left */}
              <div style={{ position: 'absolute', left: '6%', top: 0, width: '3px', height: '74px', background: 'var(--border-strong)', borderRadius: '2px' }} />
              {/* Tower right */}
              <div style={{ position: 'absolute', right: '6%', top: 0, width: '3px', height: '74px', background: 'var(--border-strong)', borderRadius: '2px' }} />
              {/* Deck */}
              <div style={{
                position: 'absolute', left: 0, right: 0, top: '72px', height: '3px', borderRadius: '2px',
                background: 'linear-gradient(90deg, var(--border-strong), var(--lime) 12%, var(--lime) 88%, var(--border-strong))',
              }} />
            </div>

            {/* Station cards — overlap bridge */}
            <div className="grid-3-col" style={{ position: 'relative', display: 'grid', gap: '18px', marginTop: '-44px', zIndex: 2 }}>
              {stations.map((s, i) => (
                <motion.div key={s.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease }}
                  whileHover={{ y: -4 }}
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '22px 22px 24px',
                    textAlign: 'center', cursor: 'default',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
                >
                  {/* Node circle with step badge */}
                  <div style={{ position: 'relative', width: '54px', height: '54px', margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(214,255,0,0.10)', border: '1px solid rgba(214,255,0,0.4)', display: 'grid', placeItems: 'center', color: 'var(--lime)' }}>
                    {s.icon}
                    <span style={{
                      position: 'absolute', top: '-9px', right: '-9px',
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'var(--lime)', color: '#050505',
                      fontFamily: "'Inter', system-ui", fontWeight: 800, fontSize: '13px',
                      display: 'grid', placeItems: 'center',
                    }}>{s.step}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Inter', system-ui", fontWeight: 800, fontSize: '20px', letterSpacing: '-0.01em', color: 'var(--text)' }}>{s.h3}</h3>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '10px', color: 'var(--lime)', marginTop: '6px' }}>{s.name}</div>
                  <p style={{ marginTop: '10px', fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.body}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── COMPARE ──────────────────────────────────────────────────── */}
      <section style={{ padding: '14px 0 96px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 32px' }}>
          <div className="grid-2-col" style={{ display: 'grid', gap: '16px' }}>

            {/* Bad */}
            <motion.div {...inView(0)} style={{ borderRadius: 'var(--radius)', padding: '30px 30px 32px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '11px', marginBottom: '20px', color: '#FF6173' }}>
                <X size={22} strokeWidth={2.2} /> The old way
              </span>
              {badRows.map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '13px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)', fontSize: '16px', color: 'var(--text)' }}>
                  <span style={{ color: '#FF6173', flexShrink: 0, display: 'flex' }}>{row.icon}</span>
                  <span>{row.text}</span>
                </div>
              ))}
            </motion.div>

            {/* Good */}
            <motion.div {...inView(0.08)} style={{
              borderRadius: 'var(--radius)', padding: '30px 30px 32px',
              border: '1px solid rgba(214,255,0,0.45)',
              background: 'linear-gradient(180deg, rgba(214,255,0,0.05), var(--surface))',
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '11px', marginBottom: '20px', color: 'var(--lime)' }}>
                <Check size={22} strokeWidth={2.2} /> With BRIDGE
              </span>
              {goodRows.map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '13px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)', fontSize: '16px', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--lime)', flexShrink: 0, display: 'flex' }}>{row.icon}</span>
                  <span>{row.text}</span>
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── BENCHMARK STRIP ──────────────────────────────────────────── */}
      <section style={{ padding: '0 0 64px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 32px' }}>
          <motion.div {...inView(0)} style={{
            display: 'grid', gridTemplateColumns: '1fr 1px 1fr',
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            background: 'var(--surface)', overflow: 'hidden',
          }}>
            {/* BMW */}
            <div style={{ padding: '28px 36px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '12px' }}>
                BMW Startup Garage · est. 2015
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: 'clamp(40px, 5vw, 60px)', color: 'var(--text)', lineHeight: 1, marginBottom: '6px' }}>
                32
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                completed startup projects in 2022
              </div>
            </div>

            {/* Divider */}
            <div style={{ background: 'var(--border)' }} />

            {/* Audi */}
            <div style={{ padding: '28px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '12px' }}>
                  Audi A4nXT · est. 2020
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: 'clamp(40px, 5vw, 60px)', color: 'var(--red)', lineHeight: 1, marginBottom: '6px' }}>
                  ~3
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                  public wins in 4 years
                </div>
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-faint)', lineHeight: 1.6, marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                Audi is ranked #8 globally by brand value. Top-tier founders are routing around it for BMW, which gives a supplier number in week six. BRIDGE fixes that.
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────── */}
      <section style={{ padding: '0 0 110px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 32px' }}>
          <motion.div {...inView(0)} style={{
            position: 'relative', overflow: 'hidden', textAlign: 'center',
            border: '1px solid var(--border)', borderRadius: '24px',
            background: 'var(--surface)', padding: '70px 32px',
          }}>
            {/* Grid bg */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: 'linear-gradient(rgba(214,255,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(214,255,0,0.04) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              WebkitMaskImage: 'radial-gradient(ellipse 60% 80% at 50% 50%, #000, transparent)',
              maskImage: 'radial-gradient(ellipse 60% 80% at 50% 50%, #000, transparent)',
            }} />
            <div style={{ position: 'relative' }}>
              <h2 style={{ fontFamily: "'Inter', system-ui", fontWeight: 900, fontSize: 'clamp(30px, 4.5vw, 50px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                Built something good?<br /><span style={{ color: 'var(--lime)' }}>Audi wants to see it.</span>
              </h2>
              <p style={{ margin: '16px auto 0', maxWidth: '560px', fontSize: 'clamp(16px, 2.2vw, 20px)', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Apply in five minutes. We'll point you to a real person.
              </p>
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '34px' }}>
                <button onClick={handleApplyNow} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '9px',
                  fontFamily: "'Inter', system-ui", fontWeight: 600, fontSize: '15px',
                  padding: '13px 24px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                  background: 'var(--lime)', color: '#050505', transition: 'opacity 0.15s, transform 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1.03)' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
                >
                  Start your application <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 0' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px', fontFamily: "'Inter', system-ui", fontWeight: 800, letterSpacing: '0.04em', fontSize: '17px', color: 'var(--text)' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--lime)', display: 'grid', placeItems: 'center', color: '#050505', fontWeight: 900, fontSize: '17px' }}>B</span>
            BRIDGE
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '11px', color: 'var(--text-faint)' }}>
            Audi · Corporate Campus Challenge
          </span>
        </div>
      </footer>

    </motion.div>
  )
}
