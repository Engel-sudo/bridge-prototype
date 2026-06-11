import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Clock, Zap, ChevronRight, X } from 'lucide-react'
import { useBridgeStore } from '../store/store'
import DemoHint from '../components/DemoHint'
import type { Application } from '../store/types'
import { getPipelineDepthSeries, getSparklineSeries, getDeptBarData } from '../store/derive'

// ── Helpers ────────────────────────────────────────────────────────────────
const isOverdue = (a: Application) =>
  a.daysInProcess > 14 &&
  !['decision_go', 'decision_redirect', 'matched_pain_owner', 'path_to_production'].includes(a.stage)

// ── Sparkline ──────────────────────────────────────────────────────────────
function Sparkline({ data, color = 'var(--accent)' }: { data: number[]; color?: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 56},${18 - ((v - min) / range) * 16}`)
    .join(' ')
  const ptArr = pts.split(' ')
  const last = ptArr[ptArr.length - 1]?.split(',') ?? ['56', '2']
  return (
    <svg width="60" height="22" viewBox="0 0 60 22" style={{ display: 'block', flexShrink: 0 }}>
      <polyline points={pts} stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  )
}

// ── Area chart ─────────────────────────────────────────────────────────────
function AreaChart({ data }: { data: number[] }) {
  const maxVal = Math.max(...data, 1)
  const ys = data.map(v => Math.round(180 - (v / maxVal) * 152))
  const linePath = ys.map((y, i) => `${i === 0 ? 'M' : 'L'} ${(i / (ys.length - 1)) * 800} ${y}`).join(' ')
  const areaPath = linePath + ` L 800 180 L 0 180 Z`
  return (
    <div style={{ padding: '14px 16px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>
          Pipeline depth · applications active per week
        </span>
      </div>
      <div style={{ position: 'relative', height: '88px' }}>
        <svg viewBox="0 0 800 180" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="ag" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--accent)' }} stopOpacity="0.14" />
              <stop offset="100%" style={{ stopColor: 'var(--accent)' }} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[60, 120].map(y => <line key={y} x1="0" x2="800" y1={y} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 8" />)}
          <path d={areaPath} fill="url(#ag)" />
          <path d={linePath} stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinejoin="round" />
          <circle cx="800" cy="28" r="4" fill="var(--accent)" />
        </svg>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        {['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'].map((w, i) => (
          <span key={w} style={{ fontFamily: 'AudiType', fontSize: '11px', color: i === 11 ? 'var(--accent)' : 'var(--text-faint)' }}>
            {i % 2 === 0 ? w : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Chrome panel ───────────────────────────────────────────────────────────
function Chrome({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', flexShrink: 0 }}>
        <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>{title}</span>
        {badge && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--accent)' }}>{badge}</span>
          </div>
        )}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { metrics, applications, painPoints, owners } = useBridgeStore()
  const [selectedKpi, setSelectedKpi] = useState<string | null>(null)

  const stageCount = (s: string) => applications.filter(a => a.stage === s).length
  const unassigned  = applications.filter(a => a.ownerId === null)
  const overdue     = applications.filter(isOverdue)
  const openPP      = painPoints.filter(pp => pp.status === 'open')
  const matchedCount = painPoints.filter(pp => pp.status === 'matched').length

  const decidedApps = applications.filter(a =>
    ['decision_go', 'decision_redirect', 'path_to_production'].includes(a.stage)
  )
  const avgSignal = decidedApps.length
    ? Math.round(decidedApps.reduce((s, a) => s + a.daysInProcess, 0) / decidedApps.length)
    : metrics.avgTimeToSignal

  const tagStyle: Record<string, { color: string; bg: string }> = {
    new:        { color: 'var(--accent)',  bg: 'var(--accent-dim)'  },
    matched:    { color: 'var(--blue)',  bg: 'rgba(59,130,246,0.1)' },
    'in pilot': { color: 'var(--amber)', bg: 'rgba(245,158,11,0.1)' },
  }
  const statusTag: Record<string, string> = { open: 'new', matched: 'matched', in_pilot: 'in pilot' }
  const painFeed = [...painPoints]
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, 4)
    .map(pp => ({ dept: pp.department, text: pp.title, tag: statusTag[pp.status] ?? pp.status }))

  const deps = getDeptBarData(painPoints)
  const sparkData = getSparklineSeries(applications, painPoints)
  const pipelineSeries = getPipelineDepthSeries(applications, 12)

  const stageBreakdown = [
    { label: 'Named Contact', stage: 'named_contact',    color: 'var(--blue)'  },
    { label: 'In Review',     stage: 'in_review',        color: 'var(--amber)' },
    { label: 'Decision: Go',  stage: 'decision_go',      color: 'var(--accent)'  },
    { label: 'Redirected',    stage: 'decision_redirect', color: 'var(--red)'  },
  ].map(s => ({ ...s, count: stageCount(s.stage) }))
  const stageTotal = stageBreakdown.reduce((s, b) => s + b.count, 0) || 1

  const kpis = [
    { label: 'Implementations',      value: String(metrics.implementations),  context: 'idea to car · primary KPI',                              color: 'var(--accent)',  spark: sparkData.implementations, primary: true  },
    { label: 'Active Pilots',        value: String(metrics.activePilots),     context: 'running across departments',                             color: 'var(--text)',  spark: sparkData.pilots,          primary: false },
    { label: 'Avg Time to Decision', value: `${avgSignal}d`,                  context: `target ${metrics.targetTimeToSignal}d · on track`,      color: avgSignal <= 14 ? 'var(--accent)' : 'var(--amber)', spark: sparkData.signal, primary: false },
    { label: 'Pain Points',          value: `${openPP.length} open`,          context: `of ${painPoints.length} submitted · ${matchedCount} matched`, color: 'var(--amber)', spark: sparkData.openPainPoints,  primary: false },
  ]

  // ── KPI detail content ────────────────────────────────────────────────────
  const kpiDetails: Record<string, {
    description: string
    why: string
    target?: string
    accentColor: string
    route: string
    routeLabel: string
    rows: { label: string; value: string; color: string }[]
  }> = {
    'Implementations': {
      description: 'Startups that have moved from pilot to active deployment inside an Audi vehicle, production system, or department workflow.',
      why: 'This is the headline BRIDGE KPI. BMW Startup Garage completed 32 projects in 2022; Audi A4nXT has ~3 public wins in 4 years. Every implementation is the programme paying for itself.',
      target: '32 (BMW Startup Garage benchmark, 2022)',
      accentColor: 'var(--accent)',
      route: '/owner',
      routeLabel: 'View all startups',
      rows: applications
        .filter(a => ['path_to_production', 'decision_go'].includes(a.stage))
        .map(a => ({ label: a.companyName, value: a.stage === 'path_to_production' ? 'In production' : 'Decision: Go', color: 'var(--accent)' })),
    },
    'Active Pilots': {
      description: 'Startups currently running a live, scoped pilot inside an Audi department with a named Internal Lead and defined success criteria.',
      why: 'Without named ownership and a hard deadline, pilots stall indefinitely. Each active pilot has an Internal Lead on the hook for a decision.',
      accentColor: 'var(--text)',
      route: '/owner',
      routeLabel: 'View all startups',
      rows: applications
        .filter(a => ['in_pilot', 'matched_pain_owner'].includes(a.stage))
        .map(a => ({ label: a.companyName, value: `${a.daysInProcess}d in process`, color: 'var(--text-muted)' })),
    },
    'Avg Time to Decision': {
      description: 'Average days from application submission to a formal yes-or-no decision. Measures how fast BRIDGE delivers on its core promise.',
      why: 'Top founders won\'t wait months. BMW gives a supplier number in week six. BRIDGE\'s 14-day target is a competitive differentiator — miss it and the best startups route around Audi.',
      target: `${metrics.targetTimeToSignal} days`,
      accentColor: avgSignal <= 14 ? 'var(--accent)' : 'var(--amber)',
      route: '/owner',
      routeLabel: 'View all startups',
      rows: decidedApps.slice(0, 6).map(a => ({
        label: a.companyName,
        value: `${a.daysInProcess}d`,
        color: a.daysInProcess <= 14 ? 'var(--accent)' : 'var(--amber)',
      })),
    },
    'Pain Points': {
      description: 'Unmatched pain points submitted by Audi employees — real unsolved problems waiting for a startup match.',
      why: 'Each open pain point is a startup opportunity. Until matched, the problem persists and the potential pilot is invisible to founders applying through BRIDGE.',
      accentColor: 'var(--amber)',
      route: '/map',
      routeLabel: 'Open Pain Point Map',
      rows: [
        { label: 'Open — awaiting a startup match', value: String(openPP.length),    color: 'var(--amber)' },
        { label: 'Matched to a startup applicant',  value: String(matchedCount),     color: 'var(--blue)'  },
        { label: 'Active in a pilot or resolved',   value: String(painPoints.filter(pp => pp.status === 'in_pilot').length), color: 'var(--accent)' },
      ],
    },
  }

  const activePanelDetail = selectedKpi ? kpiDetails[selectedKpi] : null

  interface Alert { icon: React.JSX.Element; color: string; bg: string; border: string; text: string; sub: string }
  const rawAlerts: (Alert | null)[] = [
    overdue.length > 0    ? { icon: <AlertCircle size={12} color="var(--red)"   />, color: 'var(--red)',   bg: 'var(--red-dim)',  border: 'var(--red)',  text: `${overdue.length} decision${overdue.length > 1 ? 's' : ''} overdue`,        sub: overdue.map((a: Application) => a.companyName).join(', ') } : null,
    unassigned.length > 0 ? { icon: <Zap        size={12} color="var(--amber)" />, color: 'var(--amber)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: `${unassigned.length} startup${unassigned.length > 1 ? 's' : ''} unassigned`, sub: unassigned.map((a: Application) => a.companyName).join(', ') } : null,
    openPP.length > 0     ? { icon: <Clock       size={12} color="var(--blue)"  />, color: 'var(--blue)',  bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', text: `${openPP.length} pain point${openPP.length > 1 ? 's' : ''} unmatched`,      sub: 'Waiting for a startup match' } : null,
  ]
  const alerts = rawAlerts.filter((a): a is Alert => a !== null)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '76px 32px 48px', maxWidth: '1280px', margin: '0 auto' }}
    >
      <DemoHint persona="System overview" hint="Submit a pain point on the Map — it appears in the live feed below. Click any KPI card to see a description and live data." />

      {/* ── HEADER ────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span className="kicker">system overview · bridge</span>
          <h1 style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: '26px', color: 'var(--text)', lineHeight: 1.1 }}>Dashboard</h1>
          <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px' }}>
            Audi doesn't need more startups. It needs a system that doesn't lose them.
          </p>
        </div>
      </div>

      {/* ── ATTENTION STRIP ───────────────────────────────── */}
      {alerts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {alerts.map((a, i) => (
            <div
              key={i}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: a.bg, border: `1px solid ${a.border}`, borderRadius: 'var(--radius-sm)', padding: '8px 12px', flex: '1 1 auto' }}
            >
              {a.icon}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontFamily: 'AudiType', fontWeight: 600, fontSize: '12px', color: a.color }}>{a.text}</span>
                <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.sub}</span>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── KPI STRIP ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.35 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
        {kpis.map(k => {
          const isSelected = selectedKpi === k.label
          const detail = kpiDetails[k.label]
          return (
            <div
              key={k.label}
              onClick={() => setSelectedKpi(isSelected ? null : k.label)}
              style={{
                background: isSelected ? 'var(--surface-2)' : 'var(--surface)',
                border: `1px solid ${isSelected ? detail.accentColor : k.primary ? 'var(--border-strong)' : 'var(--border)'}`,
                borderTop: `2px solid ${isSelected ? detail.accentColor : k.primary ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-2)' }}
              onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'var(--surface)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: isSelected ? detail.accentColor : 'var(--text-faint)' }}>{k.label}</span>
                {isSelected
                  ? <X size={11} color="var(--text-faint)" />
                  : <ChevronRight size={11} color="var(--text-faint)" style={{ opacity: 0.5 }} />
                }
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: k.value.includes(' ') ? '22px' : '32px', color: k.color, lineHeight: 1 }}>{k.value}</div>
                <Sparkline data={k.spark} color={k.color} />
              </div>
              <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>{k.context}</div>
            </div>
          )
        })}
      </motion.div>

      {/* ── KPI DETAIL PANEL ──────────────────────────────── */}
      <AnimatePresence>
        {selectedKpi && activePanelDetail && (
          <motion.div
            key={selectedKpi}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden', marginBottom: '10px' }}
          >
            <div style={{
              background: 'var(--surface)',
              border: `1px solid var(--border)`,
              borderLeft: `3px solid ${activePanelDetail.accentColor}`,
              borderRadius: 'var(--radius)',
              padding: '20px 24px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
            }}>
              {/* Left: description */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: activePanelDetail.accentColor }}>{selectedKpi}</span>
                  {activePanelDetail.target && (
                    <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: '0' }}>
                      target: {activePanelDetail.target}
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: 'AudiType', fontSize: '14px', color: 'var(--text)', lineHeight: 1.65, marginBottom: '14px' }}>
                  {activePanelDetail.description}
                </p>
                <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>Why this matters</span>
                  <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {activePanelDetail.why}
                  </p>
                </div>
                <button
                  onClick={() => navigate(activePanelDetail.route)}
                  style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'AudiType', fontWeight: 600, fontSize: '12px', color: activePanelDetail.accentColor, background: 'transparent', border: `1px solid ${activePanelDetail.accentColor}40`, padding: '7px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${activePanelDetail.accentColor}12`)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {activePanelDetail.routeLabel} <ChevronRight size={13} />
                </button>
              </div>

              {/* Right: live data rows */}
              <div>
                <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '10px' }}>
                  {activePanelDetail.rows.length > 0 ? 'Live data' : 'No records yet'}
                </span>
                {activePanelDetail.rows.length === 0 ? (
                  <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-faint)', lineHeight: 1.6 }}>
                    Nothing to show yet — data will appear here as the pipeline grows.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {activePanelDetail.rows.map((row, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: i % 2 === 0 ? 'var(--surface-2)' : 'transparent' }}>
                        <span style={{ fontFamily: 'AudiType', fontSize: '12px', color: 'var(--text-muted)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.label}</span>
                        <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: row.color, flexShrink: 0, marginLeft: '12px' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN BENTO GRID ───────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: 'auto auto', gap: '10px', marginBottom: '10px' }}>

        {/* Pipeline panel — 8 cols, 2 rows */}
        <div style={{ gridColumn: 'span 8', gridRow: 'span 2' }}>
          <Chrome title="pipeline" badge="live">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Stat counters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)', flexShrink: 0 }}>
                {[
                  { k: 'Pilots',         v: String(metrics.activePilots),    route: '/owner' },
                  { k: 'Internal Leads', v: String(owners.length),            route: '/owner' },
                  { k: 'Pain Points',    v: String(painPoints.length),        route: '/map'   },
                  { k: 'To Production',  v: String(metrics.implementations),  route: '/owner' },
                ].map(s => (
                  <div
                    key={s.k}
                    onClick={() => navigate(s.route)}
                    style={{ background: 'var(--bg)', padding: '12px 14px', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--surface)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--bg)'}
                  >
                    <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginBottom: '4px' }}>{s.k}</div>
                    <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '22px', color: 'var(--text)', lineHeight: 1 }}>{s.v}</div>
                  </div>
                ))}
              </div>

              {/* Pipeline depth chart — fixed height so no dead space */}
              <div style={{ borderBottom: '1px solid var(--border)' }}>
                <AreaChart data={pipelineSeries} />
              </div>

              {/* Applications by stage — horizontal stacked bar */}
              <div style={{ padding: '10px 14px 12px', flexShrink: 0 }}>
                <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '7px' }}>Applications by stage</span>
                {/* Stacked bar */}
                <div style={{ display: 'flex', height: '5px', borderRadius: '0', overflow: 'hidden', gap: '1px', marginBottom: '8px' }}>
                  {stageBreakdown.filter(s => s.count > 0).map(s => (
                    <div
                      key={s.stage}
                      onClick={() => navigate('/owner')}
                      style={{ flex: s.count / stageTotal, background: s.color, cursor: 'pointer' }}
                      title={`${s.label}: ${s.count}`}
                    />
                  ))}
                  {stageBreakdown.every(s => s.count === 0) && (
                    <div style={{ flex: 1, background: 'var(--border)' }} />
                  )}
                </div>
                {/* Legend */}
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  {stageBreakdown.map(({ label, stage, color, count }) => (
                    <div key={stage} onClick={() => navigate('/owner')} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '0', background: color }} />
                      <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>{label}</span>
                      <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '13px', color: count > 0 ? 'var(--text)' : 'var(--text-faint)' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Chrome>
        </div>

        {/* Pain feed — 4 cols, row 1 */}
        <div style={{ gridColumn: 'span 4' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', height: '100%' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer' }}
              onClick={() => navigate('/map')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>Live pain feed</span>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              </div>
              <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                View all <ChevronRight size={11} />
              </span>
            </div>
            {painFeed.map((item, i) => (
              <div
                key={item.text}
                onClick={() => navigate('/map')}
                style={{ padding: '10px 14px', borderBottom: i < painFeed.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-2)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'AudiType', fontSize: '12px', color: 'var(--text)', lineHeight: 1.4, marginBottom: '3px' }}>{item.text}</div>
                  <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>{item.dept}</span>
                </div>
                <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: tagStyle[item.tag]?.color || 'var(--text-faint)', background: tagStyle[item.tag]?.bg || 'transparent', padding: '2px 6px', borderRadius: '0', flexShrink: 0, border: `1px solid ${tagStyle[item.tag]?.color || 'var(--border)'}25` }}>{item.tag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dept bars — 4 cols, row 2 */}
        <div style={{ gridColumn: 'span 4' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', height: '100%' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer' }}
              onClick={() => navigate('/map')}
            >
              <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>Pain points by dept</span>
              <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                View map <ChevronRight size={11} />
              </span>
            </div>
            <div style={{ padding: '14px' }}>
              {deps.map(dep => (
                <div key={dep.label} style={{ marginBottom: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'AudiType', fontSize: '12px', color: 'var(--text-muted)' }}>{dep.label}</span>
                    <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>{dep.pct}%</span>
                  </div>
                  <div style={{ height: '3px', background: 'var(--surface-2)', borderRadius: '0', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${dep.pct}%` }} transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
                      style={{ height: '100%', background: 'var(--accent)', borderRadius: '0' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── THREE PILLARS ─────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.35 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
        {[
          { num: '01', name: 'The Door',          stat: '48h',                                      caption: '48h to a name · 2 weeks to a decision', body: 'Every founder gets a name, not a form. A yes or no in 2 weeks.',                         color: 'var(--blue)',  route: '/owner' },
          { num: '02', name: 'The Internal Lead', stat: String(metrics.implementationsThisQuarter), caption: 'implementations this quarter',   body: 'One named Audi employee is responsible for each startup end-to-end. KPI is implementation.',              color: 'var(--accent)',  route: '/owner' },
          { num: '03', name: 'The Map',            stat: String(painPoints.length),                  caption: 'pain points submitted',         body: 'Any employee can surface a problem. Pilots visible across all silos.',                                    color: 'var(--amber)', route: '/map'   },
        ].map((p, i) => (
          <motion.div
            key={p.num}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 + i * 0.05, duration: 0.35 }}
            onClick={() => navigate(p.route)}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `2px solid ${p.color}`, borderRadius: 'var(--radius)', padding: '18px 20px', cursor: 'pointer', transition: 'background 0.15s' }}
            whileHover={{ backgroundColor: 'var(--surface-2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: p.color }}>{p.num} · {p.name}</span>
              <ChevronRight size={13} color={p.color} style={{ opacity: 0.7 }} />
            </div>
            <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '36px', color: p.color, lineHeight: 1, marginBottom: '4px' }}>{p.stat}</div>
            <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginBottom: '10px' }}>{p.caption}</div>
            <div style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{p.body}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
