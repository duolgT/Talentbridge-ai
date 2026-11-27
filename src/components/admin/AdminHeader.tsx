import {
  Link,
  useLocation,
} from 'react-router-dom'

import {
  Menu,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react'

import {
  useAuthStore,
} from '../../store/authStore'

import {
  adminNavigation,
} from '../../constants/adminNavigation'

interface AdminHeaderProps {
  onMenuClick: () => void
  menuOpen: boolean
}

export default function AdminHeader({
  onMenuClick,
  menuOpen,
}: AdminHeaderProps) {

  const location = useLocation()

  const profile = useAuthStore(
    (state) => state.profile
  )

  const currentPage =
    adminNavigation.find(
      (item) => item.path === location.pathname
    )

  const pageTitle =
    currentPage?.label ?? 'Overview'

  const initials =
    profile?.full_name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'AD'

  return (

    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">

      <div className="flex min-h-18 items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

        {/* Page title */}

        <div className="flex min-w-0 items-center gap-3">

          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open administrator navigation"
            aria-controls="admin-sidebar"
            aria-expanded={menuOpen}
            className="rounded-xl border border-slate-200 p-2.5 text-[#123C35] hover:bg-slate-50 lg:hidden"
          >

            <Menu size={22} />

          </button>

          <div className="min-w-0">

            <p className="hidden text-xs text-slate-500 sm:block">

              Administration

            </p>

            <h2 className="truncate text-lg font-bold text-[#123C35]">

              {pageTitle}

            </h2>

          </div>

        </div>

        {/* Account controls */}

        <div className="flex items-center gap-3 sm:gap-5">

          <div className="hidden items-center gap-2 rounded-xl bg-[#EAF3EE] px-3 py-2 md:flex">

            <ShieldCheck
              size={18}
              className="text-[#16826B]"
            />

            <span className="text-xs font-semibold text-[#16826B]">

              Admin workspace

            </span>

          </div>

          <Link
            to="/account/profile"
            aria-label="Open administrator profile"
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF3EE] text-sm font-bold text-[#123C35]">

              {initials}

            </div>

            <div className="hidden max-w-40 sm:block">

              <p className="truncate text-sm font-semibold text-[#123C35]">

                {profile?.full_name || 'Administrator'}

              </p>

              <p className="text-xs text-slate-500">

                Administrator

              </p>

            </div>

            <ChevronDown
              size={16}
              className="hidden text-slate-400 sm:block"
            />

          </Link>

        </div>

      </div>

    </header>

  )
}