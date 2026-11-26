import { Navigate, Outlet } from 'react-router-dom'

import { useAuthStore } from '../../store/authStore'
import type { UserRole } from '../../types/auth'

interface RoleGuardProps {
  allowedRoles: readonly UserRole[]
}

export default function RoleGuard({
  allowedRoles,
}: RoleGuardProps) {
  const profile = useAuthStore(
    (state) => state.profile
  )

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}