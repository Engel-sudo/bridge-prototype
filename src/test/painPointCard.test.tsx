import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PainPointCard from '../components/PainPointCard'
import { useAuthStore } from '../store/authStore'
import { useBridgeStore } from '../store/store'

// Store-connected wrapper — mirrors how PainPointMap re-supplies the prop when
// the store changes, so the card reflects toggles the way it does in the app.
function ConnectedCard({ id }: { id: string }) {
  const pp = useBridgeStore(s => s.painPoints.find(p => p.id === id))
  return pp ? <PainPointCard painPoint={pp} /> : null
}

function renderCard(id: string) {
  return render(
    <MemoryRouter>
      <ConnectedCard id={id} />
    </MemoryRouter>
  )
}

beforeEach(() => {
  useBridgeStore.getState().resetDemo()
  useAuthStore.getState().logout()
})

describe('PainPointCard — community sharing toggle', () => {
  it('lets an admin hide a shared pain point from the community', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().login('admin', {})
    renderCard('pp4') // a seeded open, shared pain point

    // Starts shared → control offers to hide it.
    await user.click(screen.getByRole('button', { name: 'Hide from community' }))

    expect(useBridgeStore.getState().painPoints.find(p => p.id === 'pp4')?.sharedWithCommunity).toBe(false)
    // The card now surfaces a "Hidden" indicator and offers to re-share.
    expect(screen.getByText('Hidden')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Share with community' })).toBeInTheDocument()
  })

  it('does not show the sharing control to non-admins', () => {
    useAuthStore.getState().login('pool_member', { memberId: 'pm1' })
    renderCard('pp4')
    expect(screen.queryByRole('button', { name: /community/i })).not.toBeInTheDocument()
  })
})
