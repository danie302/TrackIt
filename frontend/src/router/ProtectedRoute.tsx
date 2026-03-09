import { Navigate, Outlet } from 'react-router-dom'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuthStore } from '@/stores/auth.store'
import type { UserRole } from '@/types/models'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)

  // While restoring session from storage, avoid redirect flicker
  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
