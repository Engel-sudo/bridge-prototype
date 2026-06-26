import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Layers, Check, ArrowRight, X } from 'lucide-react'
import { useBridgeStore } from '../store/store'
import PainPointCard from '../components/PainPointCard'
import DemoHint from '../components/DemoHint'
import type { PainPointStatus, PainPoint } from '../store/types'
import { ClusterRateLimitError } from '../store/clustering'

const DEPARTMENTS = ['All', 'Quality', 'Production', 'Logistics', 'R&D', 'Procurement', 'Innovation & Ventures']
const STATUS_FILTERS: { label: string; value: PainPointStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Matched', value: 'matched' },
  { label: 'In Pilot', value: 'in_pilot' },
]

const STAGE_LABEL: Record<string, string> = {
  submitted: 'Submitted', named_contact: 'Named Contact', owner_assigned: 'Lead Assigned',
  in_review: 'In Review', signal_sent: 'Signal Sent', decision_go: 'Go',
  matched_pain_owner: 'Matched', path_to_production: 'In Production',
}

export default function PainPointMap() {
  const { painPoints, applications, addPainPoint, clusters, clusterPainPoints, matchResults, matchLoading, computeMatches } = useBridgeStore()

  // Compute matches automatically on mount — no button needed. Signature-gated
  // so navigating back to this page never re-runs the LLM if nothing changed.
  useEffect(() => { void computeMatches() }, [computeMatches])
  const [deptFilter, setDeptFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState<PainPointStatus | 'all'>('all')
  const [themeFilter, setThemeFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', department: 'Quality', submittedBy: '' })
  const [submitted, setSubmitted] = useState(false)
  const [clustering, setClustering] = useState(false)
  const [clusterDone, setClusterDone] = useState<'grouped' | 'unchanged' | null>(null)
  const [clusterError, setClusterError] = useState<string | null>(null)
  const [selectedPP, setSelectedPP] = useState<PainPoint | null>(null)

  const clusterLabel = (id: string | null | undefined) => clusters.find(c => c.id === id)?.label

  // How many later pain points declared this one a duplicate — shown as a count badge
  const duplicateCounts = painPoints.reduce((acc, pp) => {
    if (pp.duplicateOf) acc.set(pp.duplicateOf, (acc.get(pp.duplicateOf) ?? 0) + 1)
    return acc
  }, new Map<string, number>())

  const filtered = painPoints.filter(pp => {
    const deptOk = deptFilter === 'All' || pp.department === deptFilter
    const statusOk = statusFilter === 'all' || pp.status === statusFilter
    const themeOk = themeFilter === 'all' || pp.clusterId === themeFilter
    return deptOk && statusOk && themeOk
  })

  const complaintCount = painPoints.filter(pp => pp.triageStatus === 'complaint').length
  const needsReviewCount = painPoints.filter(pp => pp.triageStatus === 'needs_review').length
  // Resolve store match results for the selected pain point into display objects
  const rawMatches = selectedPP ? (matchResults[selectedPP.id] ?? []) : []
  const matches = rawMatches.map(m => ({
    app: applications.find(a => a.id === m.startupId)!,
    confidence: m.confidence,
    reason: m.reason,
  })).filter(m => m.app != null)

  async function handleCluster() {
    setClusterError(null); setClusterDone(null); setClustering(true)
    try {
      const result = await clusterPainPoints()
      setClusterDone(result)
      setTimeout(() => setClusterDone(null), 2500)
    } catch (e) {
      setClusterError(e instanceof ClusterRateLimitError
        ? 'Groq rate limit reached — wait about a minute and try again.'
        : 'Grouping failed — please try again.')
    } finally { setClustering(false) }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.submittedBy.trim()) return
    addPainPoint({ id: `pp${Date.now()}`, title: form.title, description: form.description, submittedBy: form.submittedBy, department: form.department, status: 'open', linkedApplicationId: null, submittedAt: new Date().toISOString().slice(0, 10) })
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); setShowForm(false); setForm({ title: '', description: '', department: 'Quality', submittedBy: '' }) }, 2000)
  }

  function PainPointGrid({ items }: { items: PainPoint[] }) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
        <AnimatePresence>
          {items.map((pp, i) => (
            <motion.div
              key={pp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              onClick={() => setSelectedPP(prev => prev?.id === pp.id ? null : pp)}
              style={{
                cursor: 'pointer',
                outline: selectedPP?.id === pp.id ? '2px solid var(--accent)' : '2px solid transparent',
                outlineOffset: '-2px',
                transition: 'outline-color 0.15s',
                opacity: pp.duplicateOf ? 0.6 : 1,
              }}
            >
              <PainPointCard
                painPoint={pp}
                showMatch
                clusterLabel={clusterLabel(pp.clusterId)}
                duplicateCount={duplicateCounts.get(pp.id) ?? 0}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: 'var(--text-faint)', fontFamily: 'AudiType', fontSize: '12px' }}>
            No pain points match current filters.
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '80px 40px 60px', maxWidth: '1440px', margin: '0 auto' }}
    >
      <DemoHint persona="You are any Audi employee" hint="Submit a pain point — it appears here instantly. Click a card to see which startups can help." />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
        <span className="kicker">the map</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 4vw, 42px)', color: 'var(--text)', lineHeight: 1.1 }}>
              Pain Point Map
            </h1>
            <p style={{ fontFamily: 'AudiType', fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Any Audi employee can surface a problem. Click a card to see which startups can help.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={handleCluster} disabled={clustering}
              style={{ opacity: clustering ? 0.6 : 1, cursor: clustering ? 'wait' : 'pointer', borderColor: clusterDone ? 'var(--accent)' : undefined, color: clusterDone ? 'var(--accent)' : undefined, transition: 'border-color 0.2s, color 0.2s' }}>
              {clustering ? <motion.span style={{ display: 'inline-flex' }} animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}><Layers size={14} /></motion.span>
                : clusterDone ? <Check size={14} /> : <Layers size={14} />}
              {clustering ? 'Grouping…' : clusterDone === 'grouped' ? 'Grouped' : clusterDone === 'unchanged' ? 'Already grouped' : 'Group by theme'}
            </button>
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              <Plus size={14} /> Submit Pain Point
            </button>
          </div>
        </div>
        {clusterError && <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--red)', marginTop: '8px' }}>{clusterError}</div>}
        {(complaintCount > 0 || needsReviewCount > 0) && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
            {complaintCount > 0 && (
              <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', background: 'var(--amber)', display: 'inline-block' }} />
                {complaintCount} submission{complaintCount > 1 ? 's' : ''} flagged as complaint
              </div>
            )}
            {needsReviewCount > 0 && (
              <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', background: 'var(--text-faint)', display: 'inline-block' }} />
                {needsReviewCount} need{needsReviewCount === 1 ? 's' : ''} review
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Submission form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden', marginBottom: '28px' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--accent)', padding: '24px' }}>
              <span className="kicker" style={{ marginBottom: '12px', display: 'block' }}>submit pain point</span>
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '24px 0' }}>
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
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap' }}>
        <FilterGroup label="Department" items={DEPARTMENTS} active={deptFilter} onSelect={setDeptFilter} />
        <FilterGroup label="Status" items={STATUS_FILTERS.map(s => s.label)}
          active={STATUS_FILTERS.find(s => s.value === statusFilter)?.label ?? 'All'}
          onSelect={label => setStatusFilter(STATUS_FILTERS.find(s => s.label === label)?.value ?? 'all')} />
        {clusters.length > 0 && (
          <FilterGroup label="Theme" items={['All', ...clusters.map(c => c.label)]}
            active={themeFilter === 'all' ? 'All' : clusters.find(c => c.id === themeFilter)?.label ?? 'All'}
            onSelect={label => setThemeFilter(label === 'All' ? 'all' : clusters.find(c => c.label === label)?.id ?? 'all')} />
        )}
      </motion.div>

      {/* Always two-column — right column stays reserved so the grid never reflows */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '32px', alignItems: 'start' }}>

        {/* Pain point grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {clusters.length === 0 ? (
            <PainPointGrid items={filtered} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
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
                    {group.summary && <p style={{ fontFamily: 'AudiType', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{group.summary}</p>}
                  </div>
                  <PainPointGrid items={group.items} />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right panel — column always reserved, content fades in/out */}
        <div style={{ position: 'sticky', top: '80px' }}>
        <AnimatePresence mode="wait">
          {selectedPP && (
            <motion.div
              key="match-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div style={{ border: '1px solid var(--border-strong)' }}>
                {/* Panel header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div>
                    <span className="kicker" style={{ marginBottom: '4px' }}>startups that can help</span>
                    <div style={{ fontFamily: 'AudiType', fontWeight: 600, fontSize: '14px', color: 'var(--text)', lineHeight: 1.35 }}>{selectedPP.title}</div>
                    <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginTop: '3px' }}>{selectedPP.department}</div>
                  </div>
                  <button onClick={() => setSelectedPP(null)} aria-label="Close" style={{ background: 'transparent', border: '1px solid var(--border-strong)', cursor: 'pointer', color: 'var(--text-faint)', padding: '5px', display: 'flex', flexShrink: 0 }}>
                    <X size={13} />
                  </button>
                </div>

                {/* Match list */}
                {matches.length === 0 ? (
                  <div style={{ padding: '36px 20px', textAlign: 'center', fontFamily: 'AudiType', fontSize: '12px', color: 'var(--text-faint)', lineHeight: 1.7 }}>
                    No startups matched for this pain point yet.
                  </div>
                ) : (
                  <div>
                    {matchLoading && matches.length === 0 && (
                      <div style={{ padding: '20px', fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', textAlign: 'center' }}>
                        Computing matches…
                      </div>
                    )}
                    {matches.map(({ app, confidence, reason }, i) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        style={{
                          padding: '18px 20px',
                          borderBottom: i < matches.length - 1 ? '1px solid var(--border)' : 'none',
                          borderLeft: confidence === 'high' ? '3px solid var(--accent)' : '3px solid transparent',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>{app.companyName}</span>
                          <span style={{ fontFamily: 'AudiType', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', flexShrink: 0, color: confidence === 'high' ? 'var(--accent)' : 'var(--text-faint)' }}>
                            {confidence === 'high' ? 'HIGH' : 'MEDIUM'}
                          </span>
                        </div>
                        <p style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', lineHeight: 1.5, margin: '0 0 6px', fontStyle: 'italic' }}>
                          {reason}
                        </p>
                        <p style={{ fontFamily: 'AudiType', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 12px' }}>
                          {app.technology}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'AudiType', fontSize: '10px', color: 'var(--text-faint)', background: 'var(--surface-2)', padding: '2px 7px' }}>
                              {STAGE_LABEL[app.stage] ?? app.stage}
                            </span>
                            <span style={{ fontFamily: 'AudiType', fontSize: '10px', color: 'var(--text-faint)' }}>{app.funding}</span>
                          </div>
                          <button className="btn-secondary" style={{ padding: '5px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                            Contact <ArrowRight size={10} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

function FilterGroup({ label, items, active, onSelect }: { label: string; items: string[]; active: string; onSelect: (v: string) => void }) {
  return (
    <div>
      <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '8px' }}>{label}</span>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {items.map(item => (
          <button key={item} onClick={() => onSelect(item)} style={{ fontFamily: 'AudiType', fontSize: '11px', padding: '5px 10px', border: '1px solid', borderColor: active === item ? 'var(--accent)' : 'var(--border-strong)', background: active === item ? 'var(--accent-dim)' : 'transparent', color: active === item ? 'var(--accent)' : 'var(--text-faint)', cursor: 'pointer', transition: 'all 0.15s' }}>
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}
