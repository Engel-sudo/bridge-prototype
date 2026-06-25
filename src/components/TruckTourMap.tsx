import { motion } from 'framer-motion'
import type { TruckStop, TruckStopStatus } from '../store/types'

/**
 * Accurate, dependency-free outline of Germany.
 *
 * Both this path and every pin are produced by the SAME equirectangular
 * projection of real coordinates: longitude maps linearly to x, latitude to y,
 * with the longitude/latitude aspect correction baked into the 100×135 viewBox.
 * Pin positions (TruckStop.x / .y) are percentages in that space, so a city's
 * pin lands on its true location relative to the border by construction.
 *
 *   x% = (lon - 5.87) / 9.17 * 100        // lon 5.87°E … 15.04°E
 *   y% = (55.06 - lat) / 7.79 * 100       // lat 47.27°N … 55.06°N
 *   viewBox y = y% * 1.35                  // 7.79 / (9.17·cos51°) ≈ 1.35
 */
const VIEWBOX_H = 135
const GERMANY_PATH =
  'M38.5 4 L55.4 11.8 L67.9 15.3 L78.8 12.8 L90.8 19.8 L93.1 35.7 L95.6 47.1 ' +
  'L96.9 60.8 L100 67.8 L91.9 72.1 L77.8 80.7 L71.2 86.8 L77.2 99.1 L86.8 109 ' +
  'L77.8 127.6 L76.7 130.2 L60.3 131.9 L47.2 132.8 L40.7 130.2 L29.2 129.3 ' +
  'L18.9 129.4 L21 111.9 L24.3 104.7 L10.7 101.6 L5.3 97 L2.8 91 L5.8 82.1 ' +
  'L1.6 74.7 L2 55.6 L12.3 46.1 L14.5 31.5 L12.3 28.8 L24.3 26.2 L30.3 20.1 ' +
  'L29.8 11.4 L26.5 2.8 Z'

const STATUS_COLOR: Record<TruckStopStatus, string> = {
  past: 'var(--text-faint)',
  current: 'var(--accent)',
  upcoming: 'var(--blue)',
}

/** Same projection as GERMANY_PATH above — lets callers go from a real
 * lon/lat to the x/y percentages TruckStop expects, without the admin
 * having to guess coordinates by hand. */
export function lonLatToXY(lon: number, lat: number): { x: number; y: number } {
  return {
    x: Math.round(((lon - 5.87) / 9.17) * 1000) / 10,
    y: Math.round(((55.06 - lat) / 7.79) * 1000) / 10,
  }
}

/** Common German university towns / startup hubs, for the admin's city
 * picker — picking a name plugs in a correct pin position automatically. */
