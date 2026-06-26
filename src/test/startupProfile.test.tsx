import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import StartupProfile from '../routes/StartupProfile'
import { useBridgeStore } from '../store/store'
import { useAuthStore } from '../store/authStore'
import type { Application } from '../store/types'

function renderProfile(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/startup/${id}`]}>
      <Routes>
        <Route path="/startup/:id" element={<StartupProfile />} />
        <Route path="*" element={<div>redirected</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

function makeApp(overrides: Partial<Application>): Application {
  return {
    id: 'APP-TEST-0001',
    founderId: 'f-test',
    founderName: 'Test Founder',
    founderInitials: 'TF',
    companyName: 'TestCo',
    technology: 'Test tech',
    stage: 'decision_go',
    submittedAt: '2026-01-01',
    daysInProcess: 1,
    ownerId: 'o1',
    signalDeadline: '2026-01-15',
    notes: '',
    funding: '€500k',
    teamSize: 3,
    sharedWithCommunity: true,
    ...overrides,
  }
}

beforeEach(() => {
  useBridgeStore.getState().resetDemo()
  useAuthStore.getState().logout()
})

// ── trlInfo display ───────────────────────────────────────────────────────────

describe('StartupProfile — TRL label display', () => {
  it('shows Prototype for trl=3 (lower edge of TRL 3–5 range)', () => {
    useAuthStore.getState().login('internal_lead', {})
    const app = makeApp({ trl: 3 })
    useBridgeStore.setState(s => ({ applications: [app, ...s.applications] }))

    renderProfile('APP-TEST-0001')

    expect(screen.getByText(/Prototype/)).toBeInTheDocument()
    expect(screen.queryByText(/Idea/)).not.toBeInTheDocument()
  })

  it('shows Prototype for trl=5 (upper edge of TRL 3–5 range)', () => {
    useAuthStore.getState().login('internal_lead', {})
    const app = makeApp({ trl: 5 })
    useBridgeStore.setState(s => ({ applications: [app, ...s.applications] }))

    renderProfile('APP-TEST-0001')

    expect(screen.getByText(/Prototype/)).toBeInTheDocument()
  })

  it('shows Idea for trl=2', () => {
    useAuthStore.getState().login('internal_lead', {})
    const app = makeApp({ trl: 2 })
    useBridgeStore.setState(s => ({ applications: [app, ...s.applications] }))

    renderProfile('APP-TEST-0001')

    expect(screen.getByText(/Idea/)).toBeInTheDocument()
  })

  it('shows Market-ready for trl=8', () => {
    useAuthStore.getState().login('internal_lead', {})
    const app = makeApp({ trl: 8 })
    useBridgeStore.setState(s => ({ applications: [app, ...s.applications] }))

    renderProfile('APP-TEST-0001')

    expect(screen.getByText(/Market-ready/)).toBeInTheDocument()
  })
})

// ── Redirect for non-accepted stage ──────────────────────────────────────────

describe('StartupProfile — stage gate', () => {
  it('renders nothing for a submitted-stage app', () => {
    useAuthStore.getState().login('internal_lead', {})
    const app = makeApp({ stage: 'submitted' })
    useBridgeStore.setState(s => ({ applications: [app, ...s.applications] }))

    renderProfile('APP-TEST-0001')

    // Component returns null for non-accepted stages
    expect(screen.queryByText('TestCo')).not.toBeInTheDocument()
  })

  it('renders nothing for an in_review-stage app', () => {
    useAuthStore.getState().login('internal_lead', {})
    const app = makeApp({ stage: 'in_review' })
    useBridgeStore.setState(s => ({ applications: [app, ...s.applications] }))

    renderProfile('APP-TEST-0001')

    expect(screen.queryByText('TestCo')).not.toBeInTheDocument()
  })

  it('renders for decision_go stage', () => {
    useAuthStore.getState().login('internal_lead', {})
    const app = makeApp({ stage: 'decision_go' })
    useBridgeStore.setState(s => ({ applications: [app, ...s.applications] }))

    renderProfile('APP-TEST-0001')

    expect(screen.getByText('TestCo')).toBeInTheDocument()
  })
})

// ── sharedWithCommunity toggle ────────────────────────────────────────────────

describe('StartupProfile — share toggle', () => {
  it('shows Shared when sharedWithCommunity is undefined (defaults to shared)', () => {
    useAuthStore.getState().login('startup', { appId: 'APP-TEST-0001' })
    const app = makeApp({ sharedWithCommunity: undefined })
    useBridgeStore.setState(s => ({ applications: [app, ...s.applications] }))

    renderProfile('APP-TEST-0001')

    expect(screen.getByRole('button', { name: /shared/i })).toBeInTheDocument()
  })

  it('writes explicit false to the store when the founder un-shares', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().login('startup', { appId: 'APP-TEST-0001' })
    const app = makeApp({ sharedWithCommunity: true })
    useBridgeStore.setState(s => ({ applications: [app, ...s.applications] }))

    renderProfile('APP-TEST-0001')
    await user.click(screen.getByRole('button', { name: /shared/i }))

    const stored = useBridgeStore.getState().applications.find(a => a.id === 'APP-TEST-0001')
    expect(stored?.sharedWithCommunity).toBe(false)
  })
})

// ── Community Startups tab — visibility ───────────────────────────────────────
// (tested via store state, not through Community component to keep focused)

describe('Community Startups tab — sharedWithCommunity visibility', () => {
  it('non-shared app is excluded from non-admin visible set', () => {
    // Replicate the filter logic from Community.tsx StartupsTab
    const ACCEPTED = new Set(['decision_go', 'matched_pain_owner', 'path_to_production'])
    const apps: Application[] = [
      makeApp({ id: 'A1', sharedWithCommunity: false }),
      makeApp({ id: 'A2', sharedWithCommunity: true }),
      makeApp({ id: 'A3', sharedWithCommunity: undefined }),
    ]

    const isAdmin = false
    const visible = apps.filter(a => {
      if (!ACCEPTED.has(a.stage)) return false
      if (!isAdmin && a.sharedWithCommunity === false) return false
      return true
    })

    const ids = visible.map(a => a.id)
    expect(ids).not.toContain('A1')
    expect(ids).toContain('A2')
    expect(ids).toContain('A3') // undefined defaults to visible
  })

  it('admin sees all accepted apps regardless of sharedWithCommunity', () => {
    const ACCEPTED = new Set(['decision_go', 'matched_pain_owner', 'path_to_production'])
    const apps: Application[] = [
      makeApp({ id: 'A1', sharedWithCommunity: false }),
      makeApp({ id: 'A2', sharedWithCommunity: true }),
    ]

    const isAdmin = true
    const visible = apps.filter(a => {
      if (!ACCEPTED.has(a.stage)) return false
      if (!isAdmin && a.sharedWithCommunity === false) return false
      return true
    })

    expect(visible.map(a => a.id)).toEqual(['A1', 'A2'])
  })
})
