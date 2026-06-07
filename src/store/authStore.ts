import { create } from 'zustand'

export type Role = 'startup' | 'internal_lead' | 'admin' | 'pool_member'

interface AuthStore {
  role: Role | null
  selectedAppId: string | null
  selectedOwnerId: string | null
  selectedMemberId: string | null
  login: (role: Role, opts?: { appId?: string; ownerId?: string; memberId?: string }) => void
  logout: () => void
}

const SESSION_KEY = 'bridge_auth'

function loadSession(): Pick<AuthStore, 'role' | 'selectedAppId' | 'selectedOwnerId' | 'selectedMemberId'> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { role: null, selectedAppId: null, selectedOwnerId: null, selectedMemberId: null }
}

function saveSession(state: Pick<AuthStore, 'role' | 'selectedAppId' | 'selectedOwnerId' | 'selectedMemberId'>) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state))
  } catch {}
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {}
}

const initial = loadSession()

export const useAuthStore = create<AuthStore>((set) => ({
  ...initial,

  login: (role, opts = {}) => {
    const next = {
      role,
      selectedAppId: opts.appId ?? null,
      selectedOwnerId: opts.ownerId ?? null,
      selectedMemberId: opts.memberId ?? null,
    }
    saveSession(next)
    set(next)
  },

  logout: () => {
    clearSession()
    set({ role: null, selectedAppId: null, selectedOwnerId: null, selectedMemberId: null })
  },
}))
