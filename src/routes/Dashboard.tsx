import { motion } from 'framer-motion'
import { useBridgeStore } from '../store/store'
import MetricStat from '../components/MetricStat'
import PipelineFunnel from '../components/PipelineFunnel'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

export default function Dashboard() {
  const { metrics, applications, painPoints } = useBridgeStore()

  const stageCount = (stage: string) => applications.filter(a => a.stage === stage).length

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

      {/* Metric reframe — THE key message */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '28px 32px',
          marginBottom: '32px',
        }}
      >
        <span className="kicker">metric reframe</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '24px', alignItems: 'center', marginTop: '16px' }}>
          {/* Old metric */}
          <div style={{
            padding: '20px',
            background: 'rgba(255,45,70,0.06)',
            border: '1px solid var(--red-dim)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--red)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Before Bridge
            </div>
            <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '18px', color: 'var(--red)', lineHeight: 1.2, marginBottom: '10px' }}>
              Startup requests + connections
            </div>
            <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-faint)', lineHeight: 1.5 }}>
              Audi measures how many startups it talks to. Not whether anything gets built.
            </div>
          </div>

          {/* Arrow */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.1em' }}>BRIDGE</div>
            <div style={{ fontSize: '24px', color: 'var(--lime)' }}>→</div>
          </div>

          {/* New metric */}
          <div style={{
            padding: '20px',
            background: 'rgba(200,240,0,0.06)',
            border: '1px solid rgba(200,240,0,0.25)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--lime)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
              After Bridge
            </div>
            <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '18px', color: 'var(--lime)', lineHeight: 1.2, marginBottom: '10px' }}>
              Implementations: idea to car
            </div>
            <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
              BRIDGE measures how many startups actually reach production.
            </div>
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
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1px',
          background: 'var(--border)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          marginBottom: '32px',
        }}
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

      {/* Two-column: pipeline + applications */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Pipeline funnel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="card"
          style={{ padding: '24px' }}
        >
          <span className="kicker">pipeline funnel</span>
          <h3 style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '16px', color: 'var(--text)', marginBottom: '20px' }}>
            Interest → Idea to Car
          </h3>
          <PipelineFunnel />
        </motion.div>

        {/* Stage breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="card"
          style={{ padding: '24px' }}
        >
          <span className="kicker">stage breakdown</span>
          <h3 style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '16px', color: 'var(--text)', marginBottom: '20px' }}>
            Current Applications
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Submitted / Named Contact', stage: 'named_contact', color: 'var(--blue)' },
              { label: 'Owner Assigned', stage: 'owner_assigned', color: 'var(--lime)' },
              { label: 'In Review', stage: 'in_review', color: 'var(--amber)' },
              { label: 'Decision: Go', stage: 'decision_go', color: 'var(--lime)' },
              { label: 'Decision: Redirect', stage: 'decision_redirect', color: 'var(--red)' },
            ].map(({ label, stage, color }) => {
              const count = stageCount(stage)
              return (
                <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', flex: 1, letterSpacing: '0.06em' }}>{label}</span>
                  <span style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '16px', color: count > 0 ? 'var(--text)' : 'var(--text-faint)' }}>{count}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Three pillars proof */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'var(--border)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}
      >
        {[
          {
            pillar: '01 · The Door',
            title: 'Structured entry',
            stat: '48h',
            caption: 'named contact guarantee',
            description: 'Every founder gets a name, not a form. Signal within 2 weeks.',
            color: 'var(--blue)',
          },
          {
            pillar: '02 · The Owner',
            title: 'Accountable champion',
            stat: metrics.implementationsThisQuarter.toString(),
            caption: 'implementations this quarter',
            description: 'One named Audi employee owns each startup end-to-end. KPI is implementation.',
            color: 'var(--lime)',
          },
          {
            pillar: '03 · The Map',
            title: 'Pain-point intelligence',
            stat: painPoints.length.toString(),
            caption: 'pain points submitted',
            description: 'Any employee can surface a problem. Pilots visible across all silos.',
            color: 'var(--amber)',
          },
        ].map(item => (
          <div key={item.pillar} style={{ background: 'var(--surface)', padding: '24px 20px' }}>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: item.color, marginBottom: '8px' }}>
              {item.pillar}
            </div>
            <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: '36px', color: item.color, lineHeight: 1, marginBottom: '4px' }}>
              {item.stat}
            </div>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.08em', marginBottom: '10px' }}>
              {item.caption}
            </div>
            <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {item.description}
            </div>
          </div>
        ))}
      </motion.div>

      {/* BMW comparison + feasibility argument */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          background: 'var(--border)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          marginTop: '24px',
        }}
      >
        <div style={{ background: 'var(--surface)', padding: '24px', gridColumn: '1 / -1' }}>
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
        </div>
      </motion.div>
    </motion.div>
  )
}
