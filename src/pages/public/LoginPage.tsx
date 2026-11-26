import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ROLE_HOME } from '../../constants/roles'

import {
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'

import Logo from '../../components/common/Logo'
import Button from '../../components/ui/Button'
import { loginUser } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'

export default function LoginPage() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const {
    session,
    profile,
    loading,
    error: profileError,
  } = useAuthStore()

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (submitting) return

    setError('')
    setSubmitting(true)

    try {
      await loginUser(email, password)
      setPassword('')

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in.'
      )

    } finally {
      setSubmitting(false)
    }
  }

  if (!loading && session && profile) {
  return (
    <Navigate
      to={ROLE_HOME[profile.role]}
      replace
    />
  )
}

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">

      {/* Branding section */}

      <section className="hidden flex-col justify-between bg-primary-dark p-14 text-white lg:flex">

        <Logo light />

        <div className="max-w-xl">

          <ShieldCheck
            size={52}
            className="mb-8 text-accent"
          />

          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-accent">
            Welcome back
          </p>

          <h1 className="text-5xl font-extrabold leading-tight">
            Your journey
            <span className="block text-accent">
              continues.
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-white/70">
            Every skill is a step towards a better
            professional future.
          </p>

          <div className="mt-10 border-t border-white/15 pt-7">

            <p className="text-lg font-medium">
              Prove your skills. Build your identity.
              Unlock opportunities.
            </p>

          </div>

        </div>

        <p className="text-sm text-white/60">
          TalentBridge AI — Skills without borders.
        </p>

      </section>

      {/* Login form */}

      <section className="flex flex-col justify-center px-6 py-12 sm:px-12">

        <div className="mx-auto w-full max-w-md">

          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <h1 className="text-3xl font-extrabold">
            Welcome back.
          </h1>

          <p className="mt-3 text-muted">
            Sign in to your professional workspace.
          </p>

          {(error || profileError) && (
            <div
              role="alert"
              className="mt-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-danger"
            >
              <AlertCircle
                size={20}
                className="shrink-0"
              />

              {error || profileError}

            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >

            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="mt-2 w-full rounded-button border border-border px-4 py-3"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium"
              >
                Password
              </label>

              <div className="relative mt-2">

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-button border border-border px-4 py-3 pr-12"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                  className="absolute right-4 top-3.5 text-muted"
                >

                  {showPassword
                    ? <EyeOff size={20} />
                    : <Eye size={20} />
                  }

                </button>

              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={submitting || loading}
              className="w-full"
            >
              Sign in
            </Button>

          </form>

          <p className="mt-7 text-center text-sm text-muted">

            New to TalentBridge?{' '}

            <Link
              to="/register"
              className="font-semibold text-primary"
            >
              Create an account
            </Link>

          </p>

          <Link
            to="/"
            className="mt-5 block text-center text-sm text-muted hover:text-primary"
          >
            Return to homepage
          </Link>

        </div>

      </section>

    </main>
  )
}