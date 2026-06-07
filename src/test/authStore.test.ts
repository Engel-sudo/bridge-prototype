import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../store/authStore'

beforeEach(() => {
  // Reset store + sessionStorage between tests
  useAuthStore.getState().logout()
})

describe('authStore — login', () => {
  it('sets role on login', () => {
    useAuthStore.getState().login('admin')
    expect(useAuthStore.getState().role).toBe('admin')
  })

  it('sets selectedAppId when provided', () => {
    useAuthStore.getState().login('startup', { appId: 'APP-001' })
    expect(useAuthStore.getState().selectedAppId).toBe('APP-001')
  })

  it('sets selectedOwnerId when provided', () => {
    useAuthStore.getState().login('internal_lead', { ownerId: 'o3' })
    expect(useAuthStore.getState().selectedOwnerId).toBe('o3')
  })

  it('leaves selectedAppId null when not provided', () => {
    useAuthStore.getState().login('admin')
    expect(useAuthStore.getState().selectedAppId).toBeNull()
  })
})

describe('authStore — logout', () => {
  it('clears role on logout', () => {
    useAuthStore.getState().login('admin')
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().role).toBeNull()
  })

  it('clears selectedAppId on logout', () => {
    useAuthStore.getState().login('startup', { appId: 'APP-001' })
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().selectedAppId).toBeNull()
  })

  it('clears selectedOwnerId on logout', () => {
    useAuthStore.getState().login('internal_lead', { ownerId: 'o3' })
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().selectedOwnerId).toBeNull()
  })
})

describe('authStore — sessionStorage persistence', () => {
  it('persists role to sessionStorage on login', () => {
    useAuthStore.getState().login('admin')
    const stored = JSON.parse(sessionStorage.getItem('bridge_auth') ?? '{}')
    expect(stored.role).toBe('admin')
  })

  it('persists selectedAppId to sessionStorage', () => {
    useAuthStore.getState().login('startup', { appId: 'APP-042' })
    const stored = JSON.parse(sessionStorage.getItem('bridge_auth') ?? '{}')
    expect(stored.selectedAppId).toBe('APP-042')
  })

  it('removes sessionStorage entry on logout', () => {
    useAuthStore.getState().login('admin')
    useAuthStore.getState().logout()
    expect(sessionStorage.getItem('bridge_auth')).toBeNull()
  })
})
