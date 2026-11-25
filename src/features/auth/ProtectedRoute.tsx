import { Navigate, Outlet } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function ProtectedRoute() {

  const {
    session,
    profile,
    loading,
    error,
  } = useAuthStore()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">

        <div className="text-center">

          <LoaderCircle
            size={36}
            className="mx-auto animate-spin text-primary"
          />

          <p className="mt-4 text-sm text-muted">
            Loading your workspace...
          </p>

        </div>

      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">

        <div className="surface-card max-w-md text-center">

          <h1 className="text-xl font-bold">
            Unable to load your profile
          </h1>

          <p className="mt-3 text-muted">
            {error || 'Your profile could not be found.'}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 font-semibold text-primary"
          >
            Try again
          </button>

        </div>

      </div>
    )
  }

  return <Outlet />
}