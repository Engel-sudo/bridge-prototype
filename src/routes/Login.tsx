import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  const [founderName, setFounderName] = useState('')
  const [founderError, setFounderError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleAdmin() {
    login('admin', {})
    navigate('/dashboard')
  }

  function handleInternalLead() {
    login('internal_lead', { ownerId: 'o3' })
    navigate('/owner')
  }

  function handleFounderSubmit() {
    const trimmed = founderName.trim()
    const match = SEED_APPS.find(a => a.founder.toLowerCase() === trimmed.toLowerCase())
    if (match) {
      login('startup', { appId: match.id })
      navigate(`/founder/${match.id}`)
    } else if (trimmed === '') {
      inputRef.current?.focus()
    } else {
      setFounderError(true)
    }
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
        style={{ marginBottom: '48px' }}
      >
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--lime)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: '16px', color: '#0A0B0D' }}>B</span>
          </div>
          <span style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: '20px', color: 'var(--text)', letterSpacing: '0.06em' }}>BRIDGE</span>
        </Link>
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
                  <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '12px' }}>
                    Enter your name
                  </div>

                  {/* Name input row */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={founderName}
                      placeholder="e.g. Jonas Weber"
                      onChange={e => { setFounderName(e.target.value); setFounderError(false) }}
                      onKeyDown={e => { if (e.key === 'Enter') handleFounderSubmit() }}
                      style={{
                        flex: 1, fontFamily: 'IBM Plex Sans', fontSize: '14px', color: 'var(--text)',
                        background: 'var(--surface-2)', border: `1px solid ${founderError ? 'var(--red)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                        outline: 'none', transition: 'border-color 0.15s',
                      }}
                      onFocus={e => { if (!founderError) (e.target as HTMLInputElement).style.borderColor = 'rgba(200,240,0,0.5)' }}
                      onBlur={e => { if (!founderError) (e.target as HTMLInputElement).style.borderColor = 'var(--border)' }}
                      autoFocus
                    />
                    <button
                      onClick={handleFounderSubmit}
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--lime)', border: 'none', borderRadius: 'var(--radius-sm)',
                        padding: '10px 18px', cursor: 'pointer', transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                    >
                      <ArrowRight size={16} color="#0A0B0D" />
                    </button>
                  </div>

                  {/* Error state */}
                  <AnimatePresence>
                    {founderError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{ marginTop: '10px' }}
                      >
                        <div style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', color: 'var(--red)', marginBottom: '10px' }}>
                          No application found for "{founderName}".
                        </div>
                        <button
                          onClick={handleNewStartup}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: 'transparent', border: '1px dashed var(--border)',
                            borderRadius: 'var(--radius-sm)', padding: '10px 14px', cursor: 'pointer',
                            transition: 'border-color 0.15s', textAlign: 'left', width: '100%',
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
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Quick-pick name chips */}
                  {!founderError && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '8px' }}>
                        Or pick a name
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {SEED_APPS.map(app => (
                          <button
                            key={app.id}
                            onClick={() => { login('startup', { appId: app.id }); navigate(`/founder/${app.id}`) }}
                            style={{
                              fontFamily: 'IBM Plex Sans', fontSize: '12px', fontWeight: 500,
                              color: 'var(--text-muted)', background: 'var(--surface-2)',
                              border: '1px solid var(--border)', borderRadius: '20px',
                              padding: '5px 12px', cursor: 'pointer', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => {
                              const b = e.currentTarget as HTMLButtonElement
                              b.style.borderColor = 'rgba(200,240,0,0.5)'
                              b.style.color = 'var(--text)'
                              b.style.background = 'rgba(200,240,0,0.06)'
                            }}
                            onMouseLeave={e => {
                              const b = e.currentTarget as HTMLButtonElement
                              b.style.borderColor = 'var(--border)'
                              b.style.color = 'var(--text-muted)'
                              b.style.background = 'var(--surface-2)'
                            }}
                          >
                            {app.founder}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleNewStartup}
                        style={{
                          marginTop: '10px', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                          fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)',
                          letterSpacing: '0.08em', textDecoration: 'underline', textUnderlineOffset: '3px',
                        }}
                      >
                        No application yet? Apply as a new startup →
                      </button>
                    </div>
                  )}
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
