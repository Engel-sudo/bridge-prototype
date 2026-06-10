import { motion } from 'framer-motion'
import type { Stage } from '../store/types'

interface TimelineStage {
  key: Stage
  label: string
  sublabel?: string
}

const STAGES: TimelineStage[] = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'named_contact', label: 'Named Contact', sublabel: '48h' },
  { key: 'owner_assigned', label: 'Internal Lead Assigned' },
  { key: 'in_review', label: 'In Review' },
  { key: 'signal_sent', label: '2-Week Signal', sublabel: '14 days' },
  { key: 'decision_go', label: 'Decision: Go' },
  { key: 'path_to_production', label: 'Idea → Car' },
]

const STAGE_INDEX: Record<Stage, number> = {
  submitted: 0,
  named_contact: 1,
  owner_assigned: 2,
  in_review: 3,
  signal_sent: 4,
  decision_go: 5,
  decision_redirect: 5,
  matched_pain_owner: 6,
  path_to_production: 6,
}

function nodeStatus(stageKey: Stage, current: Stage): 'done' | 'active' | 'pending' | 'blocked' {
  const stageIdx = STAGE_INDEX[stageKey] ?? 0
  const currentIdx = STAGE_INDEX[current] ?? 0
  if (current === 'decision_redirect' && stageKey === 'decision_go') return 'blocked'
  if (stageIdx < currentIdx) return 'done'
  if (stageIdx === currentIdx) return 'active'
  return 'pending'
}

interface Props {
  current: Stage
  compact?: boolean
}

export default function StatusTimeline({ current, compact }: Props) {
  const currentIdx = STAGE_INDEX[current] ?? 0

  return (
    <div style={{ width: '100%', overflowX: 'auto', paddingBottom: compact ? '0' : '8px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        minWidth: compact ? 'auto' : '600px',
        padding: compact ? '0' : '8px 0',
        position: 'relative',
      }}>
        {STAGES.map((stage, i) => {
          const status = nodeStatus(stage.key, current)
          const isLast = i === STAGES.length - 1

          return (
            <div key={stage.key} style={{ display: 'flex', alignItems: 'center', flex: isLast ? '0 0 auto' : '1' }}>
              {/* Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', position: 'relative' }}>
                <motion.div
                  className={`rail-node ${status}`}
                  initial={false}
                  animate={status === 'active' ? { boxShadow: ['0 0 6px rgba(214,255,0,0.3)', '0 0 14px rgba(214,255,0,0.7)', '0 0 6px rgba(214,255,0,0.3)'] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    background: status === 'done' ? 'var(--lime)' : status === 'active' ? 'var(--bg)' : status === 'blocked' ? 'var(--red)' : 'var(--bg)',
                    border: `2px solid ${status === 'done' ? 'var(--lime)' : status === 'active' ? 'var(--lime)' : status === 'blocked' ? 'var(--red)' : 'var(--border-strong)'}`,
                  }}
                />
                {!compact && (
                  <div style={{ textAlign: 'center', minWidth: '70px', maxWidth: '80px' }}>
                    <div style={{
                      fontFamily: 'JetBrains Mono',
                      fontSize: '9px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: status === 'done' ? 'var(--lime)' : status === 'active' ? 'var(--text)' : status === 'blocked' ? 'var(--red)' : 'var(--text-faint)',
                      lineHeight: '1.3',
                      fontWeight: status === 'active' ? 500 : 400,
                    }}>
                      {stage.label}
                    </div>
                    {stage.sublabel && (
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: 'var(--lime)', marginTop: '2px' }}>
                        {stage.sublabel}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div style={{ flex: 1, height: '2px', background: i < currentIdx ? 'var(--lime)' : 'var(--border)', margin: compact ? '0 2px' : '0 4px', marginBottom: compact ? '0' : '20px', transition: 'background 0.4s ease' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
