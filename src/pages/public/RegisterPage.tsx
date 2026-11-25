import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import {
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
  MailCheck,
} from 'lucide-react'

import Logo from '../../components/common/Logo'
import Button from '../../components/ui/Button'
import { registerUser } from '../../services/authService'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (loading) return

    setError('')
    setSuccess('')

    if (fullName.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      const data = await registerUser({
        fullName,
        email,
        password,
      })

      if (data.session) {
        setSuccess('Your account is ready.')
      } else {
        setSuccess(
          'Check your email for a confirmation link if registration was successful.'
        )
      }

      setPassword('')
      setConfirmPassword('')

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">

      {/* Branding panel */}

      <section className="hidden flex-col justify-between bg-primary-dark p-14 text-white lg:flex">

        <Logo light />

        <div className="max-w-xl">

          <ShieldCheck
            size={52}
            className="mb-8 text-accent"
          />

          <h1 className="text-5xl font-extrabold leading-tight">
            Your talent deserves
            <span className="block text-accent">
              a future.
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-white/70">
            Create a professional identity built around
            your skills, experience and potential.
          </p>

          <div className="mt-8 space-y-4">

            {[
              'Demonstrate your abilities',
              'Build your digital skills passport',
              'Discover meaningful opportunities',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3"
              >
                <CheckCircle2
                  size={20}
                  className="text-accent"
                />

                <span>{item}</span>
              </div>
            ))}

          </div>

        </div>

        <p className="text-sm text-white/60">
          TalentBridge AI — Skills without borders.
        </p>

      </section>

      {/* Registration panel */}

      <section className="flex flex-col justify-center px-6 py-12 sm:px-12">

        <div className="mx-auto w-full max-w-md">

          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Begin your journey
          </span>

          <h2 className="mt-3 text-3xl font-extrabold">
            Create your account.
          </h2>

          <p className="mt-3 text-muted">
            Start building your professional identity.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-danger"
            >
              <AlertCircle size={20} className="shrink-0" />
              {error}
            </div>
          )}

          {success ? (

            <div
              role="status"
              className="mt-6 rounded-xl bg-brand-50 p-6"
            >
              <MailCheck
                size={32}
                className="mb-4 text-primary"
              />

              <p className="font-medium text-brand-700">
                {success}
              </p>

              <Link
                to="/login"
                className="mt-5 inline-block font-semibold text-primary"
              >
                Continue to sign in
              </Link>

            </div>

          ) : (

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* Full name */}

              <div>
                <label
                  htmlFor="fullName"
                  className="text-sm font-medium"
                >
                  Full name
                </label>

                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                  className="mt-2 w-full rounded-button border border-border px-4 py-3"
                />
              </div>

              {/* Email */}

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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="mt-2 w-full rounded-button border border-border px-4 py-3"
                />
              </div>

              {/* Password */}

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
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-button border border-border px-4 py-3 pr-12"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-4 top-3.5 text-muted"
                  >
                    {showPassword
                      ? <EyeOff size={20} />
                      : <Eye size={20} />
                    }
                  </button>

                </div>
              </div>

              {/* Confirm password */}

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                  className="mt-2 w-full rounded-button border border-border px-4 py-3"
                />
              </div>

              <div className="rounded-xl bg-brand-50 p-4">

                <p className="text-xs leading-relaxed text-brand-700">
                  Your account will be created as a candidate.
                  Reviewer and employer accounts require
                  separate approval.
                </p>

              </div>

              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Create account
              </Button>

            </form>

          )}

          <p className="mt-7 text-center text-sm text-muted">
            Already have an account?{' '}

            <Link
              to="/login"
              className="font-semibold text-primary"
            >
              Sign in
            </Link>
          </p>

        </div>

      </section>

    </main>
  )
}