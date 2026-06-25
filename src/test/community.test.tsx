import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Community from '../routes/Community'
import { useAuthStore } from '../store/authStore'
import { useBridgeStore } from '../store/store'

function renderCommunity() {
  return render(
    <MemoryRouter initialEntries={['/community']}>
      <Community />
    </MemoryRouter>
  )
}

beforeEach(() => {
  useBridgeStore.getState().resetDemo()
  useAuthStore.getState().logout()
})

describe('Community — tabs', () => {
  it('shows the truck tour stops when the Tour tab is opened', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().login('admin', {})
    renderCommunity()

    // Overview is the default tab — the tour list is not shown yet.
    expect(screen.queryByText('Berlin')).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Tour' }))

    // Seeded stops render (each city appears on its map pin and in the list).
    expect(screen.getAllByText('Berlin').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Stuttgart').length).toBeGreaterThan(0)
  })

  it('shows seeded events when the Events tab is opened', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().login('admin', {})
    renderCommunity()

    await user.click(screen.getByRole('tab', { name: 'Events' }))

    expect(screen.getByText('Startup Open Day — Ingolstadt')).toBeInTheDocument()
  })
})

describe('Community — accepted founder view', () => {
  it('greets an accepted founder with the "You\'re in" welcome on Overview', () => {
    // APP-2024-0031 (FlowRoute) is seeded at decision_go.
    useAuthStore.getState().login('startup', { appId: 'APP-2024-0031' })
    renderCommunity()

    expect(screen.getByText('FlowRoute')).toBeInTheDocument()
    expect(screen.getByText(/welcome to the BRIDGE community/i)).toBeInTheDocument()
    expect(screen.getByText('Accepted Founder')).toBeInTheDocument()
  })
})

describe('Community — pain point sharing', () => {
  const title = 'Carbon accounting is manual and quarter-lagged'

  it('shows shared open pain points to community members by default', () => {
    useAuthStore.getState().login('pool_member', { memberId: 'pm1' })
    renderCommunity()
    expect(screen.getByText(title)).toBeInTheDocument()
  })

  it('hides a pain point from members once the admin un-shares it', () => {
    useAuthStore.getState().login('pool_member', { memberId: 'pm1' })
    renderCommunity()
    expect(screen.getByText(title)).toBeInTheDocument()

    const pp = useBridgeStore.getState().painPoints.find(p => p.title === title)!
    act(() => {
      useBridgeStore.getState().updatePainPoint({ ...pp, sharedWithCommunity: false })
    })

    expect(screen.queryByText(title)).not.toBeInTheDocument()
  })
})

describe('Community — admin truck stop management', () => {
  it('adds a new truck stop via the form, with no ambiguous "Add stop" buttons left open', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().login('admin', {})
    renderCommunity()
    await user.click(screen.getByRole('tab', { name: 'Tour' }))

    await user.click(screen.getByRole('button', { name: 'Add stop' }))

    // Once the form is open there must be exactly one control named "Add stop"
    // (the submit button) — the header toggle should no longer share that name,
    // otherwise clicking it discards the in-progress form instead of saving it.
    expect(screen.getAllByRole('button', { name: 'Add stop' })).toHaveLength(1)

    await user.type(screen.getByPlaceholderText(/city name/i), 'Leipzig')
    await user.type(screen.getByPlaceholderText(/Garching/i), 'Uni Leipzig')
    fireEvent.change(screen.getByLabelText(/^Date/), { target: { value: '2026-12-01' } })
    await user.click(screen.getByRole('button', { name: 'Add stop' }))

    expect(screen.getAllByText('Leipzig').length).toBeGreaterThan(0)
  })

  it('carries every field through and derives upcoming status from a future date', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().login('admin', {})
    renderCommunity()
    await user.click(screen.getByRole('tab', { name: 'Tour' }))
    await user.click(screen.getByRole('button', { name: 'Add stop' }))

    await user.type(screen.getByPlaceholderText(/city name/i), 'Kassel')
    await user.type(screen.getByPlaceholderText(/Garching/i), 'University of Kassel')
    fireEvent.change(screen.getByLabelText(/^Date/), { target: { value: '2026-12-01' } })
    await user.type(screen.getByPlaceholderText(/What happens/i), 'Deep-tech scouting afternoon.')
    await user.type(screen.getByPlaceholderText(/https/i), 'bridge.audi/tour/kassel')

    await user.click(screen.getByRole('button', { name: 'Add stop' }))

    // Every field is persisted; status is derived from the (future) date.
    const added = useBridgeStore.getState().truckStops.find(s => s.city === 'Kassel')
    expect(added).toMatchObject({
      city: 'Kassel',
      venue: 'University of Kassel',
      date: '2026-12-01',
      description: 'Deep-tech scouting afternoon.',
      registerUrl: 'bridge.audi/tour/kassel',
      status: 'upcoming',
    })
    expect(screen.getAllByText('Kassel').length).toBeGreaterThan(0)
  })

  it('marks a stop "here now" when the toggle is set, regardless of date', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().login('admin', {})
    renderCommunity()
    await user.click(screen.getByRole('tab', { name: 'Tour' }))
    await user.click(screen.getByRole('button', { name: 'Add stop' }))

    await user.type(screen.getByPlaceholderText(/city name/i), 'Ulm')
    await user.type(screen.getByPlaceholderText(/Garching/i), 'Uni Ulm')
    fireEvent.change(screen.getByLabelText(/^Date/), { target: { value: '2026-01-01' } }) // past date
    await user.click(screen.getByLabelText(/here now/i))
    await user.click(screen.getByRole('button', { name: 'Add stop' }))

    const added = useBridgeStore.getState().truckStops.find(s => s.city === 'Ulm')
    expect(added?.status).toBe('current')
  })

  it('requires city, venue and date — shows a visible error listing what is missing', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().login('admin', {})
    renderCommunity()
    await user.click(screen.getByRole('tab', { name: 'Tour' }))
    await user.click(screen.getByRole('button', { name: 'Add stop' }))

    // Submit empty — must surface an error naming the missing fields, not silently do nothing.
    await user.click(screen.getByRole('button', { name: 'Add stop' }))

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(/City/)
    expect(alert).toHaveTextContent(/Venue/)
    expect(alert).toHaveTextContent(/Date/)
    // Form stays open so the user can correct it.
    expect(screen.getByText('New stop')).toBeInTheDocument()
  })
})

describe('Community — admin event management', () => {
  it('removes an event when the admin clicks its delete button', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().login('admin', {})
    renderCommunity()
    await user.click(screen.getByRole('tab', { name: 'Events' }))

    expect(screen.getByText('Startup Open Day — Ingolstadt')).toBeInTheDocument()

    // The first event card's delete button corresponds to the first seeded event.
    await user.click(screen.getAllByRole('button', { name: 'Delete event' })[0])

    expect(screen.queryByText('Startup Open Day — Ingolstadt')).not.toBeInTheDocument()
  })
})
