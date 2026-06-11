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
        border: '1px solid var(--accent)',
        borderRadius: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'AudiType',
          fontWeight: 700,
          fontSize: compact ? '13px' : '16px',
          color: 'var(--accent)',
         
        }}>
          {owner.initials}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'AudiType', fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
            {owner.name}
          </span>
          <span style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 6px', borderRadius: '0' }}>
            internal
          </span>
        </div>
        <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)', marginTop: '2px' }}>
          {owner.role} · {owner.department}
        </div>
        {!compact && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>Implementations</div>
              <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '22px', color: 'var(--accent)' }}>{owner.implementations}</div>
            </div>
            <div>
              <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>Startups owned</div>
              <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '22px', color: 'var(--text)' }}>{owner.startupsOwned}</div>
            </div>
            <div>
              <div style={{ fontFamily: 'AudiType', fontSize: '11px', color: 'var(--text-faint)' }}>Avg days to decision</div>
              <div style={{ fontFamily: 'AudiType', fontWeight: 700, fontSize: '22px', color: owner.avgDaysToSignal <= 14 ? 'var(--accent)' : 'var(--amber)' }}>{owner.avgDaysToSignal}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
