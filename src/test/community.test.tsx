import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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
