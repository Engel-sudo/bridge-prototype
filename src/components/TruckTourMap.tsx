import { motion } from 'framer-motion'
import type { TruckStop, TruckStopStatus } from '../store/types'

// Stylized, dependency-free silhouette of Germany. Pins are positioned by
// percentage over this box (see TruckStop.x / .y), so the same coordinates work
// at any rendered size. viewBox is ~100×130 to match Germany's tall aspect.
const GERMANY_PATH =
  'M45 8 L52 6 L50 16 L58 15 L60 10 L72 16 L78 22 L74 30 L80 40 L78 52 ' +
  'L70 58 L64 68 L66 80 L58 92 L48 94 L40 88 L34 84 L30 74 L28 60 L22 50 ' +
  'L16 46 L20 40 L16 34 L26 30 L30 22 L28 16 L38 16 L40 10 Z'

const STATUS_COLOR: Record<TruckStopStatus, string> = {
  past: 'var(--text-faint)',
  current: 'var(--accent)',
  upcoming: 'var(--blue)',
}

interface Props {
  stops: TruckStop[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  /** Admin click-to-place: reports the clicked point as map percentages. */
  onPlace?: (x: number, y: number) => void
  placing?: boolean
}

export default function TruckTourMap({ stops, selectedId, onSelect, onPlace, placing }: Props) {
  function handleMapClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!placing || !onPlace) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10
    onPlace(x, y)
  }

  return (
    <div
      onClick={handleMapClick}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
        margin: '0 auto',
        aspectRatio: '100 / 130',
        cursor: placing ? 'crosshair' : 'default',
      }}
    >
      <svg viewBox="0 0 100 130" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
        <path
          d={GERMANY_PATH}
          fill="var(--surface)"
          stroke="var(--border-strong)"
          strokeWidth={1}
          strokeLinejoin="round"
        />
      </svg>

      {/* Pins */}
      {stops.map((stop) => {
        const color = STATUS_COLOR[stop.status]
        const isSelected = stop.id === selectedId
        const isCurrent = stop.status === 'current'
        return (
          <button
            key={stop.id}
            onClick={(e) => { e.stopPropagation(); onSelect?.(stop.id) }}
            aria-label={`${stop.city} — ${stop.status}`}
            title={`${stop.city} · ${stop.date}`}
            style={{
              position: 'absolute',
              left: `${stop.x}%`,
              top: `${stop.y}%`,
              transform: 'translate(-50%, -50%)',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              lineHeight: 0,
            }}
          >
            {/* Pulsing halo for the current stop */}
            {isCurrent && (
              <motion.span
                animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                style={{
                  position: 'absolute', left: '50%', top: '50%',
                  width: '14px', height: '14px', transform: 'translate(-50%, -50%)',
                  borderRadius: '50%', background: color,
                }}
              />
            )}
            <span
              style={{
                display: 'block',
                position: 'relative',
                width: isCurrent ? '14px' : '11px',
                height: isCurrent ? '14px' : '11px',
                borderRadius: '50%',
                background: stop.status === 'past' ? 'var(--bg)' : color,
                border: `2px solid ${color}`,
                boxShadow: isSelected ? `0 0 0 3px color-mix(in srgb, ${color} 35%, transparent)` : 'none',
                transition: 'box-shadow 0.15s',
              }}
            />
          </button>
        )
      })}
    </div>
  )
}
