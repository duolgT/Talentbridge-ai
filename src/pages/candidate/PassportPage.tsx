import { useEffect, useState } from 'react'

import { Link } from 'react-router-dom'

import {
  ShieldCheck,
  FileBadge,
  Globe,
  Lock,
  Copy,
  ExternalLink,
  Download,
  LoaderCircle,
  RefreshCw,
  BadgeCheck,
} from 'lucide-react'

import { useAuthStore } from '../../store/authStore'

import PassportCard from '../../features/passport/PassportCard'

import {
  getPassport,
  generatePassport,
  getMyPassport,
  setPassportVisibility,
  getPassportUrl,
} from '../../services/passportService'

import type {
  Passport,
  PassportData,
} from '../../types/passport'

function getErrorMessage(error: unknown) {

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    return String(error.message)
  }

  return 'Something went wrong. Please try again.'
}

export default function PassportPage() {

  const profile = useAuthStore(
    (state) => state.profile
  )

  if (!profile) return null

  return (

    <PassportWorkspace
      key={profile.id}
      candidateId={profile.id}
    />

  )
}

function PassportWorkspace({
  candidateId,
}: {
  candidateId: string
}) {

  const [passport, setPassport] =
    useState<Passport | null>(null)

  const [data, setData] =
    useState<PassportData | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [busy, setBusy] =
    useState(false)

  const [error, setError] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [reloadKey, setReloadKey] =
    useState(0)

  useEffect(() => {

    let active = true

    Promise.all([
      getPassport(candidateId),
      getMyPassport(),
    ])
      .then(([record, passportData]) => {

        if (!active) return

        setPassport(record)
        setData(passportData)

      })
      .catch((err) => {

        if (active) {
          setError(getErrorMessage(err))
        }

      })
      .finally(() => {

        if (active) setLoading(false)

      })

    return () => {
      active = false
    }

  }, [candidateId, reloadKey])

  const verifiedCount =
    data?.verified_skills.length || 0

  const shareUrl = passport?.is_published
    ? getPassportUrl(passport.share_token)
    : undefined

  function refreshPassport() {

    setLoading(true)
    setError('')

    setReloadKey(
      (previous) => previous + 1
    )

  }

  // Generate passport

  async function handleGenerate() {

    if (busy || loading) return

    setBusy(true)
    setError('')
    setMessage('')

    try {

      const record = await generatePassport()

      setPassport(record)

      const passportData =
        await getMyPassport()

      setData(passportData)

      setMessage(
        'Your digital skills passport has been generated.'
      )

    } catch (err) {

      setError(getErrorMessage(err))

    } finally {

      setBusy(false)

    }
  }

  // Publish or unpublish passport

  async function handleVisibility(
    publish: boolean
  ) {

    if (busy || loading) return

    const confirmed = window.confirm(

      publish

        ? 'Publish your passport?\n\n' +
          'Anyone with the sharing link can view ' +
          'your name, professional title, country, ' +
          'verified skills and professional record counts.'

        : 'Unpublish your passport?\n\n' +
          'Your previous sharing link and QR code ' +
          'will no longer work.'

    )

    if (!confirmed) return

    setBusy(true)
    setError('')
    setMessage('')

    try {

      const updated =
        await setPassportVisibility(publish)

      setPassport(updated)

      const passportData =
        await getMyPassport()

      setData(passportData)

      setMessage(

        publish
          ? 'Your passport is now published.'
          : 'Your passport is now private. Previous sharing links have been invalidated.'

      )

    } catch (err) {

      setError(getErrorMessage(err))

    } finally {

      setBusy(false)

    }
  }

  // Copy public link

  async function handleCopy() {

    if (!shareUrl) return

    setError('')
    setMessage('')

    try {

      await navigator.clipboard.writeText(
        shareUrl
      )

      setMessage(
        'Passport verification link copied.'
      )

    } catch {

      setError(
        'Unable to copy the link automatically. You can copy it manually.'
      )

    }
  }

  // Print or export passport as PDF

  function handleDownload() {

    if (!data) return

    window.print()

  }

  return (

    <div className="mx-auto max-w-5xl space-y-6">

      {/* Header */}

      <div className="passport-no-print flex flex-wrap items-center justify-between gap-4">

        <div>

          <h1 className="text-3xl font-extrabold">
            Digital Skills Passport
          </h1>

          <p className="mt-2 text-muted">

            Your professional identity,
            backed by verified evidence.

          </p>

        </div>

        <button
          type="button"
          disabled={loading || busy}
          onClick={refreshPassport}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-3 text-sm font-medium disabled:opacity-50"
        >

          <RefreshCw
            size={18}
            className={
              loading ? 'animate-spin' : ''
            }
          />

          Refresh

        </button>

      </div>

      {/* Feedback messages */}

      {error && (

        <p
          role="alert"
          className="passport-no-print rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >

          {error}

        </p>

      )}

      {message && (

        <p
          role="status"
          className="passport-no-print rounded-xl bg-green-50 p-4 text-sm text-green-700"
        >

          {message}

        </p>

      )}

      {/* Loading */}

      {loading ? (

        <div className="flex justify-center py-16">

          <LoaderCircle
            size={36}
            className="animate-spin text-primary"
          />

        </div>

      ) : !passport ? (

        /* Generate passport empty state */

        <section className="rounded-2xl bg-[#123C35] p-8 text-white sm:p-12">

          <FileBadge
            size={56}
            className="mb-6 text-[#D5F76A]"
          />

          <h2 className="text-3xl font-extrabold">

            Your skills. Your identity.
            Your future.

          </h2>

          <p className="mt-4 max-w-xl leading-relaxed text-white/70">

            Generate a portable professional
            credential that brings together
            your verified competencies and
            supporting evidence.

          </p>

          <button
            type="button"
            disabled={busy}
            onClick={() => void handleGenerate()}
            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-[#D5F76A] px-6 py-4 font-bold text-[#123C35] disabled:opacity-50"
          >

            {busy ? (

              <LoaderCircle
                size={20}
                className="animate-spin"
              />

            ) : (

              <ShieldCheck size={20} />

            )}

            Generate my passport

          </button>

        </section>

      ) : (

        <>

          {/* Passport visibility controls */}

          <section className="passport-no-print rounded-xl border border-border bg-white p-6">

            <div className="flex flex-wrap items-start justify-between gap-5">

              <div className="flex items-start gap-4">

                <div className="rounded-xl bg-brand-50 p-3 text-primary">

                  {passport.is_published

                    ? <Globe size={26} />

                    : <Lock size={26} />

                  }

                </div>

                <div>

                  <h2 className="font-bold">

                    {passport.is_published

                      ? 'Passport is published'

                      : 'Passport is private'

                    }

                  </h2>

                  <p className="mt-2 max-w-md text-sm text-muted">

                    {passport.is_published

                      ? 'Anyone with your verification link can view the published passport.'

                      : 'Only you can access this passport until you publish it.'

                    }

                  </p>

                </div>

              </div>

              <button
                type="button"
                disabled={
                  busy ||
                  (!passport.is_published &&
                    verifiedCount === 0)
                }
                onClick={() =>
                  void handleVisibility(
                    !passport.is_published
                  )
                }
                className={`inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold disabled:opacity-50 ${
                  passport.is_published
                    ? 'border border-border'
                    : 'bg-primary text-white'
                }`}
              >

                {passport.is_published
                  ? <Lock size={18} />
                  : <Globe size={18} />
                }

                {passport.is_published

                  ? 'Unpublish'

                  : 'Publish passport'

                }

              </button>

            </div>

            {verifiedCount === 0 && (

              <div className="mt-5 rounded-xl bg-amber-50 p-4">

                <p className="text-sm text-amber-800">

                  You need at least one verified
                  professional skill before you
                  can publish your passport.

                </p>

                <Link
                  to="/evidence"
                  className="mt-3 inline-block text-sm font-semibold text-primary"
                >

                  Manage supporting evidence

                </Link>

              </div>

            )}

          </section>

          {/* Passport preview */}

          {data ? (

            <PassportCard
              data={data}
              shareUrl={shareUrl}
            />

          ) : (

            <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">

              Passport data is unavailable.
              Please refresh.

            </p>

          )}

          {/* Passport actions */}

          <div className="passport-no-print grid gap-3 sm:grid-cols-3">

            <button
              type="button"
              disabled={!data || busy}
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 font-semibold text-white disabled:opacity-50"
            >

              <Download size={20} />

              Save as PDF

            </button>

            <button
              type="button"
              disabled={!shareUrl || busy}
              onClick={() => void handleCopy()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 py-4 font-semibold disabled:opacity-50"
            >

              <Copy size={20} />

              Copy sharing link

            </button>

            {shareUrl && (

              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 py-4 font-semibold text-primary"
              >

                <ExternalLink size={20} />

                Public preview

              </a>

            )}

          </div>

          {/* Public sharing link */}

          {shareUrl && (

            <section className="passport-no-print rounded-xl border border-border bg-white p-5">

              <div className="flex items-center gap-2">

                <BadgeCheck
                  size={20}
                  className="text-primary"
                />

                <h3 className="font-bold">

                  Your public verification link

                </h3>

              </div>

              <input
                readOnly
                aria-label="Public passport link"
                value={shareUrl}
                onFocus={(event) =>
                  event.target.select()
                }
                className="mt-4 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm"
              />

              <p className="mt-3 text-xs text-muted">

                Share this link only with people
                you want to access your published
                professional information.

              </p>

            </section>

          )}

        </>

      )}

    </div>

  )
}