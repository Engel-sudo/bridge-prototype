import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Filter } from 'lucide-react'
import { useBridgeStore } from '../store/store'
import PainPointCard from '../components/PainPointCard'
import NetworkViz from '../components/NetworkViz'
import type { PainPointStatus } from '../store/types'

const DEPARTMENTS = ['All', 'Quality', 'Production', 'Logistics', 'R&D', 'Procurement', 'Innovation & Ventures']
const STATUS_FILTERS: { label: string; value: PainPointStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Matched', value: 'matched' },
  { label: 'In Pilot', value: 'in_pilot' },
]

export default function PainPointMap() {
  const { painPoints, addPainPoint } = useBridgeStore()
  const [deptFilter, setDeptFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState<PainPointStatus | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', department: 'Quality', submittedBy: '' })
  const [submitted, setSubmitted] = useState(false)

  const filtered = painPoints.filter(pp => {
    const deptOk = deptFilter === 'All' || pp.department === deptFilter
    const statusOk = statusFilter === 'all' || pp.status === statusFilter
    return deptOk && statusOk
  })

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
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
        <span className="kicker">the map</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 'clamp(24px, 4vw, 42px)', color: 'var(--text)', lineHeight: 1.1 }}>
              Pain Point Map
            </h1>
            <p style={{ fontFamily: 'IBM Plex Sans', fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Any Audi employee can surface a problem. Pilots visible across all silos.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={14} />
            Submit Pain Point
          </button>
        </div>
      </motion.div>


      {/* Network viz */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          marginBottom: '28px',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
            innovation dependency graph
          </span>
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.1em', color: 'var(--lime)' }}>live</span>
        </div>
        <div style={{ height: '260px', position: 'relative' }}>
          <NetworkViz />
        </div>
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
            <div style={{ background: 'var(--surface)', border: '1px solid var(--lime)', borderRadius: 'var(--radius)', padding: '24px' }}>
              <span className="kicker" style={{ marginBottom: '12px', display: 'block' }}>submit pain point</span>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center', padding: '24px 0' }}
                >
                  <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: '24px', color: 'var(--lime)' }}>Submitted.</div>
                  <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', marginTop: '6px', letterSpacing: '0.08em' }}>Pain point added to the map.</div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Your name *</label>
                      <input className="input" placeholder="e.g. Anna Richter" value={form.submittedBy} onChange={e => setForm(f => ({ ...f, submittedBy: e.target.value }))} required />
                    </div>
                    <div>
                      <label style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Department *</label>
                      <select className="input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                        {DEPARTMENTS.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Pain point title *</label>
                    <input className="input" placeholder="Describe the problem in one sentence" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Description</label>
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
        style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={12} color="var(--text-faint)" />
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Filter:</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {DEPARTMENTS.map(d => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              style={{
                fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.08em',
                padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid',
                borderColor: deptFilter === d ? 'var(--lime)' : 'var(--border-strong)',
                background: deptFilter === d ? 'rgba(200,240,0,0.1)' : 'transparent',
                color: deptFilter === d ? 'var(--lime)' : 'var(--text-faint)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {d}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              style={{
                fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.08em',
                padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid',
                borderColor: statusFilter === s.value ? 'var(--lime)' : 'var(--border-strong)',
                background: statusFilter === s.value ? 'rgba(200,240,0,0.1)' : 'transparent',
                color: statusFilter === s.value ? 'var(--lime)' : 'var(--text-faint)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Pain point grid */}
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
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: 'var(--text-faint)', fontFamily: 'IBM Plex Mono', fontSize: '12px', letterSpacing: '0.1em' }}>
            No pain points match current filters.
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
