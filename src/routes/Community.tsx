import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Lightbulb, Plus, Pencil, Trash2, Truck, CheckCircle2 } from 'lucide-react'
import { useBridgeStore } from '../store/store'
import { useAuthStore } from '../store/authStore'
import DemoHint from '../components/DemoHint'
import StatusTimeline from '../components/StatusTimeline'
import TruckTourMap, { CITY_PRESETS, lonLatToXY } from '../components/TruckTourMap'
import type { CommunityEventType, CommunityEvent, TruckStop, TruckStopStatus } from '../store/types'

const EVENT_TYPES: CommunityEventType[] = ['workshop', 'networking', 'demo_day', 'hackathon']

const EVENT_TYPE_LABEL: Record<CommunityEventType, string> = {
  workshop: 'Workshop',
  networking: 'Networking',
  demo_day: 'Demo Day',
  hackathon: 'Hackathon',
}

const EVENT_TYPE_COLOR: Record<CommunityEventType, string> = {
  workshop: 'var(--blue)',
  networking: 'var(--accent)',
  demo_day: 'var(--amber)',
  hackathon: 'var(--red)',
}

const STOP_STATUSES: TruckStopStatus[] = ['past', 'current', 'upcoming']
const STOP_STATUS_LABEL: Record<TruckStopStatus, string> = {
  past: 'Past', current: 'Here now', upcoming: 'Upcoming',
}
const STOP_STATUS_COLOR: Record<TruckStopStatus, string> = {
  past: 'var(--text-faint)', current: 'var(--accent)', upcoming: 'var(--blue)',
}

type Tab = 'overview' | 'events' | 'tour'

const emptyEvent = { title: '', type: 'workshop' as CommunityEventType, date: '', location: '', description: '' }
const emptyStop = {
  city: '', venue: '', date: '', description: '', registerUrl: '',
  hereNow: false, x: 50, y: 50,
}

// A stop's status is derived from its date — past if it already happened,
// upcoming if it's in the future. "Here now" is the one case that can't be
// inferred (the truck sits at a stop for a window, not exactly on the date),
// so the admin sets it explicitly and it overrides the date.
function deriveStatus(date: string, hereNow: boolean): TruckStopStatus {
  if (hereNow) return 'current'
  if (!date) return 'upcoming'
  const today = new Date().toISOString().slice(0, 10)
  return date < today ? 'past' : 'upcoming'
}

