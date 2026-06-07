import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Nav from '../components/Nav'

beforeEach(() => {
  useAuthStore.getState().logout()
})

function renderNav(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Nav />
    </MemoryRouter>
  )
}

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
