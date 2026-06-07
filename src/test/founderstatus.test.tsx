import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import FounderStatus from '../routes/FounderStatus'

function renderFounderStatus(appId: string) {
  return render(
    <MemoryRouter initialEntries={[`/founder/${appId}`]}>
      <Routes>
        <Route path="/founder/:id" element={<FounderStatus />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('FounderStatus', () => {
  it('shows "Application not found" for an unknown id', () => {
    renderFounderStatus('UNKNOWN-999')
    expect(screen.getByText('Application not found')).toBeInTheDocument()
  })

  it('renders the company name for a known application', () => {
    renderFounderStatus('APP-2024-0047')
    expect(screen.getByText('VisionQual')).toBeInTheDocument()
  })
})
