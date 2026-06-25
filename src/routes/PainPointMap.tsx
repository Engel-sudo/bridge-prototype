import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Layers, Check } from 'lucide-react'
import { useBridgeStore } from '../store/store'
import PainPointCard from '../components/PainPointCard'
import DemoHint from '../components/DemoHint'
import type { PainPointStatus } from '../store/types'
import { ClusterRateLimitError } from '../store/clustering'

const DEPARTMENTS = ['All', 'Quality', 'Production', 'Logistics', 'R&D', 'Procurement', 'Innovation & Ventures']
const STATUS_FILTERS: { label: string; value: PainPointStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Matched', value: 'matched' },
  { label: 'In Pilot', value: 'in_pilot' },
]

export default function PainPointMap() {
  const { painPoints, addPainPoint, clusters, clusterPainPoints } = useBridgeStore()
  const [deptFilter, setDeptFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState<PainPointStatus | 'all'>('all')
  const [themeFilter, setThemeFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', department: 'Quality', submittedBy: '' })
  const [submitted, setSubmitted] = useState(false)
  const [clustering, setClustering] = useState(false)
  // Drives the button's own confirmation state — pressing it must visibly
  // resolve to something even when the idempotency gate skips the LLM call,
  // otherwise a repeat press looks like the button did nothing.
  const [clusterDone, setClusterDone] = useState<'grouped' | 'unchanged' | null>(null)
  const [clusterError, setClusterError] = useState<string | null>(null)

  const clusterLabel = (id: string | null | undefined) =>
    clusters.find(c => c.id === id)?.label

  const filtered = painPoints.filter(pp => {
    const deptOk = deptFilter === 'All' || pp.department === deptFilter
    const statusOk = statusFilter === 'all' || pp.status === statusFilter
    const themeOk = themeFilter === 'all' || pp.clusterId === themeFilter
    return deptOk && statusOk && themeOk
  })

  async function handleCluster() {
    setClusterError(null)
    setClusterDone(null)
    setClustering(true)
    try {
      const result = await clusterPainPoints()
      setClusterDone(result)
      setTimeout(() => setClusterDone(null), 2500)
    } catch (e) {
      if (e instanceof ClusterRateLimitError) {
        setClusterError('Groq rate limit reached — this is a usage limit, not an error. Wait about a minute and try again.')
      } else {
        setClusterError('Grouping failed — please try again.')
      }
    } finally {
      setClustering(false)
    }
  }

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
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setShowForm(false)
      setForm({ title: '', description: '', department: 'Quality', submittedBy: '' })
    }, 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '80px 40px 60px', maxWidth: '1200px', margin: '0 auto' }}
    >
      <DemoHint persona="You are any Audi employee" hint="Submit a pain point — it appears here instantly and on the Dashboard live feed. No manager approval needed." />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
        <span className="kicker">the map</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 4vw, 42px)', color: 'var(--text)', lineHeight: 1.1 }}>
              Pain Point Map
            </h1>
            <p style={{ fontFamily: 'AudiType', fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Any Audi employee can surface a problem. Pilots visible across all silos.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn-secondary"
              onClick={handleCluster}
              disabled={clustering}
              style={{
                opacity: clustering ? 0.6 : 1,
                cursor: clustering ? 'wait' : 'pointer',
                borderColor: clusterDone ? 'var(--accent)' : undefined,
                color: clusterDone ? 'var(--accent)' : undefined,
                transition: 'border-color 0.2s, color 0.2s',
              }}
            >
              {clustering ? (
                <motion.span style={{ display: 'inline-flex' }} animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}>
                  <Layers size={14} />
                </motion.span>
              ) : clusterDone ? (
                <Check size={14} />
              ) : (
                <Layers size={14} />
              )}
              {clustering
                ? 'Grouping…'
                : clusterDone === 'grouped'
                  ? 'Grouped'
                  : clusterDone === 'unchanged'
                    ? 'Already grouped'
                    : 'Group by theme'}
            </button>
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              <Plus size={14} />
              Submit Pain Point
            </button>
          </div>
        </div>
        {clusterError && (
          <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--red)', marginTop: '8px' }}>{clusterError}</div>
        )}
      </motion.div>


      {/* Submission form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden', marginBottom: '28px' }}
          >
            <div style={{ background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', padding: '24px' }}>
              <span className="kicker" style={{ marginBottom: '12px', display: 'block' }}>submit pain point</span>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center', padding: '24px 0' }}
                >
                  <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '24px', color: 'var(--accent)' }}>Submitted.</div>
                  <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginTop: '6px' }}>Pain point added to the map.</div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>Your name *</label>
                      <input className="input" placeholder="e.g. Anna Richter" value={form.submittedBy} onChange={e => setForm(f => ({ ...f, submittedBy: e.target.value }))} required />
                    </div>
                    <div>
                      <label style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>Department *</label>
                      <select className="input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                        {DEPARTMENTS.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>Pain point title *</label>
                    <input className="input" placeholder="Describe the problem in one sentence" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>Description</label>
                    <textarea className="input" placeholder="What's the impact? What have you tried?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: '80px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                    <button type="submit" className="btn-primary">Submit to Map</button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap' }}
      >
        <div>
          <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '8px' }}>Department</span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {DEPARTMENTS.map(d => (
              <button
                key={d}
                onClick={() => setDeptFilter(d)}
                style={{
                  fontFamily: 'AudiType', fontSize: '11px',
                  padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid',
                  borderColor: deptFilter === d ? 'var(--accent)' : 'var(--border-strong)',
                  background: deptFilter === d ? 'var(--accent-dim)' : 'transparent',
                  color: deptFilter === d ? 'var(--accent)' : 'var(--text-faint)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '8px' }}>Status</span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map(s => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                style={{
                  fontFamily: 'AudiType', fontSize: '11px',
                  padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid',
                  borderColor: statusFilter === s.value ? 'var(--accent)' : 'var(--border-strong)',
                  background: statusFilter === s.value ? 'var(--accent-dim)' : 'transparent',
                  color: statusFilter === s.value ? 'var(--accent)' : 'var(--text-faint)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        {clusters.length > 0 && (
          <div>
            <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '8px' }}>Theme</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[{ id: 'all', label: 'All' }, ...clusters].map(c => (
                <button
                  key={c.id}
                  onClick={() => setThemeFilter(c.id)}
                  style={{
                    fontFamily: 'AudiType', fontSize: '11px',
                    padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid',
                    borderColor: themeFilter === c.id ? 'var(--accent)' : 'var(--border-strong)',
                    background: themeFilter === c.id ? 'var(--accent-dim)' : 'transparent',
                    color: themeFilter === c.id ? 'var(--accent)' : 'var(--text-faint)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Pain point grid — flat until grouped, then sectioned by theme */}
      {clusters.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}
        >
          <AnimatePresence>
            {filtered.map((pp, i) => (
              <motion.div
                key={pp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
              >
                <PainPointCard painPoint={pp} showMatch />
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: 'var(--text-faint)', fontFamily: 'AudiType', fontSize: '12px' }}>
              No pain points match current filters.
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {[
            ...clusters.map(c => ({ key: c.id, label: c.label, summary: c.summary, items: filtered.filter(pp => pp.clusterId === c.id) })),
            { key: '_unthemed', label: 'Unthemed', summary: 'Not yet grouped into a theme.', items: filtered.filter(pp => !pp.clusterId) },
          ].filter(g => g.items.length > 0).map(group => (
            <div key={group.key}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <h3 style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: '16px', color: 'var(--text)' }}>{group.label}</h3>
                  <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>{group.items.length}</span>
                </div>
                {group.summary && (
                  <p style={{ fontFamily: 'AudiType', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{group.summary}</p>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
                {group.items.map(pp => (
                  <PainPointCard key={pp.id} painPoint={pp} showMatch clusterLabel={clusterLabel(pp.clusterId)} />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
