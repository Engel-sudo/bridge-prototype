import { useState } from 'react'
import { motion } from 'framer-motion'
import { useBridgeStore } from '../store/store'
import DemoHint from '../components/DemoHint'

const DEPARTMENTS = ['Quality', 'Production', 'Logistics', 'R&D', 'Procurement', 'Innovation & Ventures']

export default function FloorView() {
  const addPainPoint = useBridgeStore(s => s.addPainPoint)
  const [form, setForm] = useState({ title: '', description: '', department: 'Quality', submittedBy: '' })
  const [submitted, setSubmitted] = useState(false)

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
      setForm({ title: '', description: '', department: 'Quality', submittedBy: '' })
    }, 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ padding: 'clamp(72px, 12vw, 80px) clamp(16px, 5vw, 40px) 60px', maxWidth: '560px', margin: '0 auto' }}
    >
      <DemoHint persona="You are a floor worker" hint="Report a pain point in seconds — no manager approval needed." />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '24px' }}>
        <span className="kicker">the floor</span>
        <h1 style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 6vw, 36px)', color: 'var(--text)', lineHeight: 1.1 }}>
          Report a Pain Point
        </h1>
        <p style={{ fontFamily: 'AudiType', fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Spot a problem on the line? Tell us about it below.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div style={{ background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', padding: '20px' }}>
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
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>What's the problem? *</label>
                <input className="input" placeholder="Describe it in one sentence" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required style={{ fontSize: '16px', padding: '12px 14px' }} />
              </div>
              <div>
                <label style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>Give us more detail</label>
                <textarea className="input" placeholder="What's the impact? Anything you've already tried?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: '90px', fontSize: '16px', padding: '12px 14px' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', minHeight: '48px' }}>Submit</button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
