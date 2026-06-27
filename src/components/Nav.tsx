import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { RotateCcw, LogOut, Sun, Moon } from 'lucide-react'
import { useBridgeStore } from '../store/store'
import { useAuthStore } from '../store/authStore'
import { canAccessCommunity, hasStartupProfile } from '../store/derive'
import { useTheme } from '../theme'
import type { PoolMember } from '../store/types'

const ALL_LINKS = [
  { to: '/dashboard',  label: 'Dashboard',     mono: 'system',       roles: ['admin'],                          requiresAppId: null },
  { to: '/owner',      label: 'My Queue',       mono: 'internal lead',roles: ['internal_lead', 'admin'],         requiresAppId: null },
  { to: '/map',        label: 'Pain Map',       mono: 'pain points',  roles: ['internal_lead', 'admin'],         requiresAppId: null },
  { to: '/community',  label: 'Community',      mono: 'community',    roles: ['internal_lead', 'admin'],         requiresAppId: null },
  // Apply: startup only, and only when they have NO existing application yet
  { to: '/apply',      label: 'Apply',          mono: 'startup',      roles: ['startup'],                        requiresAppId: false },
  // My Application: startup only, and only when they DO have an existing application
  { to: '/founder',    label: 'My Application', mono: 'status',       roles: ['startup'],                        requiresAppId: true },
  { to: '/startup',    label: 'My Profile',     mono: 'profile',      roles: ['startup'],                        requiresAppId: true },
  { to: '/community',  label: 'Community',      mono: 'community',    roles: ['pool_member'],                    requiresAppId: null },
  { to: '/floor',      label: 'Report',         mono: 'floor',        roles: ['floor_worker'],                    requiresAppId: null },
]

function roleBadge(role: string | null, selectedAppId: string | null, selectedOwnerId: string | null, selectedMemberId: string | null, poolMembers: PoolMember[], applications: import('../store/types').Application[]) {
  if (!role) return null
  if (role === 'admin') return { label: 'Admin', color: 'var(--amber)', bg: 'transparent', border: 'var(--border-strong)' }
  if (role === 'internal_lead') return { label: 'Internal Lead · Lukas Reinhardt', color: 'var(--blue)', bg: 'transparent', border: 'var(--border-strong)' }
  if (role === 'startup') {
    const app = selectedAppId ? applications.find(a => a.id === selectedAppId) : null
    const name = app ? app.companyName : 'New Application'
    return { label: `Startup · ${name}`, color: 'var(--text)', bg: 'var(--accent-dim)', border: 'var(--border-strong)' }
  }
  if (role === 'pool_member') {
    const member = poolMembers.find(m => m.id === selectedMemberId)
    const name = member ? member.name : ''
    return { label: `Community${name ? ` · ${name}` : ''}`, color: 'var(--blue)', bg: 'transparent', border: 'var(--border-strong)' }
  }
  if (role === 'floor_worker') return { label: 'Floor Worker', color: 'var(--blue)', bg: 'transparent', border: 'var(--border-strong)' }
  return null
}

