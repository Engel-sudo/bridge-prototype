import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom'
import FounderStatus from '../routes/FounderStatus'
import { useAuthStore } from '../store/authStore'
import { useBridgeStore } from '../store/store'

beforeEach(() => {
  useBridgeStore.getState().resetDemo()
  useAuthStore.getState().logout()
})

function renderFounderStatus(appId: string) {
  return render(
    <MemoryRouter initialEntries={[`/founder/${appId}`]}>
      <Routes>
        <Route path="/founder/:id" element={<FounderStatus />} />
        <Route path="*" element={<div>elsewhere</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('FounderStatus', () => {
  it('shows "Application not found" for an unknown id', () => {
    useAuthStore.getState().login('internal_lead', {})
    renderFounderStatus('UNKNOWN-999')
    expect(screen.getByText('Application not found')).toBeInTheDocument()
  })

  it('renders the company name for a known application', () => {
    useAuthStore.getState().login('internal_lead', {})
    renderFounderStatus('APP-2024-0047')
    expect(screen.getByText('VisionQual')).toBeInTheDocument()
  })
})

describe('FounderStatus — Rules of Hooks across param changes', () => {
  // The same route element instance is reused when only :id changes. If a hook
  // sits below the "not found" early return, the hook count changes between a
  // found id (more hooks) and an unknown id (fewer) and React crashes. Navigate
  // between the two without remounting to catch that.
  it('survives navigating from a valid id to an unknown id', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().login('internal_lead', {})

    render(
      <MemoryRouter initialEntries={['/founder/APP-2024-0047']}>
        <Link to="/founder/NOPE-404">go-unknown</Link>
        <Routes>
          <Route path="/founder/:id" element={<FounderStatus />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('VisionQual')).toBeInTheDocument()
    await user.click(screen.getByText('go-unknown'))
    expect(screen.getByText('Application not found')).toBeInTheDocument()
  })
})

describe('FounderStatus — startup may only view their own application', () => {
  it('does not show another startup\'s private status to a founder', () => {
    // Founder owns APP-2024-0047 but requests APP-2024-0031 (FlowRoute).
    useAuthStore.getState().login('startup', { appId: 'APP-2024-0047' })
    renderFounderStatus('APP-2024-0031')

    expect(screen.queryByText('FlowRoute')).not.toBeInTheDocument()
  })

  it('shows a founder their own application', () => {
    useAuthStore.getState().login('startup', { appId: 'APP-2024-0047' })
    renderFounderStatus('APP-2024-0047')

    expect(screen.getByText('VisionQual')).toBeInTheDocument()
  })

  it('still lets an internal lead view any application', () => {
    useAuthStore.getState().login('internal_lead', {})
    renderFounderStatus('APP-2024-0031')

    expect(screen.getByText('FlowRoute')).toBeInTheDocument()
  })

  it('sends a startup with no application of their own away from founder pages', () => {
    useAuthStore.getState().login('startup', {}) // no appId
    renderFounderStatus('APP-2024-0031')

    expect(screen.queryByText('FlowRoute')).not.toBeInTheDocument()
    expect(screen.getByText('elsewhere')).toBeInTheDocument() // redirected (to /apply)
  })
})
