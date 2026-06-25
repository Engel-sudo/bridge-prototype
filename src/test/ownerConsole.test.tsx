import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import OwnerConsole from '../routes/OwnerConsole'
import { useAuthStore } from '../store/authStore'
import { useBridgeStore } from '../store/store'

function renderOwner() {
  return render(
    <MemoryRouter>
      <OwnerConsole />
    </MemoryRouter>
  )
}

beforeEach(() => {
  useBridgeStore.getState().resetDemo()
  useAuthStore.getState().logout()
})

describe('OwnerConsole — admin delete application', () => {
  it('lets an admin delete the selected application (e.g. junk test submissions)', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    useAuthStore.getState().login('admin', {})
    renderOwner()

    const before = useBridgeStore.getState().applications.length
    await user.click(screen.getByRole('button', { name: /delete application/i }))

    expect(useBridgeStore.getState().applications.length).toBe(before - 1)
  })

  it('does not show the delete control to a non-admin internal lead', () => {
    useAuthStore.getState().login('internal_lead', { ownerId: 'o3' })
    renderOwner()
    expect(screen.queryByRole('button', { name: /delete application/i })).not.toBeInTheDocument()
  })
})
