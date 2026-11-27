import { useEffect, useState } from 'react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import {
  ShieldCheck,
  ShieldAlert,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react'

import PassportCard from '../../features/passport/PassportCard'

import {
  verifyPassport,
  getPassportUrl,
} from '../../services/passportService'

import type {
  PassportData,
} from '../../types/passport'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default function VerifyPassportPage() {

  const { token } = useParams()

  return (

    <VerificationWorkspace
      key={token || 'invalid'}
      token={token || ''}
    />

  )
}

function VerificationWorkspace({
  token,
}: {
  token: string
}) {

  const [data, setData] =
    useState<PassportData | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [reloadKey, setReloadKey] =
    useState(0)

  useEffect(() => {

    let active = true

    async function loadPassport() {

      try {

        if (!UUID_PATTERN.test(token)) {
          return
        }

        const result =
          await verifyPassport(token)

        if (active) {
          setData(result)
        }

      } catch {

        if (active) {

          setError(
            'Unable to verify this passport. Please try again.'
          )

        }

      } finally {

        if (active) {
          setLoading(false)
        }

      }
    }

    void loadPassport()

    return () => {
      active = false
    }

  }, [token, reloadKey])

  function refresh() {

    setLoading(true)
    setError('')
    setData(null)

    setReloadKey(
      (previous) => previous + 1
    )

  }

  return (

    <main className="min-h-screen bg-[#F6F8F5]">

      {/* Public header */}

      <header className="passport-no-print border-b border-slate-200 bg-white px-5 py-5">

        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">

          <Link
            to="/"
            className="flex items-center gap-3"
          >

            <ShieldCheck
              size={32}
              className="text-[#16826B]"
            />

            <div>

              <h1 className="font-extrabold text-[#123C35]">

                UjuziLink

              </h1>

              <p className="text-xs text-slate-500">

                Public credential verification

              </p>

            </div>

          </Link>

          <Link
            to="/"
            className="text-sm font-medium text-[#16826B]"
          >

            About UjuziLink

          </Link>

        </div>

      </header>

      <div className="mx-auto max-w-5xl space-y-6 p-5 sm:py-12">

        {loading ? (

          <div className="py-24 text-center">

            <LoaderCircle
              size={44}
              className="mx-auto animate-spin text-[#16826B]"
            />

            <h2 className="mt-5 font-semibold">

              Verifying passport...

            </h2>

          </div>

        ) : error ? (

          <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center">

            <ShieldAlert
              size={48}
              className="mx-auto text-amber-600"
            />

            <h2 className="mt-5 text-xl font-bold">

              Verification unavailable

            </h2>

            <p className="mt-3 text-sm text-slate-500">

              {error}

            </p>

            <button
              type="button"
              onClick={refresh}
              className="mt-6 rounded-lg bg-[#16826B] px-5 py-3 font-semibold text-white"
            >

              Try again

            </button>

          </section>

        ) : !data ? (

          <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center">

            <ShieldAlert
              size={52}
              className="mx-auto text-slate-400"
            />

            <h2 className="mt-5 text-2xl font-bold">

              Passport unavailable

            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">

              This passport may be private,
              unpublished or associated with
              an invalid or expired sharing link.

            </p>

            <Link
              to="/"
              className="mt-6 inline-block rounded-lg bg-[#16826B] px-5 py-3 font-semibold text-white"
            >

              Return to homepage

            </Link>

          </section>

        ) : (

          <>

            {/* Verification banner */}

            <section className="passport-no-print flex flex-wrap items-center gap-4 rounded-xl border border-green-200 bg-green-50 p-5">

              <ShieldCheck
                size={30}
                className="text-green-700"
              />

              <div className="min-w-0 flex-1">

                <h2 className="font-bold text-green-800">

                  Published UjuziLink passport

                </h2>

                <p className="mt-1 text-sm text-green-700">

                  Retrieved directly from the
                  UjuziLink credential database.

                </p>

              </div>

              <button
                type="button"
                aria-label="Refresh verification"
                onClick={refresh}
                className="rounded-lg p-2 text-green-700"
              >

                <RefreshCw size={20} />

              </button>

            </section>

            <PassportCard
              data={data}
              shareUrl={getPassportUrl(token)}
            />

          </>

        )}

      </div>

    </main>
  )
}