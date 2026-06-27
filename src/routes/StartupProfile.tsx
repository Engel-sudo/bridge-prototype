import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ExternalLink, Pencil, Check, X, Globe, Link2, Share2, AlertCircle, ArrowLeft } from 'lucide-react'
import { useBridgeStore } from '../store/store'
import { useAuthStore } from '../store/authStore'
import { TRL_LABELS } from '../store/types'
import type { Application, PainPoint } from '../store/types'
import { hasStartupProfile } from '../store/derive'

const EXTENDED = "'AudiType Extended', 'AudiType', sans-serif"
const SANS = "'AudiType', sans-serif"

const STAGE_LABEL: Record<string, string> = {
  decision_go: 'Accepted',
  matched_pain_owner: 'Matched to Pain Point',
  path_to_production: 'In Production',
}

const DEPARTMENTS = ['Production', 'Quality', 'Logistics', 'R&D', 'Procurement', 'Others']

function trlInfo(trl?: number): { label: string; sublabel: string } {
  if (!trl) return { label: 'TRL N/A', sublabel: '' }
  const entry = [...TRL_LABELS].reverse().find(t => trl >= t.value)
  return entry ? { label: entry.label, sublabel: entry.sublabel } : { label: `TRL ${trl}`, sublabel: '' }
}

