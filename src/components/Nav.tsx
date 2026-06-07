import { Link, useLocation, useNavigate } from 'react-router-dom'
import { RotateCcw, LogOut } from 'lucide-react'
import { useBridgeStore } from '../store/store'
import { useAuthStore } from '../store/authStore'
import { seedApplications } from '../store/seed'

const ALL_LINKS = [
  { to: '/dashboard', label: 'Dashboard',     mono: 'system',       roles: ['admin'],          requiresAppId: null },
  { to: '/owner',     label: 'My Queue',       mono: 'internal lead',roles: ['internal_lead', 'admin'], requiresAppId: null },
  { to: '/map',       label: 'Pain Map',       mono: 'pain points',  roles: ['internal_lead', 'admin'], requiresAppId: null },
  // Apply: startup only, and only when they have NO existing application yet
  { to: '/apply',     label: 'Apply',          mono: 'startup',      roles: ['startup'],        requiresAppId: false },
  // My Application: startup only, and only when they DO have an existing application
  { to: '/founder',   label: 'My Application', mono: 'status',       roles: ['startup'],        requiresAppId: true },
]

function roleBadge(role: string | null, selectedAppId: string | null, selectedOwnerId: string | null) {
  if (!role) return null
  if (role === 'admin') return { label: 'ADMIN', color: 'var(--amber)', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' }
  if (role === 'internal_lead') return { label: 'INTERNAL LEAD · Lukas Reinhardt', color: 'var(--blue)', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)' }
  if (role === 'startup') {
    const app = selectedAppId ? seedApplications.find(a => a.id === selectedAppId) : null
    const name = app ? app.companyName : 'New Application'
    return { label: `STARTUP · ${name}`, color: 'var(--lime)', bg: 'rgba(200,240,0,0.08)', border: 'rgba(200,240,0,0.25)' }
  }
  return null
}

export default function Nav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const resetDemo = useBridgeStore(s => s.resetDemo)
  const { role, selectedAppId, selectedOwnerId, logout } = useAuthStore()

  // Hide nav entirely on login screen
  if (pathname === '/login') return null

  const visibleLinks = ALL_LINKS.filter(l => {
    if (role && !l.roles.includes(role)) return false
    if (l.requiresAppId === true  && !selectedAppId) return false
    if (l.requiresAppId === false &&  selectedAppId) return false
    return true
  })
  const badge = roleBadge(role, selectedAppId, selectedOwnerId)

  // For startup: "My Application" links to their specific app if they have one
  function resolvedTo(to: string) {
    if (to === '/founder' && role === 'startup' && selectedAppId) return `/founder/${selectedAppId}`
    return to
  }

  function handleLogout() {
    logout()
    resetDemo()
    navigate('/login')
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(10,11,13,0.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 32px', height: '56px', gap: '8px',
    }}>
      {/* Logo */}
      <Link to={role === 'admin' ? '/dashboard' : role === 'internal_lead' ? '/owner' : role === 'startup' ? (selectedAppId ? `/founder/${selectedAppId}` : '/apply') : '/login'}
        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginRight: '24px' }}>
        <div style={{ width: '28px', height: '28px', background: 'var(--lime)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: '13px', color: '#0A0B0D', letterSpacing: '0.05em' }}>B</span>
        </div>
        <span style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '15px', color: 'var(--text)', letterSpacing: '0.08em' }}>BRIDGE</span>
      </Link>

      {/* Role-scoped links */}
      {visibleLinks.map(({ to, label, mono }) => {
        const href = resolvedTo(to)
        const active = to === '/founder' ? pathname.startsWith('/founder') : pathname.startsWith(to)
        return (
          <Link key={to} to={href} style={{
            textDecoration: 'none', padding: '6px 14px', borderRadius: 'var(--radius-sm)',
            border: active ? '1px solid var(--lime)' : '1px solid transparent',
            background: active ? 'rgba(200,240,0,0.08)' : 'transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px', transition: 'all 0.15s',
          }}>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: active ? 'var(--lime)' : 'var(--text-faint)' }}>{mono}</span>
            <span style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', fontWeight: 500, color: active ? 'var(--text)' : 'var(--text-muted)' }}>{label}</span>
          </Link>
        )
      })}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Role badge */}
        {badge && (
          <span style={{
            fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: badge.color, background: badge.bg, border: `1px solid ${badge.border}`,
            padding: '4px 10px', borderRadius: 'var(--radius-sm)', whiteSpace: 'nowrap',
          }}>
            {badge.label}
          </span>
        )}

        {/* Reset data (keep role) */}
        {role && (
          <button
            onClick={resetDemo}
            title="Reset demo data (stay logged in)"
            style={{
              display: 'inline-flex', alignItems: 'center', cursor: 'pointer',
              color: 'var(--text-faint)', background: 'transparent',
              border: '1px solid var(--border)', padding: '5px 8px',
              borderRadius: 'var(--radius-sm)', transition: 'all 0.15s',
            }}
          >
            <RotateCcw size={11} />
          </button>
        )}

        {/* Log out */}
        {role ? (
          <button
            onClick={handleLogout}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
              fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--text-faint)', background: 'transparent', border: '1px solid var(--border)',
              padding: '5px 10px', borderRadius: 'var(--radius-sm)', transition: 'all 0.15s',
            }}
          >
            <LogOut size={11} />
            Log out
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--lime)', boxShadow: '0 0 6px var(--lime)' }} />
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em' }}>PROTOTYPE · CCC7</span>
          </div>
        )}
      </div>
    </nav>
  )
}
