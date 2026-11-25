import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ArrowUpRight } from 'lucide-react'

import Logo from '../common/Logo'
import { publicNavigation } from '../../constants/navigation'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur">

      <nav
        aria-label="Main navigation"
        className="container-page flex h-20 items-center justify-between"
      >

        <Logo />

        {/* Desktop navigation */}

        <div className="hidden items-center gap-8 lg:flex">

          {publicNavigation.map(({ label, path }) =>
            path.includes('#') ? (
              <a
                key={path}
                href={path}
                className="text-sm font-medium text-muted hover:text-primary"
              >
                {label}
              </a>
            ) : (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted hover:text-primary'
                  }`
                }
              >
                {label}
              </NavLink>
            )
          )}

        </div>

        <div className="hidden items-center gap-5 lg:flex">

          <Link
            to="/login"
            className="text-sm font-semibold text-ink"
          >
            Sign in
          </Link>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-button bg-primary-dark px-5 py-3 text-sm font-semibold text-white hover:bg-primary"
          >
            Get started
            <ArrowUpRight size={16} />
          </Link>

        </div>

        {/* Mobile menu button */}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          className="rounded-lg border border-border p-2 lg:hidden"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </nav>

      {/* Mobile navigation */}

      {isOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-border bg-white p-6 lg:hidden"
        >

          <div className="flex flex-col gap-5">

            {publicNavigation.map(({ label, path }) =>
              path.includes('#') ? (
                <a
                  key={path}
                  href={path}
                  onClick={() => setIsOpen(false)}
                  className="font-medium text-ink"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className="font-medium text-ink"
                >
                  {label}
                </Link>
              )
            )}

            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="font-medium"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="rounded-button bg-primary-dark px-5 py-3 text-center text-white"
            >
              Get started
            </Link>

          </div>

        </div>
      )}

    </header>
  )
}