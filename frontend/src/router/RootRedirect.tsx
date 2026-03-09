import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { UserRole } from '@/types/models'

export default function RootRedirect() {
  const user = useAuthStore((s) => s.user)

  if (!user) return <Navigate to="/login" replace />

  switch (user.role as UserRole) {
    case UserRole.MASTER_ADMIN:
      return <Navigate to="/master-admin" replace />
    case UserRole.COMPANY_ADMIN:
    case UserRole.EMPLOYER:
      return <Navigate to="/dashboard" replace />
    case UserRole.RESELLER:
      return <Navigate to="/reseller" replace />
    default:
      return <Navigate to="/login" replace />
  }
}
