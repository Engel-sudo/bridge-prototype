import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, User, Map, ChevronRight } from 'lucide-react'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
})

const pillars = [
  {
    num: '01',
    id: 'THE DOOR',
    title: 'A structured entry path',
    body: 'Every founder gets a named contact within 48 hours and a yes or no signal within 2 weeks. No ambiguity, no black holes.',
    icon: <Clock size={18} color="var(--blue)" />,
    color: 'var(--blue)',
    route: '/apply',
    cta: 'Apply now',
  },
  {
    num: '02',
    id: 'THE OWNER',
    title: 'One accountable person',
    body: 'One named Audi employee owns a startup end-to-end. Their KPI is implementation: idea to car. Not connections made.',
    icon: <User size={18} color="var(--lime)" />,
    color: 'var(--lime)',
    route: '/owner',
    cta: 'Owner console',
  },
  {
    num: '03',
    id: 'THE MAP',
    title: 'Pain-point intelligence',
    body: 'Any Audi employee can surface a problem. All pilots visible in one place across all departments. No more silo discoveries.',
    icon: <Map size={18} color="var(--amber)" />,
    color: 'var(--amber)',
    route: '/map',
    cta: 'See the map',
  },
]

export default function Landing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ minHeight: '100vh' }}
    >
      {/* Hero */}
      <section style={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '100px 40px 60px',
        maxWidth: '1200px',
        margin: '0 auto',
        overflow: 'hidden',
      }}>
        {/* Grid bg */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(200,240,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,240,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: '780px' }}>
          <motion.div {...fadeUp(0.05)}>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--lime)', display: 'block', marginBottom: '20px' }}>
              Audi · Corporate Campus Challenge 7 · BRIDGE
            </span>
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 'clamp(36px, 6vw, 80px)', lineHeight: 1.05, color: 'var(--text)', marginBottom: '24px' }}>
            Audi doesn't need more startups.
            <br />
            <span style={{ color: 'var(--lime)' }}>It needs a system</span>
            <br />
            that doesn't lose them.
          </motion.h1>

          <motion.p {...fadeUp(0.18)} style={{ fontFamily: 'IBM Plex Sans', fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: '580px', marginBottom: '12px' }}>
            27 active pilots. No shared system to convert them into cars. BRIDGE changes that with three simple structures: a Door, an Owner, and a Map.
          </motion.p>

          <motion.p {...fadeUp(0.21)} style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: 'var(--text-faint)', letterSpacing: '0.08em', maxWidth: '480px', marginBottom: '36px', lineHeight: 1.5 }}>
            The door was never designed for him to walk through.
          </motion.p>

          <motion.div {...fadeUp(0.24)} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/apply" className="btn-primary" style={{ fontSize: '15px', padding: '12px 24px' }}>
              Apply to BRIDGE
              <ArrowRight size={16} />
            </Link>
            <Link to="/dashboard" className="btn-secondary" style={{ fontSize: '15px', padding: '12px 24px' }}>
              System overview
              <ChevronRight size={16} />
            </Link>
          </motion.div>
        </div>

        {/* Promise bar */}
        <motion.div
          {...fadeUp(0.3)}
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            display: 'flex',
            gap: '1px',
            background: 'var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
          }}
        >
          {[
            { label: '48h', caption: 'named contact', color: 'var(--lime)' },
            { label: '2 wks', caption: 'yes or no', color: 'var(--lime)' },
            { label: '27', caption: 'active pilots', color: 'var(--text)' },
          ].map(({ label, caption, color }) => (
            <div key={label} style={{ background: 'var(--surface)', padding: '14px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: '24px', color, lineHeight: 1 }}>{label}</div>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', marginTop: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{caption}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Three pillars */}
      <section style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '48px' }}
        >
          <span className="kicker">how it works</span>
          <h2 style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 'clamp(24px, 3.5vw, 40px)', color: 'var(--text)', lineHeight: 1.15 }}>
            Three structures. One system.
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {pillars.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="card"
              style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: p.color, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    {p.num} · {p.id}
                  </span>
                  <h3 style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '18px', color: 'var(--text)', lineHeight: 1.3 }}>
                    {p.title}
                  </h3>
                </div>
                <div style={{
                  width: '36px', height: '36px',
                  background: `${p.color}14`,
                  border: `1px solid ${p.color}30`,
                  borderRadius: '6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {p.icon}
                </div>
              </div>
              <p style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, flex: 1 }}>
                {p.body}
              </p>
              <Link to={p.route} style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontFamily: 'IBM Plex Mono', fontSize: '10px', color: p.color,
                letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none',
              }}>
                {p.cta} <ChevronRight size={12} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

    </motion.div>
  )
}
