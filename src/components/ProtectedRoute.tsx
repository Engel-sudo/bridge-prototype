import { Navigate } from 'react-router-dom'
import { useAuthStore, type Role } from '../store/authStore'

interface Props {
  allowedRoles: Role[]
  children: React.ReactNode
}

function roleHome(role: Role, selectedAppId: string | null): string {
  if (role === 'admin') return '/dashboard'
  if (role === 'internal_lead') return '/owner'
  return selectedAppId ? `/founder/${selectedAppId}` : '/apply'
}

export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const { role, selectedAppId } = useAuthStore()

  if (!role) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(role)) return <Navigate to={roleHome(role, selectedAppId)} replace />

  return <>{children}</>
}
