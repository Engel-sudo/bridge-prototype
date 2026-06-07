import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Lightbulb } from 'lucide-react'
import { useBridgeStore } from '../store/store'
import { useAuthStore } from '../store/authStore'
import DemoHint from '../components/DemoHint'
import type { CommunityEventType } from '../store/types'

const EVENT_TYPE_LABEL: Record<CommunityEventType, string> = {
  workshop: 'Workshop',
  networking: 'Networking',
  demo_day: 'Demo Day',
  hackathon: 'Hackathon',
}

const EVENT_TYPE_COLOR: Record<CommunityEventType, string> = {
  workshop: 'var(--blue)',
  networking: 'var(--lime)',
  demo_day: 'var(--amber)',
  hackathon: 'var(--red)',
}

export default function Community() {
  const { selectedMemberId } = useAuthStore()
  const { poolMembers, communityEvents, painPoints } = useBridgeStore()

  const member = poolMembers.find(m => m.id === selectedMemberId) ?? poolMembers[0]
  const myEvents = communityEvents.filter(e => e.invitedMemberIds.includes(member?.id ?? ''))
  const openPainPoints = painPoints.filter(pp => pp.status === 'open')

  if (!member) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '80px 40px 60px', maxWidth: '900px', margin: '0 auto' }}
    >
      <DemoHint
        persona={`You are ${member.name} — BRIDGE Community`}
        hint="Community members have access to Audi's open pain points and are invited to events. If you see a problem you can solve, you're welcome to apply."
      />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '36px' }}>
        <span className="kicker">bridge community</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 'clamp(24px, 4vw, 42px)', color: 'var(--text)', lineHeight: 1.1 }}>
            {member.name}
          </h1>
          <span style={{
            fontFamily: 'IBM Plex Mono', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: member.type === 'startup' ? 'var(--lime)' : 'var(--blue)',
            background: member.type === 'startup' ? 'rgba(200,240,0,0.1)' : 'rgba(59,130,246,0.1)',
            padding: '4px 10px', borderRadius: '4px',
          }}>
            {member.type === 'startup' ? 'Startup' : 'Contact'}
          </span>
        </div>
        {member.company && (
          <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {member.company} · {member.techArea}
          </div>
        )}
        {!member.company && member.techArea && (
          <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {member.techArea}
          </div>
        )}
      </motion.div>

      {/* Why you're here */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{ marginBottom: '32px', padding: '20px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', borderLeft: '3px solid var(--blue)' }}
      >
        <span className="kicker" style={{ display: 'block', marginBottom: '6px' }}>added by {member.addedByName}</span>
        <p style={{ fontFamily: 'IBM Plex Sans', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
          {member.notes}
        </p>
      </motion.div>

      {/* Events */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Calendar size={14} color="var(--text-faint)" />
          <span className="kicker">your invitations</span>
        </div>

        {myEvents.length === 0 ? (
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-faint)' }}>No upcoming events yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myEvents.map((evt, i) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.06 }}
                className="card"
                style={{ padding: '20px 24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: EVENT_TYPE_COLOR[evt.type], background: `${EVENT_TYPE_COLOR[evt.type]}18`,
                        padding: '2px 7px', borderRadius: '3px',
                      }}>
                        {EVENT_TYPE_LABEL[evt.type]}
                      </span>
                      <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--lime)', letterSpacing: '0.06em' }}>
                        Invited
                      </span>
                    </div>
                    <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '16px', color: 'var(--text)' }}>
                      {evt.title}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>{evt.date}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '8px' }}>
                  <MapPin size={12} color="var(--text-faint)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.06em' }}>{evt.location}</span>
                </div>
                <p style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  {evt.description}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Open pain points */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Lightbulb size={14} color="var(--text-faint)" />
          <span className="kicker">open pain points</span>
        </div>
        <p style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-faint)', marginBottom: '14px', lineHeight: 1.5 }}>
          These are real problems Audi hasn't solved yet. If you have technology that could address one, you're welcome to apply through BRIDGE.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {openPainPoints.map((pp, i) => (
            <motion.div
              key={pp.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 + i * 0.04 }}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: '14px', color: 'var(--text)', lineHeight: 1.3 }}>
                  {pp.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <Users size={11} color="var(--text-faint)" />
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {pp.department}
                  </span>
                </div>
              </div>
              <p style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                {pp.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ marginTop: '24px', padding: '20px 24px', background: 'rgba(200,240,0,0.04)', border: '1px solid rgba(200,240,0,0.2)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}
        >
          <div>
            <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '15px', color: 'var(--text)', marginBottom: '2px' }}>
              See a problem you can solve?
            </div>
            <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-muted)' }}>
              Community members can apply directly. You already know the process.
            </div>
          </div>
          <Link
            to="/login"
            style={{
              fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: '13px',
              color: '#0A0B0D', background: 'var(--lime)', border: 'none',
              padding: '10px 20px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              textDecoration: 'none', whiteSpace: 'nowrap', display: 'inline-block',
            }}
          >
            Apply to BRIDGE
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
