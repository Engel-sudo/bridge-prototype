import { useState } from 'react'
import { Lightbulb, X } from 'lucide-react'

interface Props {
  /** Who the visitor is acting as on this screen. */
  persona: string
  /** One-line "try this" prompt so a cold tester knows what to do. */
  hint: string
}

// Lightweight, dismissible orientation bar for unattended user testing. Tells a
// stranger which persona they're in and what to try, without a guided tour.
export default function DemoHint({ persona, hint }: Props) {
  const [open, setOpen] = useState(true)
  if (!open) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderLeft: '3px solid var(--lime)', borderRadius: 'var(--radius-sm)',
      padding: '10px 14px', marginBottom: '24px',
    }}>
      <Lightbulb size={14} color="var(--lime)" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '4px 10px', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--lime)' }}>
          {persona}
        </span>
        <span style={{ fontFamily: 'IBM Plex Sans', fontSize: '12px', color: 'var(--text-muted)' }}>
          {hint}
        </span>
      </div>
      <button
        onClick={() => setOpen(false)}
        title="Dismiss"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', display: 'flex', flexShrink: 0, padding: 0 }}
      >
        <X size={13} />
      </button>
    </div>
  )
}
