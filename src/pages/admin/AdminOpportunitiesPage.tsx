import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'

import {
  BriefcaseBusiness,
  Search,
  RefreshCw,
  LoaderCircle,
  CircleAlert,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Archive,
  ShieldCheck,
  MapPin,
  Users,
} from 'lucide-react'

import { useAuthStore } from '../../store/authStore'

import {
  getAdminOpportunities,
  adminCloseOpportunity,
} from '../../services/adminService'

import type {
  AdminOpportunity,
  AdminOpportunityFilter,
} from '../../types/admin'

const PAGE_SIZE = 20

const statusStyles = {
  draft: 'bg-slate-100 text-slate-600',
  published: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-red-50 text-red-700',
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    return String(error.message)
  }

  return 'Unable to complete the operation.'
}

export default function AdminOpportunitiesPage() {
  const profile = useAuthStore((state) => state.profile)

  if (!profile) return null

  return <OpportunityWorkspace key={profile.id} />
}

function OpportunityWorkspace() {
  const [records, setRecords] =
    useState<AdminOpportunity[]>([])

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const [status, setStatus] =
    useState<AdminOpportunityFilter>('all')

  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [expandedId, setExpandedId] =
    useState<string | null>(null)

  const [selected, setSelected] =
    useState<AdminOpportunity | null>(null)

  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [closing, setClosing] = useState(false)
  const [closeError, setCloseError] = useState('')

  const closingRef = useRef(false)

  useEffect(() => {
    let active = true

    getAdminOpportunities({
      search,
      status,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    })
      .then((result) => {
        if (!active) return

        setRecords(result.opportunities)
        setHasMore(result.hasMore)
      })
      .catch((err: unknown) => {
        if (!active) return

        setError(getErrorMessage(err))
        setRecords([])
        setHasMore(false)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [search, status, page, reloadKey])

  function prepareReload() {
    setLoading(true)
    setError('')
    setRecords([])
    setHasMore(false)
    setExpandedId(null)
  }

  function refresh() {
    if (loading || closing) return

    prepareReload()
    setMessage('')
    setReloadKey((previous) => previous + 1)
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    prepareReload()
    setPage(0)
    setSearch(searchInput.trim())
    setReloadKey((previous) => previous + 1)
  }

  function openClosure(record: AdminOpportunity) {
    setSelected(record)
    setReason('')
    setConfirmed(false)
    setCloseError('')
  }

  async function handleClose(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (
      !selected ||
      selected.status !== 'published' ||
      !confirmed ||
      closingRef.current ||
      reason.trim().length < 10 ||
      reason.trim().length > 1000
    ) return

    if (!window.confirm(
      'Close this opportunity? Existing applications will be preserved, but new applications will be blocked.'
    )) return

    closingRef.current = true
    setClosing(true)
    setCloseError('')
    setMessage('')

    try {
      await adminCloseOpportunity({
        opportunityId: selected.id,
        reason,
      })

      setSelected(null)

      setMessage(
        'Opportunity closed successfully. The action has been recorded in the audit log.'
      )

      prepareReload()
      setPage(0)
      setReloadKey((previous) => previous + 1)
    } catch (err) {
      setCloseError(getErrorMessage(err))
    } finally {
      closingRef.current = false
      setClosing(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#123C35]">
            Opportunity oversight
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor and moderate UjuziLink recruitment listings.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading || closing || selected !== null}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      <section className="rounded-3xl bg-[#123C35] p-7 text-white">
        <ShieldCheck size={38} className="text-[#D5F76A]" />

        <h2 className="mt-4 text-2xl font-bold">
          Protect responsible recruitment.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
          Monitor opportunities and close listings that violate
          platform requirements. Existing application records
          are preserved for accountability.
        </p>
      </section>

      {error && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          <CircleAlert size={20} />
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="flex gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          <CheckCircle2 size={20} />
          {message}
        </div>
      )}

      <section className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-5">

        <form
          onSubmit={handleSearch}
          className="flex min-w-0 flex-1 gap-2"
        >
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-4 top-3.5 text-slate-400"
            />

            <input
              type="search"
              aria-label="Search opportunities"
              value={searchInput}
              maxLength={200}
              disabled={selected !== null}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Search title, employer or organization..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={selected !== null}
            className="rounded-xl bg-[#16826B] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            Search
          </button>
        </form>

        <select
          aria-label="Filter listing status"
          value={status}
          disabled={selected !== null}
          onChange={(event) => {
            const next = event.target.value as AdminOpportunityFilter

            if (next === status) return

            prepareReload()
            setPage(0)
            setStatus(next)
          }}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
        </select>
      </section>

      {loading ? (
        <div
          role="status"
          className="flex justify-center rounded-2xl bg-white py-16"
        >
          <LoaderCircle
            size={36}
            className="animate-spin text-[#16826B]"
          />
        </div>
      ) : !error ? (
        <>
          <div className="space-y-4">

            {records.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">

                <BriefcaseBusiness
                  size={42}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 font-bold text-[#123C35]">
                  No opportunities found
                </h3>
              </div>
            )}

            {records.map((record) => (
              <article
                key={record.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start gap-4">

                  <div className="rounded-xl bg-[#EAF3EE] p-4 text-[#16826B]">
                    <BriefcaseBusiness size={25} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-[#123C35]">
                      {record.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                      {record.organization}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Employer: {record.employer_name || 'Unnamed employer'}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[record.status]}`}>
                        {record.status}
                      </span>

                      {record.is_demo && (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">
                          Demo listing
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users size={17} />
                    {record.application_count} applications
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={15} />
                    {record.location || 'Location unspecified'}
                  </span>

                  <span className="capitalize">
                    {record.opportunity_type}
                  </span>

                  <span className="capitalize">
                    {record.work_mode}
                  </span>

                  <span>
                    Deadline: {record.deadline || 'Not specified'}
                  </span>
                </div>

                {expandedId === record.id && (
                  <div className="mt-5 space-y-3 rounded-xl bg-[#F6F8F5] p-5">
                    <h3 className="font-semibold text-[#123C35]">
                      Listing description
                    </h3>

                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600">
                      {record.description}
                    </p>

                    <p className="text-sm text-slate-600">
                      Compensation: {record.compensation || 'Not specified'}
                    </p>

                    <p className="break-all font-mono text-xs text-slate-500">
                      Listing ID: {record.id}
                    </p>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">

                  <button
                    type="button"
                    aria-expanded={expandedId === record.id}
                    onClick={() =>
                      setExpandedId(
                        expandedId === record.id ? null : record.id
                      )
                    }
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
                  >
                    {expandedId === record.id
                      ? 'Hide details'
                      : 'View details'}
                  </button>

                  {record.status === 'published' && (
                    <button
                      type="button"
                      disabled={selected !== null}
                      onClick={() => openClosure(record)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-50"
                    >
                      <Archive size={17} />
                      Close listing
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">

            <p className="text-sm text-slate-500">
              Page {page + 1} · {records.length} records
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0 || selected !== null}
                onClick={() => {
                  prepareReload()
                  setPage((previous) => previous - 1)
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <button
                type="button"
                disabled={!hasMore || selected !== null}
                onClick={() => {
                  prepareReload()
                  setPage((previous) => previous + 1)
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
              >
                Next
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </>
      ) : null}

      {selected && (
        <section className="rounded-2xl border border-red-200 bg-white p-6">

          <h2 className="text-xl font-bold text-red-700">
            Administrative listing closure
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Selected listing: {selected.title}
          </p>

          <form
            onSubmit={handleClose}
            className="mt-5 space-y-4"
          >
            <label
              htmlFor="closure-reason"
              className="block text-sm font-semibold"
            >
              Reason for closure
            </label>

            <textarea
              id="closure-reason"
              value={reason}
              minLength={10}
              maxLength={1000}
              required
              disabled={closing}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 p-4 text-sm"
            />

            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={confirmed}
                disabled={closing}
                onChange={(event) =>
                  setConfirmed(event.target.checked)
                }
                className="mt-1 accent-[#16826B]"
              />

              I confirm that this closure is authorized.
              Existing applications will be preserved.
            </label>

            {closeError && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
              >
                {closeError}
              </p>
            )}

            <div className="flex justify-end gap-3">

              <button
                type="button"
                disabled={closing}
                onClick={() => setSelected(null)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  closing ||
                  !confirmed ||
                  reason.trim().length < 10
                }
                className="rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {closing ? 'Closing...' : 'Confirm closure'}
              </button>
            </div>
          </form>
        </section>
      )}

    </div>
  )
}