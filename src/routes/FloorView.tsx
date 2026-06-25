import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useBridgeStore } from '../store/store'
import PainPointCard from '../components/PainPointCard'
import DemoHint from '../components/DemoHint'

const DEPARTMENTS = ['All', 'Quality', 'Production', 'Logistics', 'R&D', 'Procurement', 'Innovation & Ventures']

export default function FloorView() {
  const { painPoints, addPainPoint, floorWorkerVisibility } = useBridgeStore()
  const [deptFilter, setDeptFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', department: 'Quality', submittedBy: '' })
  const [submitted, setSubmitted] = useState(false)

  const visible = painPoints.filter(pp => floorWorkerVisibility === 'all' || pp.status === 'open')
  const filtered = visible.filter(pp => deptFilter === 'All' || pp.department === deptFilter)

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
      style={{ padding: 'clamp(72px, 12vw, 80px) clamp(16px, 5vw, 40px) 60px', maxWidth: '720px', margin: '0 auto' }}
    >
      <DemoHint persona="You are a floor worker" hint="Report a pain point in seconds — no manager approval needed. See what's already been reported below." />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '24px' }}>
        <span className="kicker">the floor</span>
        <h1 style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 6vw, 36px)', color: 'var(--text)', lineHeight: 1.1 }}>
          Pain Points
        </h1>
        <p style={{ fontFamily: 'AudiType', fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Spot a problem on the line? Report it here.
        </p>

        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
          style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '14px 24px', minHeight: '48px' }}
        >
          <Plus size={16} />
          Report a Pain Point
        </button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden', marginBottom: '24px' }}
          >
            <div style={{ background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', padding: '20px' }}>
              <span className="kicker" style={{ marginBottom: '12px', display: 'block' }}>report pain point</span>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center', padding: '24px 0' }}
                >
                  <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '22px', color: 'var(--accent)' }}>Submitted.</div>
                  <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginTop: '6px' }}>Thanks — your pain point has been logged.</div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>Your name *</label>
                    <input className="input" placeholder="e.g. Anna Richter" value={form.submittedBy} onChange={e => setForm(f => ({ ...f, submittedBy: e.target.value }))} required style={{ fontSize: '16px', padding: '12px 14px' }} />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>Department *</label>
                    <select className="input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} style={{ fontSize: '16px', padding: '12px 14px' }}>
                      {DEPARTMENTS.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>What's the problem? *</label>
                    <input className="input" placeholder="Describe it in one sentence" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required style={{ fontSize: '16px', padding: '12px 14px' }} />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>More detail</label>
                    <textarea className="input" placeholder="What's the impact? Anything you've tried?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: '90px', fontSize: '16px', padding: '12px 14px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', minHeight: '48px' }}>Submit</button>
                    <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} style={{ width: '100%', justifyContent: 'center', padding: '14px', minHeight: '48px' }}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: '16px' }}
      >
        <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '8px' }}>Department</span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {DEPARTMENTS.map(d => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              style={{
                fontFamily: 'AudiType', fontSize: '12px',
                padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid',
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <AnimatePresence>
          {filtered.map((pp, i) => (
            <motion.div
              key={pp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
            >
              <PainPointCard painPoint={pp} />
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-faint)', fontFamily: 'AudiType', fontSize: '12px' }}>
            No pain points match current filters.
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
