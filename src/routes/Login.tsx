import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useBridgeStore } from '../store/store'

const SAMPLE_APP_IDS = new Set([
  'APP-2024-0047', 'APP-2024-0031', 'APP-2024-0052',
  'APP-2024-0058', 'APP-2026-0061', 'APP-2024-0029',
])

const SAMPLE_MEMBER_IDS = new Set(['pm1', 'pm2'])

type Tile = 'startup' | 'internal_lead' | 'admin' | 'community' | 'floor_worker' | null

export default function Login() {
  const navigate     = useNavigate()
  const login        = useAuthStore(s => s.login)
  const resetDemo    = useBridgeStore(s => s.resetDemo)
  const applications = useBridgeStore(s => s.applications)
  const poolMembers  = useBridgeStore(s => s.poolMembers)
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

  function handleFloorWorker() {
    login('floor_worker', {})
    navigate('/floor')
  }

  function handleFounderSubmit() {
    const trimmed = founderName.trim()
    const match = applications.find(a => a.founderName.toLowerCase() === trimmed.toLowerCase())
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
      padding: '80px 24px 40px',
    }}>
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '48px' }}
      >
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--accent)', borderRadius: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '16px', color: 'var(--accent-contrast)' }}>B</span>
          </div>
          <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '22px', color: 'var(--text)' }}>BRIDGE</span>
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        style={{ textAlign: 'center', marginBottom: '40px' }}
      >
        <h1 style={{ fontFamily: "'AudiType Extended', 'AudiType', sans-serif", fontWeight: 700, fontSize: 'clamp(22px, 4vw, 32px)', color: 'var(--text)', lineHeight: 1.15, marginBottom: '10px' }}>
          Choose a perspective
        </h1>
        <p style={{ fontFamily: 'AudiType', fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px' }}>
          Pick a role to explore BRIDGE from that side.
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
            borderColor: expanded === 'startup' ? 'var(--accent)' : 'var(--border)',
            background: expanded === 'startup' ? 'var(--accent-dim)' : 'var(--surface)',
          }}
        >
          <div
            onClick={() => setExpanded(expanded === 'startup' ? null : 'startup')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--border-strong)', borderRadius: '0', padding: '2px 7px' }}>Startup</span>
              </div>
              <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '17px', color: 'var(--text)' }}>Founder</div>
              <div style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Track your application through the BRIDGE pipeline.</div>
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
                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* ── Apply now (primary) ── */}
                  <div>
                    <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginBottom: '10px' }}>
                      New to BRIDGE?
                    </div>
                    <button
                      onClick={handleNewStartup}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', background: 'var(--accent-dim)', textAlign: 'left',
                        border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)',
                        padding: '14px 18px', cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-dim)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-dim)' }}
                    >
                      <div>
                        <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '15px', color: 'var(--accent)' }}>Apply now</div>
                        <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginTop: '2px' }}>48h to a name · 2 weeks to a decision</div>
                      </div>
                      <ArrowRight size={16} color="var(--accent)" />
                    </button>
                  </div>

                  {/* Divider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>Already applied?</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                  </div>

                  {/* ── Login as existing founder ── */}
                  <div>
                    <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginBottom: '10px' }}>
                      Log in as existing founder
                    </div>

                    {/* Name input */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        ref={inputRef}
                        type="text"
                        value={founderName}
                        placeholder="Enter your name"
                        onChange={e => { setFounderName(e.target.value); setFounderError(false) }}
                        onKeyDown={e => { if (e.key === 'Enter') handleFounderSubmit() }}
                        style={{
                          flex: 1, fontFamily: 'AudiType', fontSize: '14px', color: 'var(--text)',
                          background: 'var(--surface-2)', border: `1px solid ${founderError ? 'var(--red)' : 'var(--border)'}`,
                          borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                          outline: 'none', transition: 'border-color 0.15s',
                        }}
                        onFocus={e => { if (!founderError) (e.target as HTMLInputElement).style.borderColor = 'var(--accent)' }}
                        onBlur={e => { if (!founderError) (e.target as HTMLInputElement).style.borderColor = 'var(--border)' }}
                      />
                      <button
                        onClick={handleFounderSubmit}
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)',
                          padding: '10px 18px', cursor: 'pointer', transition: 'opacity 0.15s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                      >
                        <ArrowRight size={16} color="var(--accent-contrast)" />
                      </button>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {founderError && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          style={{ marginTop: '8px', fontFamily: 'AudiType', fontSize: '13px', color: 'var(--red)' }}
                        >
                          No application found for "{founderName}".
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Name chips — sample accounts only; others log in via the text input */}
                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {applications.filter(a => SAMPLE_APP_IDS.has(a.id)).map(app => (
                        <button
                          key={app.id}
                          onClick={() => { login('startup', { appId: app.id }); navigate(`/founder/${app.id}`) }}
                          style={{
                            fontFamily: 'AudiType', fontSize: '12px', fontWeight: 500,
                            color: 'var(--text-muted)', background: 'var(--surface-2)',
                            border: '1px solid var(--border)', borderRadius: '0',
                            padding: '5px 12px', cursor: 'pointer', transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => {
                            const b = e.currentTarget as HTMLButtonElement
                            b.style.borderColor = 'var(--accent)'
                            b.style.color = 'var(--text)'
                            b.style.background = 'var(--accent-dim)'
                          }}
                          onMouseLeave={e => {
                            const b = e.currentTarget as HTMLButtonElement
                            b.style.borderColor = 'var(--border)'
                            b.style.color = 'var(--text-muted)'
                            b.style.background = 'var(--surface-2)'
                          }}
                        >
                          {app.founderName}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── INTERNAL LEAD ── */}
        <div
          style={{
            ...tileBase,
            borderColor: expanded === 'internal_lead' ? 'rgba(59,130,246,0.4)' : 'var(--border)',
            background: expanded === 'internal_lead' ? 'rgba(59,130,246,0.03)' : 'var(--surface)',
          }}
        >
          <div
            onClick={() => setExpanded(expanded === 'internal_lead' ? null : 'internal_lead')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--blue)', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '0', padding: '2px 7px' }}>Audi</span>
              </div>
              <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '17px', color: 'var(--text)' }}>Internal Lead</div>
              <div style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Manage your startup queue and match pain points.</div>
            </div>
            <motion.div animate={{ rotate: expanded === 'internal_lead' ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={18} color="var(--text-faint)" />
            </motion.div>
          </div>

          <AnimatePresence>
            {expanded === 'internal_lead' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)', marginTop: '16px' }}>
                  <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '14px' }}>
                    Review incoming applications, claim startups, advance pipeline stages, and send the final Go or Redirect decision.
                  </p>
                  <button
                    onClick={handleInternalLead}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', background: 'rgba(59,130,246,0.08)', textAlign: 'left',
                      border: '1px solid rgba(59,130,246,0.35)', borderRadius: 'var(--radius-sm)',
                      padding: '12px 18px', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.14)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.08)' }}
                  >
                    <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '15px', color: 'var(--blue)' }}>Enter</span>
                    <ArrowRight size={16} color="var(--blue)" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── FLOOR WORKER ── */}
        <div
          style={{
            ...tileBase,
            borderColor: expanded === 'floor_worker' ? 'rgba(59,130,246,0.4)' : 'var(--border)',
            background: expanded === 'floor_worker' ? 'rgba(59,130,246,0.03)' : 'var(--surface)',
          }}
        >
          <div
            onClick={() => setExpanded(expanded === 'floor_worker' ? null : 'floor_worker')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--blue)', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '0', padding: '2px 7px' }}>Audi</span>
              </div>
              <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '17px', color: 'var(--text)' }}>Floor Worker</div>
              <div style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Report a pain point from the shop floor in seconds.</div>
            </div>
            <motion.div animate={{ rotate: expanded === 'floor_worker' ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={18} color="var(--text-faint)" />
            </motion.div>
          </div>

          <AnimatePresence>
            {expanded === 'floor_worker' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)', marginTop: '16px' }}>
                  <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '14px' }}>
                    A simple form to flag a problem you've spotted on the line — no login friction, no manager approval needed.
                  </p>
                  <button
                    onClick={handleFloorWorker}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', background: 'rgba(59,130,246,0.08)', textAlign: 'left',
                      border: '1px solid rgba(59,130,246,0.35)', borderRadius: 'var(--radius-sm)',
                      padding: '12px 18px', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.14)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.08)' }}
                  >
                    <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '15px', color: 'var(--blue)' }}>Enter</span>
                    <ArrowRight size={16} color="var(--blue)" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
                <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--blue)', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '0', padding: '2px 7px' }}>Community</span>
              </div>
              <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '17px', color: 'var(--text)' }}>Community</div>
              <div style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Access events and open pain points in the BRIDGE community.</div>
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
                  <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginBottom: '10px' }}>
                    Select your profile
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {poolMembers.filter(m => SAMPLE_MEMBER_IDS.has(m.id)).map(member => (
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
                          <div style={{ fontFamily: 'AudiType', fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>{member.name}{member.company ? ` · ${member.company}` : ''}</div>
                          <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginTop: '1px' }}>{member.type === 'startup' ? 'Redirected startup' : 'Contact'} · {member.techArea}</div>
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
        <div
          style={{
            ...tileBase,
            borderColor: expanded === 'admin' ? 'var(--amber)' : 'var(--border)',
            background: expanded === 'admin' ? 'rgba(245,158,11,0.03)' : 'var(--surface)',
          }}
        >
          <div
            onClick={() => setExpanded(expanded === 'admin' ? null : 'admin')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--amber)', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '0', padding: '2px 7px' }}>System</span>
              </div>
              <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '17px', color: 'var(--text)' }}>Admin</div>
              <div style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Full system overview — Dashboard, all pipelines, all data.</div>
            </div>
            <motion.div animate={{ rotate: expanded === 'admin' ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={18} color="var(--text-faint)" />
            </motion.div>
          </div>

          <AnimatePresence>
            {expanded === 'admin' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)', marginTop: '16px' }}>
                  <p style={{ fontFamily: 'AudiType', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '14px' }}>
                    Full system overview — see all applications, pain points, and metrics across BRIDGE.
                  </p>
                  <button
                    onClick={handleAdmin}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', background: 'rgba(245,158,11,0.08)', textAlign: 'left',
                      border: '1px solid rgba(245,158,11,0.35)', borderRadius: 'var(--radius-sm)',
                      padding: '12px 18px', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.14)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.08)' }}
                  >
                    <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '15px', color: 'var(--amber)' }}>Enter</span>
                    <ArrowRight size={16} color="var(--amber)" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
          style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
        >
          Reset demo data
        </button>
      </motion.div>
    </div>
  )
}
