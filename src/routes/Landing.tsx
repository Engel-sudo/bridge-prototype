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
    num: '01',
    actor: 'You',
    h3: 'You apply',
    name: 'One short form',
    body: 'Five minutes to fill in. You get a named contact within 48 hours and a yes-or-no within two weeks.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M14 21V8h3a2 2 0 0 1 2 2v11" />
        <circle cx="11" cy="12" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    num: '02',
    actor: 'Audi',
    h3: 'You get one owner',
    name: 'Your Internal Lead',
    body: 'One Audi employee — a real person, based at the plant where the cars are built — owns your case from the first call to the pilot.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1" />
      </svg>
    ),
  },
  {
    num: '03',
    actor: 'You + Audi',
    h3: 'You run a pilot',
    name: 'Matched to a real need',
    body: 'Audi teams post real problems from the production line. Yours gets matched to one — and if it fits, you pilot it inside the plant.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3Z" />
        <path d="M9 3v15M15 6v15" />
      </svg>
    ),
  },
]

const badRows = [
  { icon: <Clock size={22} />, text: <><strong>4 months</strong> and still no answer</> },
  { icon: <UserX size={22} />, text: <>Nobody owns your case</> },
  { icon: <Lightbulb size={22} />, text: <>Good ideas get lost</> },
]

const goodRows = [
  { icon: <Timer size={22} />, text: <><strong>2 weeks</strong> to a yes or no</> },
  { icon: <UserCheck size={22} />, text: <>One named Internal Lead</> },
  { icon: <Target size={22} />, text: <>Matched to a real need</> },
]