export const CITY_PRESETS: { name: string; lon: number; lat: number }[] = [
  { name: 'Aachen', lon: 6.083, lat: 50.776 },
  { name: 'Berlin', lon: 13.405, lat: 52.52 },
  { name: 'Munich', lon: 11.582, lat: 48.135 },
  { name: 'Hamburg', lon: 9.993, lat: 53.551 },
  { name: 'Cologne', lon: 6.96, lat: 50.937 },
  { name: 'Frankfurt', lon: 8.682, lat: 50.111 },
  { name: 'Stuttgart', lon: 9.182, lat: 48.776 },
  { name: 'Heilbronn', lon: 9.211, lat: 49.142 },
  { name: 'Ingolstadt', lon: 11.424, lat: 48.766 },
  { name: 'Nuremberg', lon: 11.077, lat: 49.453 },
  { name: 'Erlangen', lon: 11.004, lat: 49.59 },
  { name: 'Dresden', lon: 13.737, lat: 51.05 },
  { name: 'Leipzig', lon: 12.371, lat: 51.34 },
  { name: 'Karlsruhe', lon: 8.404, lat: 49.007 },
  { name: 'Darmstadt', lon: 8.652, lat: 49.873 },
  { name: 'Heidelberg', lon: 8.672, lat: 49.399 },
  { name: 'Mannheim', lon: 8.466, lat: 49.488 },
  { name: 'Bonn', lon: 7.1, lat: 50.735 },
  { name: 'Düsseldorf', lon: 6.773, lat: 51.227 },
  { name: 'Münster', lon: 7.626, lat: 51.96 },
  { name: 'Hannover', lon: 9.733, lat: 52.375 },
  { name: 'Bremen', lon: 8.808, lat: 53.079 },
  { name: 'Potsdam', lon: 13.064, lat: 52.39 },
  { name: 'Würzburg', lon: 9.93, lat: 49.793 },
  { name: 'Tübingen', lon: 9.057, lat: 48.521 },
  { name: 'Freiburg', lon: 7.852, lat: 47.999 },
  { name: 'Augsburg', lon: 10.898, lat: 48.371 },
  { name: 'Regensburg', lon: 12.101, lat: 49.013 },
  { name: 'Konstanz', lon: 9.175, lat: 47.663 },
]

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

  // Tour route — connect real stops chronologically (drafts/placeholder pins at
  // 50/50 are skipped so the line doesn't dart to the centre while editing).
  const routePoints = stops
    .filter(s => s.id !== 'draft')
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(s => `${s.x},${(s.y * VIEWBOX_H) / 100}`)

  return (
    <div
      onClick={handleMapClick}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        aspectRatio: `100 / ${VIEWBOX_H}`,
        cursor: placing ? 'crosshair' : 'default',
        touchAction: 'manipulation',
      }}
    >
      <svg viewBox={`0 0 100 ${VIEWBOX_H}`} width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
        <path
          d={GERMANY_PATH}
          fill="var(--surface-2, var(--surface))"
          stroke="var(--border-strong)"
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
        {routePoints.length > 1 && (
          <polyline
            points={routePoints.join(' ')}
            fill="none"
            stroke="var(--text-faint)"
            strokeWidth={0.7}
            strokeDasharray="2 2"
            strokeLinecap="round"
            opacity={0.7}
          />
        )}
      </svg>

      {/* Pins */}
      {stops.map((stop) => {
        const color = STATUS_COLOR[stop.status]
        const isSelected = stop.id === selectedId
        const isCurrent = stop.status === 'current'
        // The form preview pin (admin is still editing, hasn't hit Submit yet) —
        // shown hollow/dashed so it's never mistaken for an already-saved stop.
        const isDraft = stop.id === 'draft'
        // Eastern pins put their label on the left so it doesn't clip the edge.
        const labelOnLeft = stop.x > 62
        return (
          <button
            key={stop.id}
            onClick={(e) => { e.stopPropagation(); onSelect?.(stop.id) }}
            aria-label={`${stop.city} — ${isDraft ? 'unsaved draft' : stop.status}`}
            title={isDraft ? `${stop.city} — not saved yet, click "Add stop" below to save` : `${stop.city} · ${stop.date}`}
            style={{
              position: 'absolute',
              left: `${stop.x}%`,
              top: `${stop.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
                  width: '12px', height: '12px', transform: 'translate(-50%, -50%)',
                  borderRadius: '50%', background: color,
                }}
              />
            )}
            <span
              style={{
                display: 'block',
                position: 'relative',
                width: isCurrent ? '13px' : '10px',
                height: isCurrent ? '13px' : '10px',
                borderRadius: '50%',
                background: isDraft ? 'transparent' : stop.status === 'past' ? 'var(--bg)' : color,
                border: isDraft ? `2px dashed ${color}` : `2px solid ${color}`,
                opacity: isDraft ? 0.7 : 1,
                boxShadow: isSelected
                  ? `0 0 0 3px color-mix(in srgb, ${color} 35%, transparent)`
                  : '0 1px 3px rgba(0,0,0,0.25)',
                transition: 'box-shadow 0.15s',
              }}
            />
            {/* City label — flips to the pin's inner side near the map edges */}
            <span
              style={{
                position: 'absolute',
                ...(labelOnLeft ? { right: 'calc(50% + 9px)' } : { left: 'calc(50% + 9px)' }),
                top: '50%',
                transform: 'translateY(-50%)',
                fontFamily: 'AudiType, sans-serif',
                fontSize: '10px',
                fontStyle: isDraft ? 'italic' : 'normal',
                fontWeight: isSelected || isCurrent ? 700 : 500,
                color: isDraft ? 'var(--text-faint)' : isSelected || isCurrent ? 'var(--text)' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
                lineHeight: 1,
                pointerEvents: 'none',
                textShadow: '0 1px 2px var(--bg), 0 0 2px var(--bg)',
              }}
            >
              {stop.city}{isDraft ? ' (not saved yet)' : ''}
            </span>
          </button>
        )
      })}
    </div>
  )
}