export default function Community() {
  const { selectedMemberId, selectedAppId, role } = useAuthStore()
  const {
    poolMembers, applications, communityEvents, truckStops, painPoints,
    addCommunityEvent, updateCommunityEvent, deleteCommunityEvent,
    addTruckStop, updateTruckStop, deleteTruckStop,
  } = useBridgeStore()

  const isAdmin = role === 'admin'
  const isFounder = role === 'startup'
  const isMember = role === 'pool_member'

  const [tab, setTab] = useState<Tab>('overview')

  // Viewer identity: a pool member (existing) or an accepted founder (their app).
  const member = isFounder ? null : (poolMembers.find(m => m.id === selectedMemberId) ?? poolMembers[0])
  const app = isFounder ? (applications.find(a => a.id === selectedAppId) ?? null) : null

  const displayName = isFounder ? (app?.companyName ?? 'Your company') : (member?.name ?? '')
  const displaySubtitle = isFounder
    ? app?.technology
    : (member?.company ? `${member.company} · ${member.techArea}` : member?.techArea)

  // Community members see open pain points the admin has shared (default-shared:
  // only an explicit false hides one).
  const openPainPoints = painPoints.filter(pp => pp.status === 'open' && pp.sharedWithCommunity !== false)

  // Pool members see their invitations; everyone else (founder/lead/admin) sees all.
  const visibleEvents = isMember && member
    ? communityEvents.filter(e => e.invitedMemberIds.includes(member.id))
    : communityEvents

  if (!member && !app) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '80px 40px 60px', maxWidth: '900px', margin: '0 auto' }}
    >
      <DemoHint
        persona={
          isFounder ? `You are ${displayName} — now in the BRIDGE community`
          : isAdmin ? `Admin · you're viewing the community as ${displayName}`
          : `You are ${displayName} — BRIDGE Community`
        }
        hint={isFounder
          ? "You've been accepted into BRIDGE. The community opens up once you're in: events, the recruiting tour, and the open pain points across Audi."
          : isAdmin
          ? "This is the member-facing community. As admin you can manage events and the recruiting tour from here."
          : "Community members have access to Audi's open pain points and are invited to events. If you see a problem you can solve, you're welcome to apply."}
      />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
        <span className="kicker">bridge community</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 4vw, 42px)', color: 'var(--text)', lineHeight: 1.1 }}>
            {isAdmin ? 'BRIDGE Community' : displayName}
          </h1>
          <span style={{
            fontFamily: 'AudiType', fontSize: '11px',
            color: isAdmin ? 'var(--amber)' : isFounder ? 'var(--accent)' : member?.type === 'startup' ? 'var(--accent)' : 'var(--blue)',
            background: isAdmin ? 'rgba(245,158,11,0.12)' : isFounder ? 'var(--accent-dim)' : member?.type === 'startup' ? 'var(--accent-dim)' : 'rgba(59,130,246,0.1)',
            padding: '4px 10px', borderRadius: '0',
          }}>
            {isAdmin ? 'Admin' : isFounder ? 'Accepted Founder' : member?.type === 'startup' ? 'Startup' : 'Contact'}
          </span>
        </div>
        {isAdmin ? (
          <div style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-faint)', marginTop: '4px' }}>
            Viewing as {displayName}{member?.type ? ` · ${member.type === 'startup' ? 'Startup' : 'Contact'}` : ''}
          </div>
        ) : displaySubtitle && (
          <div style={{ fontFamily: 'AudiType', fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {displaySubtitle}
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div role="tablist" style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)', marginBottom: '28px' }}>
        {(['overview', 'events', 'tour'] as Tab[]).map(t => {
          const active = tab === t
          const label = t === 'overview' ? 'Overview' : t === 'events' ? 'Events' : 'Tour'
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t)}
              style={{
                fontFamily: 'AudiType', fontSize: '13px', fontWeight: active ? 700 : 500,
                color: active ? 'var(--text)' : 'var(--text-muted)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '10px 16px', position: 'relative',
                borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: '-1px', transition: 'color 0.15s',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Active tab panel. A fresh key re-triggers the fade-in on switch; no
          exit animation so a panel can never be held back from mounting. */}
      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {tab === 'overview' && (
          <OverviewTab
            isFounder={isFounder}
            memberNotes={member?.type === 'startup' ? member.notes : undefined}
            addedByName={member?.addedByName}
            appStage={app?.stage ?? null}
            openPainPoints={openPainPoints}
            showApplyCta={!isFounder}
          />
        )}

        {tab === 'events' && (
          <EventsTab
            events={visibleEvents}
            poolCount={poolMembers.length}
            isAdmin={isAdmin}
            showInvitedTag={isMember}
            onAdd={addCommunityEvent}
            onUpdate={updateCommunityEvent}
            onDelete={deleteCommunityEvent}
          />
        )}

        {tab === 'tour' && (
          <TourTab
            stops={truckStops}
            isAdmin={isAdmin}
            onAdd={addTruckStop}
            onUpdate={updateTruckStop}
            onDelete={deleteTruckStop}
          />
        )}
      </motion.div>
    </motion.div>
  )
}

// ── Overview ────────────────────────────────────────────────────────────────

function OverviewTab({
  isFounder, memberNotes, addedByName, appStage, openPainPoints, showApplyCta,
}: {
  isFounder: boolean
  memberNotes?: string
  addedByName?: string
  appStage: import('../store/types').Stage | null
  openPainPoints: import('../store/types').PainPoint[]
  showApplyCta: boolean
}) {
  return (
    <div>
      {/* Why you're here */}
      {isFounder ? (
        <div style={{ marginBottom: '32px', padding: '20px 24px', background: 'var(--accent-dim)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', borderLeft: '3px solid var(--accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircle2 size={16} color="var(--accent)" />
            <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>You're in — welcome to the BRIDGE community</span>
          </div>
          <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 16px' }}>
            Your application was accepted. Here's where you are in the journey — and it keeps moving from here.
          </p>
          {appStage && <StatusTimeline current={appStage} compact />}
        </div>
      ) : (
        memberNotes && (
          <div style={{ marginBottom: '32px', padding: '20px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', borderLeft: '3px solid var(--blue)' }}>
            <span className="kicker" style={{ display: 'block', marginBottom: '6px' }}>from {addedByName}, your internal lead</span>
            <p style={{ fontFamily: 'AudiType', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
              {memberNotes}
            </p>
          </div>
        )
      )}

      {/* Open pain points */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <Lightbulb size={14} color="var(--text-faint)" />
        <span className="kicker">open pain points</span>
      </div>
      <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-faint)', marginBottom: '14px', lineHeight: 1.5 }}>
        These are real problems Audi hasn't solved yet. {showApplyCta ? "If you have technology that could address one, you're welcome to apply through BRIDGE." : 'Your internal lead can match you to one as you move toward a pilot.'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {openPainPoints.map((pp, i) => (
          <motion.div
            key={pp.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 + i * 0.04 }}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px 20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <div style={{ fontFamily: 'AudiType', fontWeight: 600, fontSize: '14px', color: 'var(--text)', lineHeight: 1.3 }}>{pp.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <Users size={11} color="var(--text-faint)" />
                <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>{pp.department}</span>
              </div>
            </div>
            <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{pp.description}</p>
          </motion.div>
        ))}
      </div>

      {showApplyCta && (
        <div style={{ marginTop: '24px', padding: '20px 24px', background: 'var(--accent-dim)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '15px', color: 'var(--text)', marginBottom: '2px' }}>See a problem you can solve?</div>
            <div style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)' }}>Community members can apply directly. You already know the process.</div>
          </div>
          <Link to="/login" style={{ fontFamily: 'AudiType', fontWeight: 600, fontSize: '13px', color: 'var(--accent-contrast)', background: 'var(--accent)', border: 'none', padding: '10px 20px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap', display: 'inline-block' }}>
            Apply to BRIDGE
          </Link>
        </div>
      )}
    </div>
  )
}

// ── Events ──────────────────────────────────────────────────────────────────

function EventsTab({
  events, poolCount, isAdmin, showInvitedTag, onAdd, onUpdate, onDelete,
}: {
  events: CommunityEvent[]
  poolCount: number
  isAdmin: boolean
  showInvitedTag: boolean
  onAdd: (e: CommunityEvent) => void
  onUpdate: (e: CommunityEvent) => void
  onDelete: (id: string) => void
}) {
  const [form, setForm] = useState(emptyEvent)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  function startAdd() { setForm(emptyEvent); setEditingId(null); setOpen(true) }
  function startEdit(e: CommunityEvent) {
    setForm({ title: e.title, type: e.type, date: e.date, location: e.location, description: e.description })
    setEditingId(e.id); setOpen(true)
  }
  function close() { setOpen(false); setEditingId(null); setForm(emptyEvent) }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!form.title.trim()) return
    if (editingId) {
      const existing = events.find(e => e.id === editingId)
      onUpdate({
        id: editingId,
        title: form.title, type: form.type,
        date: form.date || 'TBD', location: form.location || 'TBD', description: form.description,
        invitedMemberIds: existing?.invitedMemberIds ?? [],
      })
    } else {
      onAdd({
        id: `evt-${Date.now()}`,
        title: form.title, type: form.type,
        date: form.date || 'TBD', location: form.location || 'TBD', description: form.description,
        invitedMemberIds: [], // invite-all is handled by admin tooling; default empty
      })
    }
    close()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={14} color="var(--text-faint)" />
          <span className="kicker">{showInvitedTag ? 'your invitations' : 'all events'}</span>
        </div>
        {isAdmin && (
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => open && !editingId ? close() : startAdd()}>
            <Plus size={13} /> Add event
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdmin && open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: '14px' }}>
            <form onSubmit={handleSubmit} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>{editingId ? 'Edit event' : 'New event'}</span>
              <input className="input" placeholder="Event title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <select className="input" style={{ flex: 1 }} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as CommunityEventType }))}>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{EVENT_TYPE_LABEL[t]}</option>)}
                </select>
                <input className="input" style={{ flex: 1 }} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                <input className="input" style={{ flex: 1 }} placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <textarea className="input" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: '60px' }} />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={close}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>{editingId ? 'Save changes' : 'Create event'}</button>
              </div>
              {!editingId && <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>Visible to all {poolCount} community members.</span>}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {events.length === 0 ? (
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-faint)' }}>No upcoming events yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {events.map((evt, i) => (
            <motion.div key={evt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 + i * 0.05 }} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: EVENT_TYPE_COLOR[evt.type], background: `${EVENT_TYPE_COLOR[evt.type]}18`, padding: '2px 7px', borderRadius: '0' }}>{EVENT_TYPE_LABEL[evt.type]}</span>
                    {showInvitedTag && <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--accent)' }}>Invited</span>}
                  </div>
                  <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '16px', color: 'var(--text)' }}>{evt.title}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-muted)' }}>{evt.date}</div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button aria-label="Edit event" onClick={() => startEdit(evt)} style={iconBtn}><Pencil size={13} /></button>
                      <button aria-label="Delete event" onClick={() => onDelete(evt.id)} style={{ ...iconBtn, color: 'var(--red)' }}><Trash2 size={13} /></button>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '8px' }}>
                <MapPin size={12} color="var(--text-faint)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>{evt.location}</span>
              </div>
              <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{evt.description}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Tour ────────────────────────────────────────────────────────────────────

