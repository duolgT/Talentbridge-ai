import {
  Link,
  useLocation,
} from 'react-router-dom'

import {
  Menu,
  ChevronDown,
  Building2,
} from 'lucide-react'

import {
  employerNavigation,
} from '../../constants/employerNavigation'

import { useAuthStore } from '../../store/authStore'

interface EmployerHeaderProps {
  onMenuClick: () => void
}

export default function EmployerHeader({
  onMenuClick,
}: EmployerHeaderProps) {

  const location = useLocation()

  const profile = useAuthStore(
    (state) => state.profile
  )

  const currentPage = employerNavigation.find(
  (item) => item.path === location.pathname
)

const pageTitle =
  /^\/employer\/opportunities\/[^/]+\/edit$/.test(
    location.pathname
  )
    ? 'Edit opportunity'
    : currentPage?.label || 'Employer portal'


    
  const initials = (
    profile?.full_name || 'Employer'
  )
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((name) => name[0])
    .join('')
    .toUpperCase()

  return (

    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">

      {/* Left section */}

      <div className="flex min-w-0 items-center gap-4">

        <button
          type="button"
          aria-label="Open employer navigation"
          onClick={onMenuClick}
          className="rounded-lg border border-slate-200 p-2.5 text-[#123C35] lg:hidden"
        >

          <Menu size={22} />

        </button>

        <div className="min-w-0">

          <p className="hidden text-xs text-slate-500 sm:block">

            Employer workspace

          </p>

          <h2 className="truncate text-lg font-bold text-[#123C35]">
            {pageTitle}

          </h2>

        </div>

      </div>

      {/* Right section */}

      <div className="flex items-center gap-3 sm:gap-5">

        <div className="hidden items-center gap-2 rounded-full bg-[#EAF3EE] px-3 py-2 text-xs font-semibold text-[#16826B] md:flex">

          <Building2 size={15} />

          Employer

        </div>

        <Link
          to="/account/profile"
          aria-label="Open account profile"
          className="flex items-center gap-3 rounded-xl p-1 transition-colors hover:bg-slate-50"
        >

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#123C35] text-sm font-bold text-[#D5F76A]">

            {initials}

          </div>

          <div className="hidden text-left sm:block">

            <p className="max-w-40 truncate text-sm font-semibold text-slate-800">

              {profile?.full_name || 'Employer'}

            </p>

            <p className="mt-1 text-xs text-slate-500">

              My account

            </p>

          </div>

          <ChevronDown
            size={17}
            className="hidden text-slate-400 sm:block"
          />

        </Link>

      </div>

    </header>

  )
}