export default function StartupProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { role, selectedAppId } = useAuthStore()
  const { applications, painPoints, matchResults, updateApplication } = useBridgeStore()

  const app = applications.find(a => a.id === id)
  const isOwnProfile = role === 'startup' && selectedAppId === id
  const canEdit = isOwnProfile

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Partial<Application>>({})
  const [contactOpen, setContactOpen] = useState(false)

  useEffect(() => {
    if (!app || !hasStartupProfile(app.stage)) navigate(-1)
  }, [app, navigate])

  if (!app || !hasStartupProfile(app.stage)) return null

  const trl = trlInfo(app.trl)
  const hasMvp = app.hasMvp ?? app.productStage === 'MVP'
  const shared = app.sharedWithCommunity !== false

  const matchedPainPoints = Object.entries(matchResults)
    .filter(([, matches]) => matches.some(m => m.startupId === app.id))
    .map(([ppId]) => painPoints.find(p => p.id === ppId))
    .filter((p): p is PainPoint => p != null)
    .slice(0, 4)

  function startEdit() {
    setDraft({
      technology: app!.technology,
      teamMembers: app!.teamMembers ?? '',
      website: app!.website ?? '',
      linkedin: app!.linkedin ?? '',
      targetDepartment: app!.targetDepartment ?? '',
    })
    setEditing(true)
  }

  function saveEdit() {
    updateApplication({ ...app!, ...draft })
    setEditing(false)
    setDraft({})
  }

  function cancelEdit() {
    setDraft({})
    setEditing(false)
  }

  function toggleShare() {
    updateApplication({ ...app!, sharedWithCommunity: !shared })
  }

  const stageColor = app.stage === 'path_to_production' ? 'var(--accent)' : 'var(--blue)'
  const stageBg = app.stage === 'path_to_production' ? 'var(--accent-dim)' : 'rgba(59,130,246,0.1)'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '80px 40px 60px', maxWidth: '860px', margin: '0 auto' }}
    >
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontFamily: SANS, fontSize: '12px', color: 'var(--text-muted)',
          background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 0 24px',
        }}
      >
        <ArrowLeft size={13} /> Back
      </button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <span className="kicker">startup profile</span>
            <h1 style={{ fontFamily: EXTENDED, fontWeight: 700, fontSize: 'clamp(24px, 4vw, 40px)', color: 'var(--text)', lineHeight: 1.1, margin: '4px 0 10px' }}>
              {app.companyName}
            </h1>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontFamily: SANS, fontSize: '11px', color: stageColor, background: stageBg, padding: '3px 10px' }}>
                {STAGE_LABEL[app.stage]}
              </span>
              {trl.label !== 'TRL N/A' && (
                <span style={{ fontFamily: SANS, fontSize: '11px', color: 'var(--blue)', background: 'rgba(59,130,246,0.1)', padding: '3px 10px' }}>
                  {trl.label} · {trl.sublabel}
                </span>
              )}
              <span style={{
                fontFamily: SANS, fontSize: '11px', padding: '3px 10px',
                color: hasMvp ? 'var(--accent)' : 'var(--text-faint)',
                background: hasMvp ? 'var(--accent-dim)' : 'var(--surface)',
              }}>
                {hasMvp ? 'MVP ✓' : 'Pre-MVP'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
            {canEdit ? (
              <>
                <button
                  onClick={editing ? saveEdit : startEdit}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {editing ? <><Check size={13} /> Save changes</> : <><Pencil size={13} /> Edit profile</>}
                </button>
                {editing && (
                  <button onClick={cancelEdit} style={{ fontFamily: SANS, fontSize: '12px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    Cancel
                  </button>
                )}
              </>
            ) : role !== 'floor_worker' && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Link
                  to="/floor"
                  style={{
                    fontFamily: SANS, fontSize: '12px', fontWeight: 600,
                    color: 'var(--text)', border: '1px solid var(--border)',
                    padding: '8px 14px', textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  <AlertCircle size={13} /> I have a problem
                </Link>
                <button
                  onClick={() => setContactOpen(true)}
                  className="btn-primary"
                  style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  I'm interested
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Technology */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '24px 28px' }}>
          <span className="kicker" style={{ marginBottom: '10px', display: 'block' }}>technology & product</span>
          {editing ? (
            <textarea
              className="input"
              value={draft.technology ?? ''}
              onChange={e => setDraft(d => ({ ...d, technology: e.target.value }))}
              style={{ minHeight: '100px', fontSize: '14px', lineHeight: 1.65, width: '100%' }}
            />
          ) : (
            <p style={{ fontFamily: SANS, fontSize: '15px', color: 'var(--text)', lineHeight: 1.7, margin: 0 }}>
              {app.technology || '—'}
            </p>
          )}
        </motion.div>

        {/* Stats grid */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'var(--border)' }}>
          {[
            { label: 'Funding', value: app.funding || '—' },
            { label: 'Team Size', value: app.teamSize ? `${app.teamSize} people` : '—' },
            { label: 'Region', value: app.region || '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--surface)', padding: '18px 22px' }}>
              <div style={{ fontFamily: SANS, fontSize: '11px', color: 'var(--text-faint)', marginBottom: '4px' }}>{label}</div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{value}</div>
            </div>
          ))}
          <div style={{ background: 'var(--surface)', padding: '18px 22px' }}>
            <div style={{ fontFamily: SANS, fontSize: '11px', color: 'var(--text-faint)', marginBottom: '6px' }}>Target Department</div>
            {editing ? (
              <select
                className="input"
                style={{ fontSize: '13px', padding: '6px 10px' }}
                value={draft.targetDepartment ?? ''}
                onChange={e => setDraft(d => ({ ...d, targetDepartment: e.target.value }))}
              >
                <option value="">Select…</option>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            ) : (
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
                {app.targetDepartment || '—'}
              </div>
            )}
          </div>
        </motion.div>

        {/* Team & Contact */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)' }}>
          <div style={{ background: 'var(--surface)', padding: '20px 24px' }}>
            <span className="kicker" style={{ marginBottom: '10px', display: 'block' }}>team</span>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: '14px', color: 'var(--text)', marginBottom: '6px' }}>
              {app.founderName}
              <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '12px' }}> — Founder</span>
            </div>
            {editing ? (
              <input
                className="input"
                placeholder="e.g. Lena Schmidt – CTO"
                value={draft.teamMembers ?? ''}
                onChange={e => setDraft(d => ({ ...d, teamMembers: e.target.value }))}
                style={{ fontSize: '13px', marginTop: '8px', width: '100%' }}
              />
            ) : app.teamMembers ? (
              <div style={{ fontFamily: SANS, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {app.teamMembers}
              </div>
            ) : null}
          </div>

          <div style={{ background: 'var(--surface)', padding: '20px 24px' }}>
            <span className="kicker" style={{ marginBottom: '10px', display: 'block' }}>contact</span>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  className="input"
                  placeholder="yourstartup.com"
                  value={draft.website ?? ''}
                  onChange={e => setDraft(d => ({ ...d, website: e.target.value }))}
                  style={{ fontSize: '13px' }}
                />
                <input
                  className="input"
                  placeholder="linkedin.com/in/…"
                  value={draft.linkedin ?? ''}
                  onChange={e => setDraft(d => ({ ...d, linkedin: e.target.value }))}
                  style={{ fontSize: '13px' }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {app.website ? (
                  <a
                    href={app.website.startsWith('http') ? app.website : `https://${app.website}`}
                    target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: SANS, fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}
                  >
                    <Globe size={13} color="var(--text-faint)" /> {app.website}
                  </a>
                ) : <span style={{ fontFamily: SANS, fontSize: '13px', color: 'var(--text-faint)' }}>No website on file</span>}
                {app.linkedin ? (
                  <a
                    href={app.linkedin.startsWith('http') ? app.linkedin : `https://${app.linkedin}`}
                    target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: SANS, fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}
                  >
                    <Link2 size={13} color="var(--text-faint)" /> {app.linkedin}
                  </a>
                ) : <span style={{ fontFamily: SANS, fontSize: '13px', color: 'var(--text-faint)' }}>No LinkedIn on file</span>}
              </div>
            )}
          </div>
        </motion.div>

        {/* Share toggle — founder only */}
        {canEdit && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            style={{
              background: shared ? 'var(--accent-dim)' : 'var(--surface)',
              border: `1px solid ${shared ? 'var(--border-strong)' : 'var(--border)'}`,
              padding: '18px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
            }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <Share2 size={13} color={shared ? 'var(--accent)' : 'var(--text-faint)'} />
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>
                  Share my profile with the Audi Startup Community
                </span>
              </div>
              <p style={{ fontFamily: SANS, fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                {shared
                  ? 'Visible in the Startup Directory to Audi employees and community members.'
                  : 'Currently hidden — only Audi leads and admins can see your profile.'}
              </p>
            </div>
            <button
              onClick={toggleShare}
              style={{
                fontFamily: SANS, fontSize: '12px', fontWeight: 600, padding: '8px 16px',
                background: shared ? 'var(--accent)' : 'transparent',
                color: shared ? 'var(--accent-contrast)' : 'var(--text-muted)',
                border: `1px solid ${shared ? 'var(--accent)' : 'var(--border)'}`,
                cursor: 'pointer', whiteSpace: 'nowrap',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}
            >
              {shared ? <><Check size={12} /> Shared</> : 'Share profile'}
            </button>
          </motion.div>
        )}

        {/* Matched pain points */}
        {matchedPainPoints.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px 24px' }}>
            <span className="kicker" style={{ marginBottom: '10px', display: 'block' }}>matched pain points</span>
            <p style={{ fontFamily: SANS, fontSize: '13px', color: 'var(--text-faint)', marginBottom: '12px', lineHeight: 1.5 }}>
              These Audi problems align with this startup's technology.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {matchedPainPoints.map(pp => (
                <div key={pp.id} style={{ padding: '12px 16px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: '13px', color: 'var(--text)', marginBottom: '2px' }}>{pp.title}</div>
                  <div style={{ fontFamily: SANS, fontSize: '11px', color: 'var(--text-faint)' }}>{pp.department}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* "I'm interested" contact modal */}
      <AnimatePresence>
        {contactOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}
            onClick={() => setContactOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '32px', maxWidth: '440px', width: '100%' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <span className="kicker" style={{ marginBottom: '4px', display: 'block' }}>reach out</span>
                  <h3 style={{ fontFamily: EXTENDED, fontSize: '22px', color: 'var(--text)', margin: 0 }}>{app.companyName}</h3>
                </div>
                <button onClick={() => setContactOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: SANS, fontSize: '11px', color: 'var(--text-faint)', marginBottom: '4px' }}>Founder</div>
                  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: '15px', color: 'var(--text)' }}>{app.founderName}</div>
                </div>

                {app.website && (
                  <a
                    href={app.website.startsWith('http') ? app.website : `https://${app.website}`}
                    target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', textDecoration: 'none' }}
                  >
                    <Globe size={15} color="var(--text-faint)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: SANS, fontSize: '11px', color: 'var(--text-faint)' }}>Website</div>
                      <div style={{ fontFamily: SANS, fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{app.website}</div>
                    </div>
                    <ExternalLink size={12} color="var(--text-faint)" />
                  </a>
                )}

                {app.linkedin && (
                  <a
                    href={app.linkedin.startsWith('http') ? app.linkedin : `https://${app.linkedin}`}
                    target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', textDecoration: 'none' }}
                  >
                    <Link2 size={15} color="var(--text-faint)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: SANS, fontSize: '11px', color: 'var(--text-faint)' }}>LinkedIn</div>
                      <div style={{ fontFamily: SANS, fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{app.linkedin}</div>
                    </div>
                    <ExternalLink size={12} color="var(--text-faint)" />
                  </a>
                )}

                {!app.website && !app.linkedin && (
                  <p style={{ fontFamily: SANS, fontSize: '13px', color: 'var(--text-faint)', padding: '16px', textAlign: 'center', margin: 0 }}>
                    No contact details on file yet — reach out through your Internal Lead.
                  </p>
                )}
              </div>

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontFamily: SANS, fontSize: '12px', color: 'var(--text-faint)', margin: '0 0 10px' }}>
                  Have a specific problem this startup could help with?
                </p>
                <Link
                  to="/floor"
                  onClick={() => setContactOpen(false)}
                  style={{
                    display: 'block', fontFamily: SANS, fontSize: '12px', fontWeight: 600,
                    color: 'var(--text)', border: '1px solid var(--border)',
                    padding: '10px 16px', textDecoration: 'none', textAlign: 'center',
                  }}
                >
                  Submit a pain point instead
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
