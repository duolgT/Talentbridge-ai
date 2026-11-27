import {
  NavLink,
  Link,
  useNavigate,
} from 'react-router-dom'

import { useState } from 'react'

import {
  Layers3,
  LogOut,
  X,
  Building2,
  LoaderCircle,
} from 'lucide-react'

import {
  employerNavigation,
} from '../../constants/employerNavigation'

import { useAuthStore } from '../../store/authStore'
import { logoutUser } from '../../services/authService'

interface EmployerSidebarProps {
  open: boolean
  onClose: () => void
}

export default function EmployerSidebar({
  open,
  onClose,
}: EmployerSidebarProps) {

  const navigate = useNavigate()

  const profile = useAuthStore(
    (state) => state.profile
  )

  const [loggingOut, setLoggingOut] =
    useState(false)

  const [logoutError, setLogoutError] =
    useState('')

  const initials = (
    profile?.full_name || 'Employer'
  )
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((name) => name[0])
    .join('')
    .toUpperCase()

  async function handleLogout() {

    if (loggingOut) return

    setLoggingOut(true)
    setLogoutError('')

    try {

      await logoutUser()

      useAuthStore.getState().reset()

      onClose()

      navigate('/login', {
        replace: true,
      })

    } catch {

      setLogoutError(
        'Unable to sign out. Please try again.'
      )

    } finally {

      setLoggingOut(false)

    }

  }

  return (
    <>

      {/* Mobile overlay */}

      {open && (

        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />

      )}

      {/* Sidebar */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-72 flex-col
          bg-[#123C35] text-white
          transition-transform duration-300
          lg:translate-x-0 lg:visible
          ${
            open
              ? 'translate-x-0 visible'
              : '-translate-x-full invisible'
          }
        `}
      >

        {/* Brand */}

        <div className="flex items-center justify-between border-b border-white/10 px-6 py-7">

          <Link
            to="/employer/dashboard"
            onClick={onClose}
            className="flex items-center gap-3"
          >

            <div className="rounded-xl bg-[#D5F76A] p-2.5 text-[#123C35]">

              <Layers3 size={25} />

            </div>

            <div>

              <h1 className="text-lg font-extrabold">

                UjuziLink

              </h1>

              <p className="text-xs text-white/50">

                Employer workspace

              </p>

            </div>

          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
          >

            <X size={22} />

          </button>

        </div>

        {/* Workspace identity */}

        <div className="mx-4 mt-6 rounded-xl border border-white/10 bg-white/5 p-4">

          <div className="flex items-center gap-3">

            <Building2
              size={22}
              className="text-[#D5F76A]"
            />

            <div>

              <p className="text-sm font-semibold">

                Employer portal

              </p>

              <p className="mt-1 text-xs text-white/50">

                Recruitment management

              </p>

            </div>

          </div>

        </div>

        {/* Navigation */}

        <nav
          aria-label="Employer navigation"
          className="mt-7 flex-1 space-y-2 overflow-y-auto px-4"
        >

          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-white/40">

            Workspace

          </p>

          {employerNavigation.map((item) => (

            <NavLink
              key={item.path}
              to={item.path}
              end
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3
                rounded-xl px-4 py-3.5
                text-sm font-medium
                transition-colors
                ${
                  isActive
                    ? 'bg-[#16826B] text-white'
                    : 'text-white/65 hover:bg-white/10 hover:text-white'
                }
              `}
            >

              <item.icon
                size={20}
                className="shrink-0"
              />

              {item.label}

            </NavLink>

          ))}

        </nav>

        {/* Bottom account section */}

        <div className="mt-auto border-t border-white/10 p-4">

          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D5F76A] font-bold text-[#123C35]">

              {initials}

            </div>

            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-semibold">

                {profile?.full_name || 'Employer'}

              </p>

              <p className="mt-1 text-xs text-white/50">

                Employer account

              </p>

            </div>

          </div>

          {logoutError && (

            <p
              role="alert"
              className="mt-3 px-3 text-xs text-red-300"
            >

              {logoutError}

            </p>

          )}

          <button
            type="button"
            disabled={loggingOut}
            onClick={() => void handleLogout()}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >

            {loggingOut ? (

              <LoaderCircle
                size={20}
                className="animate-spin"
              />

            ) : (

              <LogOut size={20} />

            )}

            {loggingOut
              ? 'Signing out...'
              : 'Sign out'}

          </button>

        </div>

      </aside>

    </>
  )
}