export default function Landing() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  function handleApplyNow() {
    login('startup', {})
    navigate('/apply')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: "'AudiType', system-ui, sans-serif" }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', textAlign: 'center', padding: '84px 32px 36px', overflow: 'hidden' }}>
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(var(--accent-dim) 1px, transparent 1px), linear-gradient(90deg, var(--accent-dim) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 25%, #000, transparent)',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 25%, #000, transparent)',
        }} />

        <div style={{ position: 'relative', maxWidth: '1080px', margin: '0 auto' }}>
          {/* Eyebrow */}
          <motion.span {...fadeUp(0.05)} style={{
            display: 'inline-flex', alignItems: 'center', gap: '9px',
            fontFamily: "'AudiType', sans-serif", fontSize: '12px', color: 'var(--accent)',
            marginBottom: '24px',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Audi × Startups
          </motion.span>

          {/* H1 */}
          <motion.h1 {...fadeUp(0.1)} style={{
            fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700,
            fontSize: 'clamp(34px, 5.4vw, 62px)', lineHeight: 1.08,
            color: 'var(--text)', marginBottom: '0',
          }}>
            Get your startup into Audi.
          </motion.h1>

          {/* Subline */}
          <motion.p {...fadeUp(0.17)} style={{
            marginTop: '22px', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto',
            fontSize: 'clamp(16px, 2vw, 20px)', fontWeight: 400, color: 'var(--text)', lineHeight: 1.55,
          }}>
            Apply once. In 48 hours you have a name at Audi. In 2 weeks you have an answer.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.22)} style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '34px' }}>
            <button onClick={handleApplyNow} style={{
              display: 'inline-flex', alignItems: 'center', gap: '9px',
              fontFamily: "'AudiType', system-ui", fontWeight: 600, fontSize: '15px',
              padding: '13px 24px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
              background: 'var(--accent)', color: 'var(--accent-contrast)', transition: 'opacity 0.15s, transform 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              Apply now <ArrowRight size={17} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── WHY THIS EXISTS ──────────────────────────────────────────── */}
      <section style={{ padding: '10px 0 72px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 32px' }}>
          <motion.div {...inView(0)}>
            <span style={{ fontFamily: "'AudiType', sans-serif", fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '20px' }}>
              Why this exists
            </span>
            <p style={{ fontSize: 'clamp(16px, 2.2vw, 20px)', color: 'var(--text)', lineHeight: 1.65, marginBottom: '18px' }}>
              Selling to a big carmaker usually goes like this: you find a contact, they forward you to someone else, that person forwards you again. Four months later you still don't know if anyone looked at your product.
            </p>
            <p style={{ fontSize: 'clamp(16px, 2.2vw, 20px)', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '28px' }}>
              Most startups can't wait that long.
            </p>
            <p style={{ fontFamily: "'AudiType', sans-serif", fontSize: '13px', color: 'var(--accent)' }}>
              BRIDGE makes three promises instead. ↓
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── BRIDGE SECTION ───────────────────────────────────────────── */}
      <section id="how" style={{ padding: '30px 0 90px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 32px' }}>

          {/* Section header — frames the whole journey for newcomers */}
          <motion.div {...inView(0)} style={{ textAlign: 'center', marginBottom: '40px', maxWidth: '620px', marginLeft: 'auto', marginRight: 'auto' }}>
            <span style={{ fontFamily: "'AudiType', sans-serif", fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '12px' }}>
              How it works
            </span>
            <h2 style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 3.4vw, 36px)', lineHeight: 1.12, color: 'var(--text)' }}>
              Three steps from outside to inside
            </h2>
            <p style={{ marginTop: '14px', fontSize: 'clamp(15px, 1.8vw, 18px)', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              You apply. Audi gives you one named owner. Together you run a pilot on a real production problem.
            </p>
          </motion.div>

          <motion.div {...inView(0.05)}>
            {/* Endpoints */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontFamily: "'AudiType', sans-serif", fontSize: '11px', color: 'var(--text-faint)' }}>You start here</span>
                <span style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: 'clamp(20px, 3vw, 30px)', lineHeight: 1 }}>Your startup</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right', alignItems: 'flex-end' }}>
                <span style={{ fontFamily: "'AudiType', sans-serif", fontSize: '11px', color: 'var(--text-faint)' }}>You end here</span>
                <span style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: 'clamp(20px, 3vw, 30px)', lineHeight: 1, color: 'var(--accent)' }}>With Audi</span>
              </div>
            </div>

            {/* Bridge graphic */}
            <div style={{ position: 'relative', height: '96px', marginBottom: '8px' }}>
              {/* Cable arc */}
              <div style={{
                position: 'absolute', left: '6%', right: '6%', top: 0, height: '70px',
                border: '2px solid var(--accent)', borderBottom: 'none',
                borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
                opacity: 0.55,
              }} />
              {/* Tower left */}
              <div style={{ position: 'absolute', left: '6%', top: 0, width: '3px', height: '74px', background: 'var(--border-strong)', borderRadius: '0' }} />
              {/* Tower right */}
              <div style={{ position: 'absolute', right: '6%', top: 0, width: '3px', height: '74px', background: 'var(--border-strong)', borderRadius: '0' }} />
              {/* Deck */}
              <div style={{
                position: 'absolute', left: 0, right: 0, top: '72px', height: '3px', borderRadius: '0',
                background: 'linear-gradient(90deg, var(--border-strong), var(--accent) 12%, var(--accent) 88%, var(--border-strong))',
              }} />
            </div>

            {/* Station cards — informational, overlap the bridge deck.
                Static by design: no hover-lift / cursor so they don't read as clickable. */}
            <div className="grid-3-col" style={{ position: 'relative', display: 'grid', gap: '18px', marginTop: '-36px', zIndex: 2 }}>
              {stations.map((s, i) => (
                <motion.div key={s.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease }}
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderTop: '2px solid var(--accent)',
                    borderRadius: 'var(--radius)', padding: '22px 22px 26px',
                    textAlign: 'left',
                  }}
                >
                  {/* Top row: typographic step number + who acts */}
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <span style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: '30px', lineHeight: 1, color: 'var(--border-strong)' }}>{s.num}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'AudiType', sans-serif", fontSize: '11px', color: 'var(--accent)' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                      {s.actor}
                    </span>
                  </div>
                  {/* Square icon tile — sharp, on-brand (no circles, no floating bubble) */}
                  <div style={{ width: '44px', height: '44px', borderRadius: 0, background: 'var(--accent-dim)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', color: 'var(--accent)', marginBottom: '16px' }}>
                    {s.icon}
                  </div>
                  <h3 style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: '18px', color: 'var(--text)' }}>{s.h3}</h3>
                  <div style={{ fontFamily: "'AudiType', sans-serif", fontSize: '11px', color: 'var(--accent)', marginTop: '6px' }}>{s.name}</div>
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
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'AudiType', sans-serif", fontSize: '11px', marginBottom: '20px', color: 'var(--red)' }}>
                <X size={22} strokeWidth={2.2} /> The old way
              </span>
              {badRows.map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '13px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)', fontSize: '16px', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--red)', flexShrink: 0, display: 'flex' }}>{row.icon}</span>
                  <span>{row.text}</span>
                </div>
              ))}
            </motion.div>

            {/* Good */}
            <motion.div {...inView(0.08)} style={{
              borderRadius: 'var(--radius)', padding: '30px 30px 32px',
              border: '1px solid var(--accent)',
              background: 'linear-gradient(180deg, var(--accent-dim), var(--surface))',
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'AudiType', sans-serif", fontSize: '11px', marginBottom: '20px', color: 'var(--accent)' }}>
                <Check size={22} strokeWidth={2.2} /> With BRIDGE
              </span>
              {goodRows.map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '13px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)', fontSize: '16px', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--accent)', flexShrink: 0, display: 'flex' }}>{row.icon}</span>
                  <span>{row.text}</span>
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────── */}
      <section style={{ padding: '0 0 110px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 32px' }}>
          <motion.div {...inView(0)} style={{
            position: 'relative', overflow: 'hidden', textAlign: 'center',
            border: '1px solid var(--border)', borderRadius: '0',
            background: 'var(--surface)', padding: '70px 32px',
          }}>
            {/* Grid bg */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: 'linear-gradient(var(--accent-dim) 1px, transparent 1px), linear-gradient(90deg, var(--accent-dim) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              WebkitMaskImage: 'radial-gradient(ellipse 60% 80% at 50% 50%, #000, transparent)',
              maskImage: 'radial-gradient(ellipse 60% 80% at 50% 50%, #000, transparent)',
            }} />
            <div style={{ position: 'relative' }}>
              <h2 style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: 'clamp(28px, 4vw, 46px)', lineHeight: 1.1, color: 'var(--text)' }}>
                Built something good?<br />Show us.
              </h2>
              <p style={{ margin: '16px auto 0', maxWidth: '560px', fontSize: 'clamp(16px, 2.2vw, 20px)', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Five minutes to apply. A real person answers within 48 hours.
              </p>
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '34px' }}>
                <button onClick={handleApplyNow} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '9px',
                  fontFamily: "'AudiType', system-ui", fontWeight: 600, fontSize: '15px',
                  padding: '13px 24px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                  background: 'var(--accent)', color: 'var(--accent-contrast)', transition: 'opacity 0.15s, transform 0.15s',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px', fontFamily: "'AudiType', system-ui", fontWeight: 700, fontSize: '17px', color: 'var(--text)' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '0', background: 'var(--accent)', display: 'grid', placeItems: 'center', color: 'var(--accent-contrast)', fontWeight: 700, fontSize: '17px' }}>B</span>
            BRIDGE
          </div>
          <span style={{ fontFamily: "'AudiType', sans-serif", fontSize: '11px', color: 'var(--text-faint)' }}>
            Audi · Corporate Campus Challenge
          </span>
        </div>
      </footer>

    </motion.div>
  )
}
