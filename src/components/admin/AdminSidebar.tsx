import {
  useState,
} from 'react'

import {
  NavLink,
  Link,
  useNavigate,
} from 'react-router-dom'

import {
  X,
  LogOut,
  ShieldCheck,
  LoaderCircle,
} from 'lucide-react'

import {
  adminNavigation,
} from '../../constants/adminNavigation'

import {
  BRAND,
} from '../../constants/branding'

import {
  useAuthStore,
} from '../../store/authStore'

import {
  logoutUser,
} from '../../services/authService'

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

export default function AdminSidebar({
  open,
  onClose,
}: AdminSidebarProps) {

  const navigate = useNavigate()

  const profile = useAuthStore(
    (state) => state.profile
  )

  const reset = useAuthStore(
    (state) => state.reset
  )

  const [signingOut, setSigningOut] =
    useState(false)

  const [error, setError] =
    useState('')

  async function handleLogout() {

    if (signingOut) return

    setSigningOut(true)
    setError('')

    try {

      await logoutUser()

      reset()

      onClose()

      navigate('/login', {
        replace: true,
      })

    } catch (err) {

      setError(
        typeof err === 'object' &&
        err !== null &&
        'message' in err
          ? String(err.message)
          : 'Unable to sign out.'
      )

    } finally {

      setSigningOut(false)

    }
  }

  const initials =
    profile?.full_name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'AD'

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
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#123C35] text-white transition-transform duration-300 lg:translate-x-0 ${
          open
            ? 'translate-x-0'
            : '-translate-x-full invisible lg:visible'
        }`}
      >

        {/* Brand */}

        <div className="flex items-center justify-between border-b border-white/10 p-6">

          <Link
            to="/admin/dashboard"
            onClick={onClose}
            className="flex items-center gap-3"
          >

            <img
              src={BRAND.logo}
              alt=""
              className="h-11 w-11 rounded-xl"
            />

            <div>

              <h1 className="text-xl font-extrabold">

                Ujuzi<span className="text-[#D5F76A]">Link</span>

              </h1>

              <p className="mt-1 text-xs text-white/60">

                Administrator portal

              </p>

            </div>

          </Link>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
          >

            <X size={22} />

          </button>

        </div>

        {/* Administrator identity */}

        <div className="mx-4 mt-5 rounded-xl border border-white/10 bg-white/5 p-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D5F76A] text-[#123C35]">

              <ShieldCheck size={23} />

            </div>

            <div>

              <p className="text-sm font-semibold">

                Administrator

              </p>

              <p className="mt-1 text-xs text-white/50">

                Privileged workspace

              </p>

            </div>

          </div>

        </div>

        {/* Navigation */}

        <nav
          aria-label="Administrator navigation"
          className="flex-1 space-y-1 overflow-y-auto px-4 py-6"
        >

          <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-widest text-white/40">

            Platform management

          </p>

          {adminNavigation.map((item) => (

            <NavLink
              key={item.path}
              to={item.path}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive

                    ? 'bg-white/10 text-[#D5F76A]'

                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >

              <item.icon
                size={19}
                className="shrink-0"
              />

              <span>{item.label}</span>

            </NavLink>

          ))}

        </nav>

        {/* Account and logout */}

        <div className="border-t border-white/10 p-4">

          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D5F76A] text-sm font-bold text-[#123C35]">

              {initials}

            </div>

            <div className="min-w-0">

              <p className="truncate text-sm font-semibold">

                {profile?.full_name || 'Administrator'}

              </p>

              <p className="mt-1 text-xs text-white/50">

                Platform administrator

              </p>

            </div>

          </div>

          {error && (

            <p
              role="alert"
              className="mt-3 text-xs text-red-300"
            >

              {error}

            </p>

          )}

          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={signingOut}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >

            {signingOut

              ? <LoaderCircle
                  size={19}
                  className="animate-spin"
                />

              : <LogOut size={19} />

            }

            {signingOut
              ? 'Signing out...'
              : 'Sign out'}

          </button>

          <p className="mt-3 text-center text-[10px] text-white/40">

            {BRAND.name} · Administration

          </p>

        </div>

      </aside>

    </>

  )
}