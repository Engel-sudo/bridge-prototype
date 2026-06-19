import { Navigate } from 'react-router-dom'
import { useAuthStore, type Role } from '../store/authStore'
import { useBridgeStore } from '../store/store'
import { canAccessCommunity } from '../store/derive'

interface Props {
  allowedRoles: Role[]
  /** When set, a startup is admitted only if their application has reached the
   *  community-access gate (decision_go or beyond). */
  startupNeedsCommunityAccess?: boolean
  children: React.ReactNode
}

function roleHome(role: Role, selectedAppId: string | null): string {
  if (role === 'admin') return '/dashboard'
  if (role === 'internal_lead') return '/owner'
  if (role === 'pool_member') return '/community'
  return selectedAppId ? `/founder/${selectedAppId}` : '/apply'
}

export default function ProtectedRoute({ allowedRoles, startupNeedsCommunityAccess, children }: Props) {
  const { role, selectedAppId } = useAuthStore()
  const applications = useBridgeStore(s => s.applications)

  if (!role) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(role)) return <Navigate to={roleHome(role, selectedAppId)} replace />

  if (startupNeedsCommunityAccess && role === 'startup') {
    const app = applications.find(a => a.id === selectedAppId)
    if (!app || !canAccessCommunity(app.stage)) {
      return <Navigate to={roleHome(role, selectedAppId)} replace />
    }
  }

  return <>{children}</>
}
