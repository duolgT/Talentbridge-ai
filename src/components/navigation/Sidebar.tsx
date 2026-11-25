import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'

import Logo from '../common/Logo'
import { candidateNavigation } from '../../constants/navigation'
import { cn } from '../../lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>

      {/* Mobile backdrop */}

      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        id="dashboard-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col',
          'bg-primary-dark text-white transition-transform duration-300',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          !isOpen && 'invisible lg:visible'
        )}
      >

        <div className="flex h-20 items-center justify-between px-5">

          <Logo light />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="lg:hidden"
          >
            <X size={22} />
          </button>

        </div>

        <div className="mx-4 rounded-xl border border-white/10 bg-white/5 p-4">

          <p className="text-xs text-white/55">
            YOUR WORKSPACE
          </p>

          <p className="mt-1 font-semibold">
            Candidate Portal
          </p>

        </div>

        <nav
          aria-label="Candidate navigation"
          className="mt-7 flex-1 overflow-y-auto px-4"
        >

          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-white/45">
            Professional journey
          </p>

          <div className="space-y-1">

            {candidateNavigation.map(({ label, path, icon: Icon }) => (

              <NavLink
                key={path}
                to={path}
                end={path === '/dashboard'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/10 text-accent'
                      : 'text-white/65 hover:bg-white/5 hover:text-white'
                  )
                }
              >

                <Icon size={19} />

                <span>{label}</span>

              </NavLink>

            ))}

          </div>

        </nav>

        <div className="m-4 rounded-xl bg-white/5 p-4">

          <p className="text-sm font-semibold">
            Your talent matters.
          </p>

          <p className="mt-2 text-xs leading-relaxed text-white/55">

            Build your skills passport and take the
            next step in your professional journey.

          </p>

        </div>

      </aside>

    </>
  )
}