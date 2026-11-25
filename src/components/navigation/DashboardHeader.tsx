import { useLocation } from 'react-router-dom'
import { Menu, LogOut } from 'lucide-react'

import { candidateNavigation } from '../../constants/navigation'
import { useAuthStore } from '../../store/authStore'
import { logoutUser } from '../../services/authService'

interface DashboardHeaderProps {
  onMenuClick: () => void
  menuOpen: boolean
}

export default function DashboardHeader({
  onMenuClick,
  menuOpen,
}: DashboardHeaderProps) {

  const location = useLocation()

  const profile = useAuthStore(
    (state) => state.profile
  )

  const currentPage = candidateNavigation.find(
    (item) => item.path === location.pathname
  )

  async function handleLogout() {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Logout error:', error)

      window.alert(
        'There was a problem completing sign out.'
      )
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-white px-4 sm:px-8">

      {/* Left section */}

      <div className="flex items-center gap-4">

        <button
          type="button"
          aria-label="Open navigation"
          aria-expanded={menuOpen}
          aria-controls="dashboard-sidebar"
          onClick={onMenuClick}
          className="rounded-lg border border-border p-2 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-xs text-muted">
            Candidate workspace
          </p>

          <h1 className="text-lg font-bold sm:text-xl">
            {currentPage?.label ?? 'Overview'}
          </h1>
        </div>

      </div>

      {/* Right section */}

      <div className="flex items-center gap-3">

        {/* User information */}

        <div className="hidden text-right sm:block">

          <p className="text-sm font-semibold">
            {profile?.full_name || 'Candidate'}
          </p>

          <p className="text-xs capitalize text-muted">
            {profile?.role || 'Candidate'}
          </p>

        </div>

        {/* User avatar */}

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 font-bold text-primary">

          {profile?.full_name?.charAt(0).toUpperCase()
            || 'T'}

        </div>

        {/* Logout button */}

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sign out"
          title="Sign out"
          className="rounded-lg p-2 text-muted transition-colors hover:bg-red-50 hover:text-danger"
        >
          <LogOut size={21} />
        </button>

      </div>

    </header>
  )
}