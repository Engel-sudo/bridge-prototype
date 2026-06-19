import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useBridgeStore } from '../store/store'
import Nav from '../components/Nav'

beforeEach(() => {
  useAuthStore.getState().logout()
})

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderNav(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Nav />
      <LocationProbe />
    </MemoryRouter>
  )
}

/** Click the BRIDGE logo and return the pathname the router ended up on. */
async function clickLogo(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('link', { name: /bridge/i }))
  return screen.getByTestId('location').textContent
}

describe('Nav — logo always navigates to /login', () => {
  it('takes an admin to /login', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().login('admin', {})
    renderNav('/map')
    expect(await clickLogo(user)).toBe('/login')
  })

  it('takes an internal lead to /login', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().login('internal_lead', { ownerId: 'o3' })
    renderNav('/community')
    expect(await clickLogo(user)).toBe('/login')
  })

  it('takes a community member to /login', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().login('pool_member', { memberId: 'p1' })
    renderNav('/community')
    expect(await clickLogo(user)).toBe('/login')
  })

  it('takes a startup with an application to /login', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().login('startup', { appId: 'APP-2024-0047' })
    renderNav('/founder/APP-2024-0047')
    expect(await clickLogo(user)).toBe('/login')
  })

  it('takes a startup on the apply page to /login', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().login('startup', {})
    renderNav('/apply')
    expect(await clickLogo(user)).toBe('/login')
  })
})

describe('Nav — theme toggle', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.theme
    localStorage.removeItem('bridge-theme')
  })

  it('switches to dark theme and persists the choice', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().login('admin', {})
    renderNav('/dashboard')

    await user.click(screen.getByRole('button', { name: /switch to dark theme/i }))

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('bridge-theme')).toBe('dark')
  })

  it('switches back to light theme on second click', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().login('admin', {})
    renderNav('/dashboard')

    await user.click(screen.getByRole('button', { name: /switch to dark theme/i }))
    await user.click(screen.getByRole('button', { name: /switch to light theme/i }))

    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem('bridge-theme')).toBe('light')
  })
})

describe('Nav — startup link visibility', () => {
  it('shows My Application (not Apply) when startup has a selected app', () => {
    useAuthStore.getState().login('startup', { appId: 'APP-2024-0047' })
    renderNav('/founder/APP-2024-0047')
    expect(screen.getByText('My Application')).toBeInTheDocument()
    expect(screen.queryByText('Apply')).not.toBeInTheDocument()
  })

  it('shows Apply (not My Application) when startup has no selected app', () => {
    useAuthStore.getState().login('startup', {})
    renderNav('/apply')
    expect(screen.getByText('Apply')).toBeInTheDocument()
    expect(screen.queryByText('My Application')).not.toBeInTheDocument()
  })
})

describe('Nav — accepted-founder community link', () => {
  // Seed apps: APP-2024-0031 (FlowRoute) is decision_go; APP-2024-0047 is in_review.
  beforeEach(() => {
    useBridgeStore.getState().resetDemo()
  })

  it('shows Community for a startup whose application is accepted', () => {
    useAuthStore.getState().login('startup', { appId: 'APP-2024-0031' })
    renderNav('/founder/APP-2024-0031')
    expect(screen.getByText('Community')).toBeInTheDocument()
  })

  it('hides Community for a startup before acceptance', () => {
    useAuthStore.getState().login('startup', { appId: 'APP-2024-0047' })
    renderNav('/founder/APP-2024-0047')
    expect(screen.queryByText('Community')).not.toBeInTheDocument()
  })
})