export default function Nav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const resetDemo = useBridgeStore(s => s.resetDemo)
  const poolMembers = useBridgeStore(s => s.poolMembers)
  const applications = useBridgeStore(s => s.applications)
  const { role, selectedAppId, selectedOwnerId, selectedMemberId, logout } = useAuthStore()
  const { theme, toggleTheme } = useTheme()

  // Minimal public header for landing, login and the public tour pages
  if (pathname === '/' || pathname === '/login' || pathname === '/tour') {
    return (
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'color-mix(in srgb, var(--bg) 92%, transparent)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 32px', height: '56px',
      }}>
        <Link to={pathname === '/' ? '/login' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'var(--accent)', borderRadius: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '13px', color: 'var(--accent-contrast)' }}>B</span>
          </div>
          <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>BRIDGE</span>
        </Link>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            style={{
              display: 'inline-flex', alignItems: 'center', cursor: 'pointer',
              color: 'var(--text-muted)', background: 'transparent',
              border: '1px solid var(--border)', padding: '7px 9px',
              borderRadius: 'var(--radius-sm)', transition: 'all 0.15s',
            }}
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
          {pathname !== '/login' && (
            <Link to="/login" style={{
              textDecoration: 'none', fontFamily: 'AudiType', fontSize: '13px',
              color: 'var(--text-muted)', border: '1px solid var(--border)',
              padding: '6px 14px', transition: 'all 0.15s',
            }}>
              Log in
            </Link>
          )}
        </div>
      </nav>
    )
  }

  // Accepted founders earn community access — surface the link once their
  // application reaches the Go decision (or beyond).
  const founderApp = role === 'startup' && selectedAppId
    ? applications.find(a => a.id === selectedAppId)
    : null

  const visibleLinks = ALL_LINKS.filter(l => {
    if (!role || !l.roles.includes(role)) return false
    if (l.requiresAppId === true  && !selectedAppId) return false
    if (l.requiresAppId === false &&  selectedAppId) return false
    // "My Profile" only exists for startups whose application has a profile page;
    // showing it earlier dead-ends on the StartupProfile redirect.
    if (l.to === '/startup' && !(founderApp && hasStartupProfile(founderApp.stage))) return false
    return true
  })
  if (founderApp && canAccessCommunity(founderApp.stage)) {
    visibleLinks.push({ to: '/community', label: 'Community', mono: 'community', roles: ['startup'], requiresAppId: null })
  }
  const badge = roleBadge(role, selectedAppId, selectedOwnerId, selectedMemberId, poolMembers, applications)

  // For startup: "My Application" links to their specific app if they have one
  function resolvedTo(to: string) {
    if (to === '/founder' && role === 'startup' && selectedAppId) return `/founder/${selectedAppId}`
    if (to === '/startup' && role === 'startup' && selectedAppId) return `/startup/${selectedAppId}`
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
      background: 'color-mix(in srgb, var(--bg) 92%, transparent)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 16px', height: '56px', gap: '8px',
      overflowX: 'auto', WebkitOverflowScrolling: 'touch',
    }}>
      {/* Logo */}
      <Link to="/login"
        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px', flexShrink: 0, cursor: 'pointer' }}>
        <div style={{ width: '28px', height: '28px', background: 'var(--accent)', borderRadius: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '13px', color: 'var(--accent-contrast)' }}>B</span>
        </div>
        <span style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>BRIDGE</span>
      </Link>

      {/* Role-scoped links */}
      {visibleLinks.map(({ to, label }) => {
        const href = resolvedTo(to)
        const active = to === '/founder' ? pathname.startsWith('/founder')
          : to === '/startup' ? pathname.startsWith('/startup')
          : pathname.startsWith(to)
        return (
          <Link key={to} to={href} style={{
            textDecoration: 'none', padding: '6px 14px', borderRadius: 'var(--radius-sm)',
            border: active ? '1px solid var(--accent)' : '1px solid transparent',
            background: active ? 'var(--accent-dim)' : 'transparent',
            transition: 'all 0.15s', flexShrink: 0, whiteSpace: 'nowrap',
          }}>
            <span style={{ fontFamily: 'AudiType', fontSize: '13px', fontWeight: 500, color: active ? 'var(--text)' : 'var(--text-muted)' }}>{label}</span>
          </Link>
        )
      })}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {/* Light/dark toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          style={{
            display: 'inline-flex', alignItems: 'center', cursor: 'pointer',
            color: 'var(--text-muted)', background: 'transparent',
            border: '1px solid var(--border)', padding: '7px 9px',
            borderRadius: 'var(--radius-sm)', transition: 'all 0.15s',
          }}
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>

        {/* Role badge */}
        {badge && (
          <span style={{
            fontFamily: 'AudiType', fontSize: '11px',
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
            aria-label="Reset demo data"
            style={{
              display: 'inline-flex', alignItems: 'center', cursor: 'pointer',
              color: 'var(--text-faint)', background: 'transparent',
              border: '1px solid var(--border)', padding: '7px 9px',
              borderRadius: 'var(--radius-sm)', transition: 'all 0.15s',
            }}
          >
            <RotateCcw size={14} />
          </button>
        )}

        {/* Log out */}
        {role ? (
          <button
            onClick={handleLogout}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--red-dim)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
              fontFamily: 'AudiType', fontSize: '11px',
              color: 'var(--red)', background: 'transparent',
              border: '1px solid var(--red)',
              padding: '5px 10px', borderRadius: 'var(--radius-sm)', transition: 'all 0.15s',
            }}
          >
            <LogOut size={11} />
            Log out
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
            <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>Prototype · CCC7</span>
          </div>
        )}
      </div>
    </nav>
  )
}
