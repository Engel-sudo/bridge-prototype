import type { Owner } from '../store/types'

interface Props {
  owner: Owner
  tag?: 'internal'
  compact?: boolean
}

export default function OwnerCard({ owner, compact }: Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: compact ? 'center' : 'flex-start',
      gap: '14px',
      padding: compact ? '12px' : '16px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
    }}>
      {/* Monogram avatar */}
      <div style={{
        width: compact ? '36px' : '48px',
        height: compact ? '36px' : '48px',
        background: 'var(--surface-2)',
        border: '1px solid var(--lime)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'Archivo',
          fontWeight: 800,
          fontSize: compact ? '13px' : '16px',
          color: 'var(--lime)',
          letterSpacing: '0.05em',
        }}>
          {owner.initials}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
            {owner.name}
          </span>
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--lime)', background: 'rgba(200,240,0,0.1)', padding: '2px 6px', borderRadius: '3px' }}>
            internal
          </span>
        </div>
        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-faint)', marginTop: '2px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {owner.role} · {owner.department}
        </div>
        {!compact && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Implementations</div>
              <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '22px', color: 'var(--lime)' }}>{owner.implementations}</div>
            </div>
            <div>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Startups owned</div>
              <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '22px', color: 'var(--text)' }}>{owner.startupsOwned}</div>
            </div>
            <div>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Avg days to signal</div>
              <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: '22px', color: owner.avgDaysToSignal <= 14 ? 'var(--lime)' : 'var(--amber)' }}>{owner.avgDaysToSignal}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