function TourTab({
  stops, isAdmin, onAdd, onUpdate, onDelete,
}: {
  stops: TruckStop[]
  isAdmin: boolean
  onAdd: (s: TruckStop) => void
  onUpdate: (s: TruckStop) => void
  onDelete: (id: string) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(stops.find(s => s.status === 'current')?.id ?? null)
  const [form, setForm] = useState(emptyStop)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  const selected = stops.find(s => s.id === selectedId) ?? null

  function startAdd() { setForm(emptyStop); setEditingId(null); setOpen(true); setPlacing(false); setError('') }
  function startEdit(s: TruckStop) {
    setForm({ city: s.city, venue: s.venue, date: s.date, description: s.description, registerUrl: s.registerUrl ?? '', hereNow: s.status === 'current', x: s.x, y: s.y })
    setEditingId(s.id); setOpen(true); setPlacing(false); setError('')
  }
  function close() { setOpen(false); setEditingId(null); setForm(emptyStop); setPlacing(false); setError('') }

  // Typing or picking a city: if it matches a known preset, drop the pin on its
  // real location automatically. Validation lives here (not native HTML) so the
  // form can never silently refuse to submit.
  function setCity(value: string) {
    setError('')
    const preset = CITY_PRESETS.find(c => c.name.toLowerCase() === value.trim().toLowerCase())
    if (preset) {
      const { x, y } = lonLatToXY(preset.lon, preset.lat)
      setForm(f => ({ ...f, city: value, x, y }))
    } else {
      setForm(f => ({ ...f, city: value }))
    }
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const missing: string[] = []
    if (!form.city.trim()) missing.push('City')
    if (!form.venue.trim()) missing.push('Venue')
    if (!form.date) missing.push('Date')
    if (missing.length) {
      setError(`Please fill in: ${missing.join(', ')}.`)
      return
    }
    const payload: TruckStop = {
      id: editingId ?? `ts-${Date.now()}`,
      city: form.city.trim(), venue: form.venue.trim(), date: form.date,
      description: form.description.trim(), status: deriveStatus(form.date, form.hereNow),
      x: Number(form.x), y: Number(form.y),
      registerUrl: form.registerUrl.trim() || undefined,
    }
    if (editingId) onUpdate(payload); else onAdd(payload)
    close()
  }

  // While the form is open and "place" is active, clicking the map sets x/y.
  const previewStops = open
    ? [...stops.filter(s => s.id !== editingId), { ...emptyStop, ...form, id: editingId ?? 'draft', status: deriveStatus(form.date, form.hereNow), x: Number(form.x), y: Number(form.y) } as TruckStop]
    : stops

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={14} color="var(--text-faint)" />
          <span className="kicker">recruiting truck — tour route</span>
        </div>
        {isAdmin && !open && (
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={startAdd}>
            <Plus size={13} /> Add stop
          </button>
        )}
      </div>
      <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-faint)', marginBottom: '18px', lineHeight: 1.5 }}>
        The BRIDGE truck tours universities and startup hubs so founders can meet Audi's venture clienting team informally — no idea or pitch required, just a first conversation. Tap a pin to see when it's near you.
      </p>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {STOP_STATUSES.map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: s === 'past' ? 'var(--bg)' : STOP_STATUS_COLOR[s], border: `2px solid ${STOP_STATUS_COLOR[s]}` }} />
            <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-muted)' }}>{STOP_STATUS_LABEL[s]}</span>
          </div>
        ))}
      </div>

      <div className="tour-map-grid" style={{ gap: '24px' }}>
        {/* Map */}
        <div className="card" style={{ padding: '16px' }}>
          <TruckTourMap
            stops={previewStops}
            selectedId={selectedId}
            onSelect={setSelectedId}
            placing={placing}
            onPlace={(x, y) => { setForm(f => ({ ...f, x, y })); }}
          />
        </div>

        {/* Detail + list */}
        <div>
          {/* Admin form */}
          <AnimatePresence>
            {isAdmin && open && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: '14px' }}>
                <form onSubmit={handleSubmit} className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }} noValidate>
                  <div>
                    <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>{editingId ? 'Edit stop' : 'New stop'}</span>
                    <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginLeft: '8px' }}>
                      <span style={{ color: 'var(--accent)' }}>*</span> required
                    </span>
                  </div>

                  {/* City — type or pick from the list; a known city drops its pin automatically */}
                  <label style={fieldLabel}>
                    City <span style={{ color: 'var(--accent)' }}>*</span>
                    <input
                      className="input"
                      style={{ marginTop: '4px' }}
                      list="city-presets"
                      placeholder="City name — type or pick (e.g. Munich)"
                      value={form.city}
                      onChange={e => setCity(e.target.value)}
                      autoFocus
                    />
                    <datalist id="city-presets">
                      {CITY_PRESETS.map(c => <option key={c.name} value={c.name} />)}
                    </datalist>
                  </label>

                  <label style={fieldLabel}>
                    Venue <span style={{ color: 'var(--accent)' }}>*</span>
                    <input className="input" style={{ marginTop: '4px' }} placeholder="e.g. TUM — UnternehmerTUM, Garching" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} />
                  </label>

                  <label style={fieldLabel}>
                    Date <span style={{ color: 'var(--accent)' }}>*</span>
                    <input className="input" style={{ marginTop: '4px', width: '100%' }} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </label>

                  {/* Status is derived from the date — only "here now" is a manual override. */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'AudiType', fontSize: '12px', color: 'var(--text)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.hereNow} onChange={e => setForm(f => ({ ...f, hereNow: e.target.checked }))} />
                      Truck is here now
                    </label>
                    <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>
                      Status: <span style={{ color: STOP_STATUS_COLOR[deriveStatus(form.date, form.hereNow)], fontWeight: 600 }}>{STOP_STATUS_LABEL[deriveStatus(form.date, form.hereNow)]}</span>
                      {!form.hereNow && form.date ? ' (from date)' : ''}
                    </span>
                  </div>

                  <label style={fieldLabel}>
                    Description
                    <textarea className="input" style={{ marginTop: '4px', minHeight: '54px' }} placeholder="What happens at this stop?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </label>

                  <label style={fieldLabel}>
                    Register URL
                    <input className="input" style={{ marginTop: '4px' }} placeholder="https://…" value={form.registerUrl} onChange={e => setForm(f => ({ ...f, registerUrl: e.target.value }))} />
                  </label>

                  {/* Pin position — set automatically for known cities; otherwise place it on the map */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => setPlacing(p => !p)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '11px', borderColor: placing ? 'var(--accent)' : undefined, color: placing ? 'var(--accent)' : undefined }}>
                      {placing ? 'Now click the map…' : 'Place pin on map'}
                    </button>
                    <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>
                      Pin: {Number(form.x).toFixed(0)}, {Number(form.y).toFixed(0)} — auto-set for known cities
                    </span>
                  </div>

                  {error && (
                    <div role="alert" style={{ fontFamily: 'AudiType', fontSize: '12px', color: 'var(--red)', background: 'var(--red-dim, rgba(220,38,38,0.08))', border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
                      {error}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={close}>Cancel</button>
                    <button type="submit" className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>{editingId ? 'Save changes' : 'Add stop'}</button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected stop detail */}
          {selected && (
            <div className="card" style={{ padding: '18px 20px', marginBottom: '16px', borderLeft: `3px solid ${STOP_STATUS_COLOR[selected.status]}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <div>
                  <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '17px', color: 'var(--text)' }}>{selected.city}</div>
                  <div style={{ fontFamily: 'AudiType', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{selected.venue}</div>
                </div>
                <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: STOP_STATUS_COLOR[selected.status], background: `${STOP_STATUS_COLOR[selected.status]}18`, padding: '3px 8px', whiteSpace: 'nowrap' }}>{STOP_STATUS_LABEL[selected.status]}</span>
              </div>
              <div style={{ fontFamily: 'AudiType', fontSize: '12px', color: 'var(--text-faint)', margin: '8px 0' }}>{selected.date}</div>
              <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{selected.description}</p>
              {selected.registerUrl && (
                <a href={selected.registerUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '12px', fontFamily: 'AudiType', fontSize: '12px', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>Register →</a>
              )}
            </div>
          )}

          {/* Stop list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {stops.map(s => {
              const active = s.id === selectedId
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setSelectedId(s.id)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                      textAlign: 'left', background: active ? 'var(--accent-dim)' : 'var(--surface)',
                      border: `1px solid ${active ? 'var(--border-strong)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)', padding: '10px 12px', cursor: 'pointer',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0, background: s.status === 'past' ? 'var(--bg)' : STOP_STATUS_COLOR[s.status], border: `2px solid ${STOP_STATUS_COLOR[s.status]}` }} />
                      <span style={{ fontFamily: 'AudiType', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{s.city}</span>
                    </span>
                    <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>{s.date}</span>
                  </button>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button aria-label="Edit stop" onClick={() => startEdit(s)} style={iconBtn}><Pencil size={13} /></button>
                      <button aria-label="Delete stop" onClick={() => onDelete(s.id)} style={{ ...iconBtn, color: 'var(--red)' }}><Trash2 size={13} /></button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

const iconBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)',
  borderRadius: 'var(--radius-sm)', padding: '5px', cursor: 'pointer',
}

const fieldLabel: React.CSSProperties = {
  display: 'block', fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)',
}
