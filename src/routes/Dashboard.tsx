import { motion } from 'framer-motion'
import { useBridgeStore } from '../store/store'
import MetricStat from '../components/MetricStat'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

// Inline "chrome" wrapper matching thefifthring panel style
function Chrome({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'inline-block' }} />
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'inline-block' }} />
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'inline-block' }} />
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', marginLeft: '8px' }}>{title}</span>
        </div>
        {badge && <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lime)' }}>{badge}</span>}
      </div>
      {children}
    </div>
  )
}

function AreaChart() {
  const gridLines = [0, 1, 2, 3]
  return (
    <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
      <svg viewBox="0 0 800 180" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="db-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--lime)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--lime)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridLines.map(i => (
          <line key={i} x1="0" x2="800" y1={30 + i * 38} y2={30 + i * 38} stroke="var(--border)" strokeWidth="1" />
        ))}
        <path
          d="M0 148 L60 138 L120 128 L180 133 L240 108 L300 103 L360 86 L420 93 L480 68 L540 63 L600 46 L660 41 L720 34 L800 28 L800 180 L0 180 Z"
          fill="url(#db-area)"
        />
        <path
          d="M0 148 L60 138 L120 128 L180 133 L240 108 L300 103 L360 86 L420 93 L480 68 L540 63 L600 46 L660 41 L720 34 L800 28"
          stroke="var(--lime)" strokeWidth="1.75" fill="none"
        />
      </svg>
      <div style={{ position: 'absolute', top: '10px', left: '12px', fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
        Pilots → production · trailing 12w
      </div>
      {/* Y-axis labels */}
      <div style={{ position: 'absolute', right: '12px', top: '24px', display: 'flex', flexDirection: 'column', gap: '29px' }}>
        {['8', '6', '4', '2'].map(v => (
          <span key={v} style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)' }}>{v}</span>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { metrics, applications, painPoints } = useBridgeStore()

  const stageCount = (stage: string) => applications.filter(a => a.stage === stage).length

  const navItems = [
    { label: 'Inbox', badge: '5', active: false },
    { label: 'Pilots', badge: `${metrics.activePilots}`, active: false },
    { label: 'Map', badge: null, active: true },
    { label: 'Pain Points', badge: `${painPoints.length}`, active: false },
    { label: 'Startups', badge: `${applications.length}`, active: false },
    { label: 'Owners', badge: '4', active: false },
  ]

  const deps = [
    { label: 'R&D ↔ Production', pct: 86 },
    { label: 'Procurement ↔ Legal', pct: 74 },
    { label: 'IT ↔ R&D', pct: 58 },
    { label: 'QA ↔ Production', pct: 49 },
  ]

  const painFeed = [
    { dept: 'Production', text: 'Torque telemetry drift flagged — line 7', tag: 'new' },
    { dept: 'R&D', text: 'Cell aging overlap with Pilot 14 detected', tag: 'overlap' },
    { dept: 'Procurement', text: 'Supplier ETA opacity · 9 mentions', tag: 'cluster' },
    { dept: 'Legal', text: 'NDA cycle >18d on 4 active pilots', tag: 'risk' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '80px 40px 60px', maxWidth: '1200px', margin: '0 auto' }}
    >
      {/* Header */}
      <motion.div {...fadeUp} style={{ marginBottom: '48px' }}>
        <span className="kicker">system overview</span>
        <h1 style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 48px)', color: 'var(--text)', lineHeight: 1.1, maxWidth: '700px' }}>
          Dashboard
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans', fontSize: '15px', color: 'var(--text-muted)', marginTop: '10px', maxWidth: '560px' }}>
          Audi doesn't need more startups. It needs a system that doesn't lose them.
        </p>
        <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-faint)', marginTop: '6px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Activity exists. Shared intelligence does not.
        </p>
      </motion.div>

      {/* Metric reframe */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px 32px', marginBottom: '32px' }}
      >
        <span className="kicker">metric reframe</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '24px', alignItems: 'center', marginTop: '16px' }}>
          <div style={{ padding: '20px', background: 'rgba(255,45,70,0.06)', border: '1px solid var(--red-dim)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--red)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>Before Bridge</div>
            <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '18px', color: 'var(--red)', lineHeight: 1.2, marginBottom: '10px' }}>Startup requests + connections</div>
            <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-faint)', lineHeight: 1.5 }}>Audi measures how many startups it talks to. Not whether anything gets built.</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.1em' }}>BRIDGE</div>
            <div style={{ fontSize: '24px', color: 'var(--lime)' }}>→</div>
          </div>
          <div style={{ padding: '20px', background: 'rgba(200,240,0,0.06)', border: '1px solid rgba(200,240,0,0.25)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--lime)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>After Bridge</div>
            <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '18px', color: 'var(--lime)', lineHeight: 1.2, marginBottom: '10px' }}>Implementations: idea to car</div>
            <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>BRIDGE measures how many startups actually reach production.</div>
            <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: '28px', color: 'var(--lime)', lineHeight: 1 }}>{metrics.implementationsThisQuarter}</span>
              <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '3px' }}>implementations this quarter</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '32px' }}
      >
        {[
          { kicker: 'active pilots', value: metrics.activePilots, accent: 'lime' as const, caption: 'across all departments' },
          { kicker: 'implementations', value: metrics.implementations, accent: 'lime' as const, caption: 'idea to car, total' },
          { kicker: 'avg time to signal', value: `${metrics.avgTimeToSignal}d`, accent: 'lime' as const, caption: `target: ${metrics.targetTimeToSignal} days` },
          { kicker: 'pain points open', value: metrics.painPointsOpen, accent: 'amber' as const, caption: `${metrics.painPointsMatched} matched` },
          { kicker: 'total pain points', value: painPoints.length, accent: 'muted' as const, caption: 'submitted by employees' },
        ].map(stat => (
          <div key={stat.kicker} style={{ background: 'var(--surface)', padding: '24px 20px' }}>
            <MetricStat {...stat} size="md" />
          </div>
        ))}
      </motion.div>

      {/* Command center panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        style={{ marginBottom: '32px' }}
      >
        <Chrome title="bridge / map · innovation intelligence" badge="● live">
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr' }}>

            {/* Sidebar nav */}
            <div style={{ borderRight: '1px solid var(--border)', padding: '20px 16px' }}>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '6px' }}>Workspace</div>
              <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '15px', color: 'var(--text)', marginBottom: '20px' }}>Audi · Ingolstadt</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {navItems.map(item => (
                  <div key={item.label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 10px', borderRadius: 'var(--radius-sm)',
                    background: item.active ? 'var(--surface-2)' : 'transparent',
                    border: item.active ? '1px solid var(--border-strong)' : '1px solid transparent',
                  }}>
                    <span style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: item.active ? 'var(--text)' : 'var(--text-muted)' }}>{item.label}</span>
                    {item.badge && (
                      <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: item.active ? 'var(--lime)' : 'var(--text-faint)' }}>{item.badge}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Main area */}
            <div style={{ padding: '20px' }}>
              {/* Sub-header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Map / overview</div>
                  <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '20px', color: 'var(--text)', marginTop: '2px' }}>Innovation visibility · Q2</div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['Week', 'Month', 'Quarter', 'Year'].map((t, i) => (
                    <button key={t} style={{
                      padding: '5px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase',
                      background: i === 2 ? 'var(--lime)' : 'transparent',
                      color: i === 2 ? '#0A0B0D' : 'var(--text-faint)',
                      border: i === 2 ? 'none' : '1px solid var(--border-strong)',
                    }}>{t}</button>
                  ))}
                </div>
              </div>

              {/* Mini KPI strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '16px' }}>
                {[
                  { k: 'Pilots active', v: `${metrics.activePilots}`, d: '+4' },
                  { k: 'Owners', v: '4', d: '+1' },
                  { k: 'Pain points', v: `${painPoints.length}`, d: '+3' },
                  { k: 'To production', v: `${metrics.implementations}`, d: '+1' },
                ].map(s => (
                  <div key={s.k} style={{ background: 'var(--bg)', padding: '14px 16px' }}>
                    <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{s.k}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: '28px', color: 'var(--text)', lineHeight: 1 }}>{s.v}</span>
                      <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--lime)' }}>{s.d}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Area chart */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '16px' }}>
                <AreaChart />
              </div>

              {/* Pain feed + dependency bars */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Live pain feed */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
                  <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '12px' }}>
                    Live pain feed
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {painFeed.map(item => (
                      <div key={item.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lime)', flexShrink: 0, marginTop: '4px' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '12px', color: 'var(--text)', lineHeight: 1.4 }}>{item.text}</div>
                          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', marginTop: '2px' }}>{item.dept}</div>
                        </div>
                        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--lime)', flexShrink: 0 }}>{item.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cross-dept dependencies */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
                  <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '12px' }}>
                    Cross-dept dependencies
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {deps.map(dep => (
                      <div key={dep.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontFamily: 'IBM Plex Sans', fontSize: '12px', color: 'var(--text-muted)' }}>{dep.label}</span>
                          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)' }}>{dep.pct}%</span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--surface-2)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${dep.pct}%`, background: 'var(--lime)', borderRadius: '2px' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Stage breakdown mini */}
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '10px' }}>Applications by stage</div>
                    {[
                      { label: 'Named Contact', stage: 'named_contact', color: 'var(--blue)' },
                      { label: 'In Review', stage: 'in_review', color: 'var(--amber)' },
                      { label: 'Decision: Go', stage: 'decision_go', color: 'var(--lime)' },
                      { label: 'Redirected', stage: 'decision_redirect', color: 'var(--red)' },
                    ].map(({ label, stage, color }) => {
                      const count = stageCount(stage)
                      return (
                        <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '1px', background: color, flexShrink: 0 }} />
                          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', flex: 1, letterSpacing: '0.04em' }}>{label}</span>
                          <span style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '13px', color: count > 0 ? 'var(--text)' : 'var(--text-faint)' }}>{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Chrome>
      </motion.div>

      {/* Three pillars proof */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}
      >
        {[
          { pillar: '01 · The Door', stat: '48h', caption: 'named contact guarantee', description: 'Every founder gets a name, not a form. Signal within 2 weeks.', color: 'var(--blue)' },
          { pillar: '02 · The Owner', stat: metrics.implementationsThisQuarter.toString(), caption: 'implementations this quarter', description: 'One named Audi employee owns each startup end-to-end. KPI is implementation.', color: 'var(--lime)' },
          { pillar: '03 · The Map', stat: painPoints.length.toString(), caption: 'pain points submitted', description: 'Any employee can surface a problem. Pilots visible across all silos.', color: 'var(--amber)' },
        ].map(item => (
          <div key={item.pillar} style={{ background: 'var(--surface)', padding: '24px 20px' }}>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: item.color, marginBottom: '8px' }}>{item.pillar}</div>
            <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: '36px', color: item.color, lineHeight: 1, marginBottom: '4px' }}>{item.stat}</div>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.08em', marginBottom: '10px' }}>{item.caption}</div>
            <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.description}</div>
          </div>
        ))}
      </motion.div>

      {/* BMW benchmark */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', marginTop: '24px' }}
      >
        <span className="kicker">the benchmark</span>
        <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
          Audi is ranked #8 globally by brand value. Top-tier founders are bypassing it for BMW, which gives a supplier number in week six.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '480px' }}>
          {[
            { label: 'BMW Startup Garage', sub: 'founded 2015', stat: '32', caption: 'completed projects in 2022' },
            { label: 'Audi A4nXT', sub: 'founded 2020', stat: '~3', caption: 'public wins in 4 years' },
          ].map(({ label, sub, stat, caption }) => (
            <div key={label} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.06em' }}>{sub}</div>
              <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: '28px', color: 'var(--text)', lineHeight: 1, marginTop: '6px' }}>{stat}</div>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.06em', marginTop: '2px' }}>{caption}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
