import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore, type Role } from '../store/authStore'
import ProtectedRoute from '../components/ProtectedRoute'
import Landing from '../routes/Landing'

beforeEach(() => {
  useAuthStore.getState().logout()
})

function renderProtected(initialPath: string, role?: Role) {
  if (role) {
    // set role directly via login
    const { login } = useAuthStore.getState()
    if (role === 'admin') login('admin')
    else if (role === 'internal_lead') login('internal_lead', { ownerId: 'o3' })
    else if (role === 'startup') login('startup', { appId: 'APP-001' })
  }

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <div>dashboard</div>
          </ProtectedRoute>
        } />
        <Route path="/owner" element={
          <ProtectedRoute allowedRoles={['internal_lead', 'admin']}>
            <div>owner console</div>
          </ProtectedRoute>
        } />
        <Route path="/apply" element={
          <ProtectedRoute allowedRoles={['startup']}>
            <div>apply form</div>
          </ProtectedRoute>
        } />
        <Route path="/founder/:id" element={
          <ProtectedRoute allowedRoles={['startup', 'internal_lead', 'admin']}>
            <div>founder status</div>
          </ProtectedRoute>
        } />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute — unauthenticated', () => {
  it('redirects to /login when no role is set', () => {
    renderProtected('/dashboard')
    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('redirects /owner to /login when unauthenticated', () => {
    renderProtected('/owner')
    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('redirects /apply to /login when unauthenticated', () => {
    renderProtected('/apply')
    expect(screen.getByText('login page')).toBeInTheDocument()
  })
})

describe('ProtectedRoute — startup role', () => {
  it('renders apply form for startup role', () => {
    renderProtected('/apply', 'startup')
    expect(screen.getByText('apply form')).toBeInTheDocument()
  })

  it('blocks startup from /dashboard and redirects to /founder/:appId', () => {
    renderProtected('/dashboard', 'startup')
    expect(screen.getByText('founder status')).toBeInTheDocument()
    expect(screen.queryByText('dashboard')).not.toBeInTheDocument()
  })

  it('blocks startup from /owner', () => {
    renderProtected('/owner', 'startup')
    expect(screen.queryByText('owner console')).not.toBeInTheDocument()
  })
})

describe('ProtectedRoute — internal_lead role', () => {
  it('renders owner console for internal_lead', () => {
    renderProtected('/owner', 'internal_lead')
    expect(screen.getByText('owner console')).toBeInTheDocument()
  })

  it('blocks internal_lead from /dashboard', () => {
    renderProtected('/dashboard', 'internal_lead')
    expect(screen.queryByText('dashboard')).not.toBeInTheDocument()
  })

  it('blocks internal_lead from /apply', () => {
    renderProtected('/apply', 'internal_lead')
    expect(screen.queryByText('apply form')).not.toBeInTheDocument()
  })

  it('can view /founder/:id as internal_lead (view-as-founder)', () => {
    renderProtected('/founder/APP-2024-0047', 'internal_lead')
    expect(screen.getByText('founder status')).toBeInTheDocument()
  })
})

describe('ProtectedRoute — admin role', () => {
  it('renders dashboard for admin', () => {
    renderProtected('/dashboard', 'admin')
    expect(screen.getByText('dashboard')).toBeInTheDocument()
  })

  it('renders owner console for admin', () => {
    renderProtected('/owner', 'admin')
    expect(screen.getByText('owner console')).toBeInTheDocument()
  })

  it('can view /founder/:id as admin', () => {
    renderProtected('/founder/APP-2024-0047', 'admin')
    expect(screen.getByText('founder status')).toBeInTheDocument()
  })
})

describe('Landing — role home redirect', () => {
  beforeEach(() => {
    // framer-motion whileInView needs IntersectionObserver, missing in jsdom
    class MockIO {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
    vi.stubGlobal('IntersectionObserver', MockIO)
  })

  function renderLanding(role?: Role) {
    if (role === 'admin') useAuthStore.getState().login('admin')
    else if (role === 'internal_lead') useAuthStore.getState().login('internal_lead', { ownerId: 'o3' })

    return render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<div>dashboard</div>} />
          <Route path="/owner" element={<div>owner console</div>} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('shows the public landing page when logged out', () => {
    renderLanding()
    expect(screen.getByRole('heading', { name: /get your startup into audi/i })).toBeInTheDocument()
  })

  it('shows the landing page even when logged in as admin', () => {
    renderLanding('admin')
    expect(screen.getByRole('heading', { name: /get your startup into audi/i })).toBeInTheDocument()
  })

  it('shows the landing page even when logged in as internal lead', () => {
    renderLanding('internal_lead')
    expect(screen.getByRole('heading', { name: /get your startup into audi/i })).toBeInTheDocument()
  })
})
