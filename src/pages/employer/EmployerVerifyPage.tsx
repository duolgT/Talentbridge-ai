import { useRef, useState, type FormEvent } from 'react'

import {
  ShieldCheck,
  ShieldAlert,
  Search,
  LoaderCircle,
  CircleAlert,
  RotateCcw,
  ExternalLink,
} from 'lucide-react'

import PassportCard from '../../features/passport/PassportCard'

import {
  verifyPassport,
  getPassportUrl,
} from '../../services/passportService'

import type { PassportData } from '../../types/passport'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function extractToken(value: string): string | null {
  const input = value.trim()

  if (UUID_PATTERN.test(input)) {
    return input.toLowerCase()
  }

  try {
    const url = new URL(input, window.location.origin)

    if (url.origin !== window.location.origin) {
      return null
    }

    const match = url.pathname.match(
      /^\/verify\/([^/]+)\/?$/
    )

    const token = match?.[1]

    return token && UUID_PATTERN.test(token)
      ? token.toLowerCase()
      : null
  } catch {
    return null
  }
}

export default function EmployerVerifyPage() {
  const [input, setInput] = useState('')

  const [passport, setPassport] =
    useState<PassportData | null>(null)

  const [token, setToken] =
    useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [error, setError] = useState('')

  const [checkedAt, setCheckedAt] =
    useState<string | null>(null)

  const requestId = useRef(0)

  async function handleVerify(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (loading) return

    const currentRequest = ++requestId.current
    const verificationToken = extractToken(input)

    setError('')
    setPassport(null)
    setToken(null)
    setUnavailable(false)
    setCheckedAt(null)

    if (!verificationToken) {
      setError(
        'Enter a valid UjuziLink verification URL or verification UUID.'
      )
      return
    }

    setLoading(true)

    try {
      const result = await verifyPassport(verificationToken)

      if (currentRequest !== requestId.current) return

      setCheckedAt(new Date().toISOString())

      if (!result || !result.verified_skills?.length) {
        setUnavailable(true)
        return
      }

      setPassport(result)
      setToken(verificationToken)
    } catch (err) {
      if (currentRequest !== requestId.current) return

      setError(
        typeof err === 'object' &&
        err !== null &&
        'message' in err
          ? String(err.message)
          : 'Passport verification failed.'
      )
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false)
      }
    }
  }

  function resetVerification(value = '') {
    requestId.current += 1

    setInput(value)
    setPassport(null)
    setToken(null)
    setError('')
    setUnavailable(false)
    setLoading(false)
    setCheckedAt(null)
  }

  const shareUrl = token
    ? getPassportUrl(token)
    : undefined

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      <div>
        <h1 className="text-3xl font-extrabold text-[#123C35]">
          Verify Skills Passport
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Verify professional credentials voluntarily shared
          by UjuziLink candidates.
        </p>
      </div>

      <section className="rounded-3xl bg-[#123C35] p-8 text-white">

        <ShieldCheck size={46} className="text-[#D5F76A]" />

        <h2 className="mt-5 text-3xl font-extrabold">
          Trust through verified competencies.
        </h2>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
          Check the current publication and verification
          status of an Ujuzi Skills Passport.
        </p>

      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">

        <form onSubmit={handleVerify}>
          <label
            htmlFor="passport-token"
            className="font-semibold text-[#123C35]"
          >
            Passport verification link or token
          </label>

          <input
            id="passport-token"
            type="text"
            required
            autoComplete="off"
            spellCheck={false}
            maxLength={2048}
            value={input}
            onChange={(event) =>
              resetVerification(event.target.value)
            }
            placeholder="Paste verification URL or UUID..."
            className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-[#16826B]"
          />

          <p className="mt-3 text-xs text-slate-500">
            Use a verification link from this deployment
            or enter the verification UUID directly.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#16826B] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading
                ? <LoaderCircle size={18} className="animate-spin" />
                : <Search size={18} />
              }

              {loading ? 'Verifying...' : 'Verify passport'}
            </button>

            <button
              type="button"
              onClick={() => resetVerification()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold"
            >
              <RotateCcw size={17} />
              Clear
            </button>

          </div>
        </form>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl bg-red-50 p-5 text-red-700"
        >
          <CircleAlert size={22} className="shrink-0" />
          {error}
        </div>
      )}

      {unavailable && (
        <section
          role="status"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-6"
        >
          <ShieldAlert size={32} className="text-amber-700" />

          <h3 className="mt-3 text-lg font-bold text-amber-900">
            Passport unavailable
          </h3>

          <p className="mt-2 text-sm text-amber-800">
            No currently published passport with verified
            competencies was found. Ask the candidate
            for their current verification link.
          </p>
        </section>
      )}

      {passport && (
        <div className="space-y-5">

          <section
            role="status"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"
          >
            <ShieldCheck size={34} className="text-emerald-700" />

            <h3 className="mt-3 text-xl font-bold text-emerald-900">
              Published passport verified
            </h3>

            <p className="mt-2 text-sm text-emerald-800">
              {passport.verified_skills.length} verified competencies
              {' · '}
              {passport.approved_evidence_count} approved evidence records.
            </p>

            {checkedAt && (
              <p className="mt-2 text-xs text-emerald-700">
                Checked: {new Date(checkedAt).toLocaleString(
                  'en-GB',
                  { timeZone: 'Africa/Nairobi' }
                )} EAT
              </p>
            )}

            {shareUrl && (
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
              >
                <ExternalLink size={16} />
                Open public passport
              </a>
            )}
          </section>

          <PassportCard
            data={passport}
            shareUrl={shareUrl}
          />

        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-bold text-[#123C35]">
          Verification limitations
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          UjuziLink verification confirms competencies reviewed
          through the platform. It does not constitute official
          accreditation, a professional licence, an identity
          guarantee or employment authorization. Results reflect
          the status at the time of verification.
        </p>
      </section>

    </div>
  )
}