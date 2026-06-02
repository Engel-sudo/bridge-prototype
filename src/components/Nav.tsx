import { Link, useLocation } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { useBridgeStore } from '../store/store'

const links = [
  { to: '/', label: 'The Door', mono: 'public' },
  { to: '/founder', label: 'Founder', mono: 'status' },
  { to: '/owner', label: 'Owner', mono: 'console' },
  { to: '/map', label: 'Map', mono: 'pain points' },
  { to: '/dashboard', label: 'Dashboard', mono: 'system' },
]

export default function Nav() {
  const { pathname } = useLocation()
  const resetDemo = useBridgeStore(s => s.resetDemo)

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'rgba(10,11,13,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      height: '56px',
      gap: '8px',
    }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginRight: '24px' }}>
        <div style={{
          width: '28px', height: '28px',
          background: 'var(--lime)',
          borderRadius: '4px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: '13px', color: '#0A0B0D', letterSpacing: '0.05em' }}>B</span>
        </div>
        <span style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '15px', color: 'var(--text)', letterSpacing: '0.08em' }}>BRIDGE</span>
      </Link>

      {links.map(({ to, label, mono }) => {
        const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
        return (
          <Link
            key={to}
            to={to}
            style={{
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: active ? '1px solid var(--lime)' : '1px solid transparent',
              background: active ? 'rgba(200,240,0,0.08)' : 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '1px',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: active ? 'var(--lime)' : 'var(--text-faint)' }}>
              {mono}
            </span>
            <span style={{ fontFamily: 'IBM Plex Sans', fontSize: '13px', fontWeight: 500, color: active ? 'var(--text)' : 'var(--text-muted)' }}>
              {label}
            </span>
          </Link>
        )
      })}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={resetDemo}
          title="Reset demo state"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
            fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--text-faint)', background: 'transparent', border: '1px solid var(--border-strong)',
            padding: '5px 10px', borderRadius: 'var(--radius-sm)', transition: 'all 0.15s',
          }}
        >
          <RotateCcw size={11} />
          Reset
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--lime)', boxShadow: '0 0 6px var(--lime)' }} />
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em' }}>PROTOTYPE · CCC7</span>
        </div>
      </div>
    </nav>
  )
}
