import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

import { useAuthStore } from '../../store/authStore'
import { ROLE_HOME } from '../../constants/roles'

export default function UnauthorizedPage() {
  const profile = useAuthStore(
    (state) => state.profile
  )

  const dashboardPath = profile
    ? ROLE_HOME[profile.role]
    : '/login'

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-6">

      <div className="max-w-md text-center">

        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-100">

          <ShieldAlert
            size={44}
            className="text-primary"
          />

        </div>

        <p className="text-sm font-bold tracking-widest text-primary">
          403 — FORBIDDEN
        </p>

        <h1 className="mt-4 text-4xl font-extrabold">
          Access restricted.
        </h1>

        <p className="mt-4 leading-relaxed text-muted">
          Your current account does not have
          permission to access this workspace.
        </p>

        <Link
          to={dashboardPath}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white"
        >
          <ArrowLeft size={18} />
          Return to your dashboard
        </Link>

      </div>

    </main>
  )
}