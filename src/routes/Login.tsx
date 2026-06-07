import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useBridgeStore } from '../store/store'
import { seedPoolMembers } from '../store/seed'

const SEED_APPS = [
  { id: 'APP-2024-0047', company: 'VisionQual',  founder: 'Jonas Weber',     tech: 'AI quality inspection' },
  { id: 'APP-2024-0031', company: 'FlowRoute',   founder: 'Sarah Bauer',     tech: 'Predictive logistics routing' },
  { id: 'APP-2024-0052', company: 'CarbonLens',  founder: 'Nico Hartmann',   tech: 'Carbon footprint tracking' },
  { id: 'APP-2024-0058', company: 'GridMind',    founder: 'Daniel Kim',      tech: 'Energy load balancing' },
  { id: 'APP-2026-0061', company: 'TorqueIQ',    founder: 'Mara Lindqvist',  tech: 'Torque telemetry' },
  { id: 'APP-2024-0029', company: 'SonoSense',   founder: 'Elena Vogel',     tech: 'Ultrasonic integrity sensors' },
]

type Tile = 'startup' | 'internal_lead' | 'admin' | 'community' | null

export default function Login() {
  const navigate   = useNavigate()
  const login      = useAuthStore(s => s.login)
  const resetDemo  = useBridgeStore(s => s.resetDemo)
  const [expanded, setExpanded] = useState<Tile>(null)

  function handleAdmin() {
    login('admin', {})
    navigate('/dashboard')
  }

  function handleInternalLead() {
    login('internal_lead', { ownerId: 'o3' })
    navigate('/owner')
  }

  function handleStartupApp(appId: string) {
    login('startup', { appId })
    navigate(`/founder/${appId}`)
  }

  function handleNewStartup() {
    login('startup', {})
    navigate('/apply')
  }

  function handleCommunityMember(memberId: string) {
    login('pool_member', { memberId })
    navigate('/community')
  }

  const tileBase: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '24px 28px',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
    textAlign: 'left',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}
      >
        <div style={{ width: '36px', height: '36px', background: 'var(--lime)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: '16px', color: '#0A0B0D' }}>B</span>
        </div>
        <span style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: '20px', color: 'var(--text)', letterSpacing: '0.06em' }}>BRIDGE</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        style={{ textAlign: 'center', marginBottom: '40px' }}
      >
        <h1 style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 'clamp(22px, 4vw, 32px)', color: 'var(--text)', lineHeight: 1.1, marginBottom: '10px' }}>
          Who are you in this system?
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans', fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px' }}>
          Choose your role to enter the view relevant to you.
        </p>
      </motion.div>

      {/* Role tiles */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={{ width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '12px' }}
      >

        {/* ── STARTUP ── */}
        <div
          style={{
            ...tileBase,
            borderColor: expanded === 'startup' ? 'rgba(200,240,0,0.4)' : 'var(--border)',
            background: expanded === 'startup' ? 'rgba(200,240,0,0.03)' : 'var(--surface)',
          }}
        >
          <div
            onClick={() => setExpanded(expanded === 'startup' ? null : 'startup')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--lime)', background: 'rgba(200,240,0,0.1)', border: '1px solid rgba(200,240,0,0.2)', borderRadius: '3px', padding: '2px 7px' }}>Startup</span>
              </div>
              <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '17px', color: 'var(--text)' }}>Founder</div>
              <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Track your application through the BRIDGE pipeline.</div>
            </div>
            <motion.div animate={{ rotate: expanded === 'startup' ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={18} color="var(--text-faint)" />
            </motion.div>
          </div>

          <AnimatePresence>
            {expanded === 'startup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)', marginTop: '16px' }}>
                  <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '10px' }}>
                    Select your startup
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {SEED_APPS.map(app => (
                      <button
                        key={app.id}
                        onClick={() => handleStartupApp(app.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: 'var(--surface-2)', border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)', padding: '10px 14px', cursor: 'pointer',
                          transition: 'border-color 0.15s, background 0.15s', textAlign: 'left', width: '100%',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(200,240,0,0.4)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,240,0,0.04)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)' }}
                      >
                        <div>
                          <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>{app.company}</div>
                          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.06em', marginTop: '1px' }}>{app.founder} · {app.tech}</div>
                        </div>
                        <ArrowRight size={14} color="var(--text-faint)" />
                      </button>
                    ))}

                    {/* Apply as new */}
                    <button
                      onClick={handleNewStartup}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'transparent', border: '1px dashed var(--border)',
                        borderRadius: 'var(--radius-sm)', padding: '10px 14px', cursor: 'pointer',
                        transition: 'border-color 0.15s', textAlign: 'left', width: '100%', marginTop: '2px',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(200,240,0,0.4)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)' }}
                    >
                      <div>
                        <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: '13px', color: 'var(--lime)' }}>Apply as new startup</div>
                        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.06em', marginTop: '1px' }}>Submit a new application to BRIDGE</div>
                      </div>
                      <ArrowRight size={14} color="var(--lime)" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── INTERNAL LEAD ── */}
        <button
          onClick={handleInternalLead}
          style={{
            ...tileBase,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', border: '1px solid var(--border)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.4)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.03)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--blue)', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '3px', padding: '2px 7px' }}>Audi</span>
            </div>
            <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '17px', color: 'var(--text)' }}>Internal Lead</div>
            <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Manage your startup queue and match pain points.</div>
          </div>
          <ArrowRight size={18} color="var(--text-faint)" />
        </button>

        {/* ── COMMUNITY ── */}
        <div
          style={{
            ...tileBase,
            borderColor: expanded === 'community' ? 'rgba(59,130,246,0.4)' : 'var(--border)',
            background: expanded === 'community' ? 'rgba(59,130,246,0.03)' : 'var(--surface)',
          }}
        >
          <div
            onClick={() => setExpanded(expanded === 'community' ? null : 'community')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--blue)', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '3px', padding: '2px 7px' }}>Community</span>
              </div>
              <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '17px', color: 'var(--text)' }}>Pool Member</div>
              <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Access events and open pain points in the BRIDGE network.</div>
            </div>
            <motion.div animate={{ rotate: expanded === 'community' ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={18} color="var(--text-faint)" />
            </motion.div>
          </div>

          <AnimatePresence>
            {expanded === 'community' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)', marginTop: '16px' }}>
                  <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '10px' }}>
                    Select your profile
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {seedPoolMembers.map(member => (
                      <button
                        key={member.id}
                        onClick={() => handleCommunityMember(member.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: 'var(--surface-2)', border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)', padding: '10px 14px', cursor: 'pointer',
                          transition: 'border-color 0.15s, background 0.15s', textAlign: 'left', width: '100%',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.4)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.04)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)' }}
                      >
                        <div>
                          <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>{member.name}{member.company ? ` · ${member.company}` : ''}</div>
                          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.06em', marginTop: '1px' }}>{member.type === 'startup' ? 'Redirected startup' : 'Contact'} · {member.techArea}</div>
                        </div>
                        <ArrowRight size={14} color="var(--text-faint)" />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── ADMIN ── */}
        <button
          onClick={handleAdmin}
          style={{
            ...tileBase,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', border: '1px solid var(--border)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,158,11,0.4)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.03)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--amber)', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '3px', padding: '2px 7px' }}>System</span>
            </div>
            <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '17px', color: 'var(--text)' }}>Admin</div>
            <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Full system overview — Dashboard, all pipelines, all data.</div>
          </div>
          <ArrowRight size={18} color="var(--text-faint)" />
        </button>

      </motion.div>

      {/* Reset demo note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        style={{ marginTop: '32px', textAlign: 'center' }}
      >
        <button
          onClick={() => { resetDemo(); setExpanded(null) }}
          style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-faint)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
        >
          Reset demo data
        </button>
      </motion.div>
    </div>
  )
}
