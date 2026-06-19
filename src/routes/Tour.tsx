import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Truck, MapPin, ArrowRight } from 'lucide-react'
import { useBridgeStore } from '../store/store'
import TruckTourMap from '../components/TruckTourMap'
import type { TruckStopStatus } from '../store/types'

const STATUS_LABEL: Record<TruckStopStatus, string> = {
  past: 'Past', current: 'Here now', upcoming: 'Upcoming',
}
const STATUS_COLOR: Record<TruckStopStatus, string> = {
  past: 'var(--text-faint)', current: 'var(--accent)', upcoming: 'var(--blue)',
}

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function Tour() {
  const truckStops = useBridgeStore(s => s.truckStops)
  const upcoming = truckStops.filter(s => s.status !== 'past')
  const [selectedId, setSelectedId] = useState<string | null>(
    truckStops.find(s => s.status === 'current')?.id ?? upcoming[0]?.id ?? null
  )
  const selected = truckStops.find(s => s.id === selectedId) ?? null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '96px 24px 80px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease }} style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Truck size={16} color="var(--accent)" />
            <span className="kicker">bridge on tour</span>
          </div>
          <h1 style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: 'clamp(28px, 5vw, 48px)', color: 'var(--text)', lineHeight: 1.1, marginBottom: '12px' }}>
            The BRIDGE truck is coming to you
          </h1>
          <p style={{ fontFamily: 'AudiType', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '560px' }}>
            We tour universities and startup hubs across Germany to meet founders where they are. Find the next stop near you — and if your technology fits, apply on the spot.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)', gap: '32px', alignItems: 'start' }}>
          {/* Map */}
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.55, ease }} className="card" style={{ padding: '20px' }}>
            <TruckTourMap stops={truckStops} selectedId={selectedId} onSelect={setSelectedId} />
          </motion.div>

          {/* Detail + upcoming */}
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.55, ease }}>
            {selected && (
              <div className="card" style={{ padding: '20px 22px', marginBottom: '18px', borderLeft: `3px solid ${STATUS_COLOR[selected.status]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div>
                    <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '19px', color: 'var(--text)' }}>{selected.city}</div>
                    <div style={{ fontFamily: 'AudiType', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{selected.venue}</div>
                  </div>
                  <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: STATUS_COLOR[selected.status], background: `${STATUS_COLOR[selected.status]}18`, padding: '3px 8px', whiteSpace: 'nowrap' }}>{STATUS_LABEL[selected.status]}</span>
                </div>
                <div style={{ fontFamily: 'AudiType', fontSize: '12px', color: 'var(--text-faint)', margin: '8px 0' }}>{selected.date}</div>
                <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{selected.description}</p>
                {selected.registerUrl && (
                  <a href={selected.registerUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '12px', fontFamily: 'AudiType', fontSize: '12px', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>Register for this stop →</a>
                )}
              </div>
            )}

            <span className="kicker" style={{ display: 'block', marginBottom: '10px' }}>upcoming stops</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {upcoming.map(s => {
                const active = s.id === selectedId
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', textAlign: 'left',
                      background: active ? 'var(--accent-dim)' : 'var(--surface)',
                      border: `1px solid ${active ? 'var(--border-strong)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)', padding: '11px 14px', cursor: 'pointer',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={13} color={STATUS_COLOR[s.status]} />
                      <span style={{ fontFamily: 'AudiType', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{s.city}</span>
                      <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>· {s.venue}</span>
                    </span>
                    <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>{s.date}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Apply CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }} style={{ marginTop: '40px', padding: '28px 32px', background: 'var(--accent-dim)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '18px', color: 'var(--text)', marginBottom: '4px' }}>Can't wait for the truck?</div>
            <div style={{ fontFamily: 'AudiType', fontSize: '14px', color: 'var(--text-muted)' }}>Apply to BRIDGE today — a named contact within 48 hours, a decision in two weeks.</div>
          </div>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'AudiType', fontWeight: 600, fontSize: '14px', color: 'var(--accent-contrast)', background: 'var(--accent)', border: 'none', padding: '12px 24px', borderRadius: 'var(--radius-sm)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Apply to BRIDGE <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
