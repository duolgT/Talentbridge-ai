import { Menu, UserRound } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { candidateNavigation } from '../../constants/navigation'

interface DashboardHeaderProps {
  onMenuClick: () => void
  menuOpen: boolean
}

export default function DashboardHeader({
  onMenuClick,
  menuOpen,
}: DashboardHeaderProps) {
  const location = useLocation()

  const currentPage = candidateNavigation.find(
    (item) => item.path === location.pathname
  )

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-white px-4 sm:px-8">

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

          <h2 className="mt-1 text-base font-semibold">

            {currentPage?.label ?? 'Workspace'}

          </h2>

        </div>

      </div>

      <div className="flex items-center gap-3">

        <div className="hidden text-right sm:block">

          <p className="text-sm font-semibold">
            Demo candidate
          </p>

          <p className="text-xs text-muted">
            Candidate account
          </p>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100">

          <UserRound size={21} className="text-primary" />

        </div>

      </div>

    </header>
  )
}