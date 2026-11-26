import { Link } from 'react-router-dom'

import ProfilePage from './candidate/ProfilePage'
import { useAuthStore } from '../store/authStore'
import { ROLE_HOME } from '../constants/roles'

export default function SharedProfilePage() {
  const profile = useAuthStore(
    (state) => state.profile
  )

  return (
    <main className="min-h-screen bg-surface p-6">

      <div className="mx-auto mb-6 max-w-5xl">

        <Link
          to={
            profile
              ? ROLE_HOME[profile.role]
              : '/login'
          }
          className="font-semibold text-primary"
        >
          Back to workspace
        </Link>

      </div>

      <ProfilePage />

    </main>
  )
}