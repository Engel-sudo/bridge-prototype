import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Apply from '../routes/Apply'
import { useAuthStore } from '../store/authStore'
import { useBridgeStore } from '../store/store'

beforeEach(() => {
  useBridgeStore.getState().resetDemo()
  useAuthStore.getState().logout()
  // jsdom doesn't implement these APIs the Apply form touches
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
  class MockIO { observe = vi.fn(); disconnect = vi.fn(); constructor(_cb: unknown) {} }
  vi.stubGlobal('IntersectionObserver', MockIO)
})

function renderApply() {
  return render(
    <MemoryRouter initialEntries={['/apply']}>
      <Routes>
        <Route path="/apply" element={<Apply />} />
        <Route path="/founder/:id" element={<div>founder status page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Apply — already-applied guard', () => {
  it('redirects a startup who already has an application to their status page', () => {
    useAuthStore.getState().login('startup', { appId: 'APP-2024-0031' })
    renderApply()
    expect(screen.getByText('founder status page')).toBeInTheDocument()
  })

  it('renders the application form for a startup with no application yet', () => {
    useAuthStore.getState().login('startup', {})
    renderApply()
    // The form (not a redirect) is shown.
    expect(screen.queryByText('founder status page')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit application/i })).toBeInTheDocument()
  })
})
