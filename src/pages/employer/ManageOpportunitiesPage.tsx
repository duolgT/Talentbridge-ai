import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useLocation,
} from 'react-router-dom'

import {
  BriefcaseBusiness,
  Plus,
  Search,
  RefreshCw,
  LoaderCircle,
  CircleAlert,
  CheckCircle2,
  FileText,
  Globe,
  Lock,
  Pencil,
  Eye,
  MapPin,
  CalendarDays,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

import { useAuthStore } from '../../store/authStore'

import {
  getEmployerOpportunities,
  getEmployerApplications,
  publishOpportunity,
  closeOpportunity,
} from '../../services/employerService'

import type {
  Opportunity,
  OpportunityStatus,
} from '../../types/opportunity'

import type {
  EmployerApplication,
} from '../../types/employer'

import {
  isDeadlinePassed,
} from '../../utils/opportunityUtils'

type StatusFilter =
  | 'all'
  | OpportunityStatus

function getErrorMessage(error: unknown): string {

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    return String(error.message)
  }

  return 'Unable to complete the requested action.'
}

const statusStyles: Record<
  OpportunityStatus,
  string
> = {

  draft:
    'bg-amber-50 text-amber-700',

  published:
    'bg-emerald-50 text-emerald-700',

  closed:
    'bg-slate-100 text-slate-600',

}

export default function ManageOpportunitiesPage() {

  const profile = useAuthStore(
    (state) => state.profile
  )

  if (!profile) return null

  return (

    <ManageWorkspace
      key={profile.id}
      employerId={profile.id}
    />

  )
}

function ManageWorkspace({
  employerId,
}: {
  employerId: string
}) {

  const location = useLocation()

  // Database state

  const [opportunities, setOpportunities] =
    useState<Opportunity[]>([])

  const [applications, setApplications] =
    useState<EmployerApplication[]>([])

  // Interface state

  const [loading, setLoading] =
    useState(true)

  const [busyId, setBusyId] =
    useState<string | null>(null)

  const [reloadKey, setReloadKey] =
    useState(0)

  const [error, setError] =
    useState('')

  const [message, setMessage] =
    useState<string>(() =>
      typeof location.state?.message === 'string'

        ? location.state.message

        : ''
    )

  // Filters

  const [search, setSearch] =
    useState('')

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all')

  const [expandedId, setExpandedId] =
    useState<string | null>(null)

  // Load employer records

  useEffect(() => {

    let active = true

    Promise.all([

      getEmployerOpportunities(employerId),

      getEmployerApplications(employerId),

    ])
      .then(([listings, receivedApplications]) => {

        if (!active) return

        setOpportunities(listings)

        setApplications(receivedApplications)

      })
      .catch((err: unknown) => {

        if (active) {
          setError(getErrorMessage(err))
        }

      })
      .finally(() => {

        if (active) {
          setLoading(false)
        }

      })

    return () => {
      active = false
    }

  }, [employerId, reloadKey])

  // Derived statistics

  const statistics = [

    {
      label: 'Total listings',
      value: opportunities.length,
      icon: BriefcaseBusiness,
    },

    {
      label: 'Drafts',
      value: opportunities.filter(
        (item) => item.status === 'draft'
      ).length,
      icon: FileText,
    },

    {
      label: 'Published',
      value: opportunities.filter(
        (item) => item.status === 'published'
      ).length,
      icon: Globe,
    },

    {
      label: 'Closed',
      value: opportunities.filter(
        (item) => item.status === 'closed'
      ).length,
      icon: Lock,
    },

  ]

  // Calculate application counts by opportunity

  const applicationCounts = new Map<string, number>()

  for (const application of applications) {

    applicationCounts.set(

      application.opportunity_id,

      (
        applicationCounts.get(
          application.opportunity_id
        ) ?? 0
      ) + 1

    )

  }

  const normalizedSearch =
    search.trim().toLowerCase()

  const filteredOpportunities =
    opportunities.filter((item) => {

      if (
        statusFilter !== 'all' &&
        item.status !== statusFilter
      ) {
        return false
      }

      const searchableText = [

        item.title,

        item.organization,

        item.description,

        item.location ?? '',

        item.opportunity_type,

        ...item.opportunity_skills.map(
          (skill) => skill.skills.name
        ),

      ]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(
        normalizedSearch
      )

    })

  // Reload data

  function refreshData() {

    setLoading(true)

    setError('')

    setMessage('')

    setReloadKey(
      (previous) => previous + 1
    )

  }

  // Publish existing draft

  async function handlePublish(
    opportunity: Opportunity
  ) {

    if (
      busyId ||
      loading ||
      opportunity.status !== 'draft' ||
      opportunity.is_demo
    ) return

    const hasRequiredSkill =
      opportunity.opportunity_skills.some(
        (item) => item.is_required
      )

    if (!hasRequiredSkill) {

      setError(
        'Add at least one required skill before publishing.'
      )

      return

    }

    if (isDeadlinePassed(opportunity.deadline)) {

      setError(
        'Update the application deadline before publishing.'
      )

      return

    }

    const confirmed = window.confirm(

      `Publish "${opportunity.title}"? This listing will become discoverable to candidates and cannot be edited after publication.`

    )

    if (!confirmed) return

    setBusyId(opportunity.id)

    setError('')

    setMessage('')

    try {

      await publishOpportunity(
        opportunity.id
      )

      setOpportunities((previous) =>

        previous.map((item) =>

          item.id === opportunity.id

            ? {
                ...item,
                status: 'published',
              }

            : item

        )

      )

      setMessage(
        'Opportunity published successfully.'
      )

    } catch (err) {

      setError(getErrorMessage(err))

    } finally {

      setBusyId(null)

    }

  }

  // Close published opportunity

  async function handleClose(
    opportunity: Opportunity
  ) {

    if (
      busyId ||
      loading ||
      opportunity.status !== 'published'
    ) return

    const confirmed = window.confirm(

      `Close "${opportunity.title}"? New applications will no longer be accepted. Existing applications will be preserved. This action cannot be reversed in the current version.`

    )

    if (!confirmed) return

    setBusyId(opportunity.id)

    setError('')

    setMessage('')

    try {

      await closeOpportunity(
        opportunity.id
      )

      setOpportunities((previous) =>

        previous.map((item) =>

          item.id === opportunity.id

            ? {
                ...item,
                status: 'closed',
              }

            : item

        )

      )

      setMessage(
        'Opportunity closed successfully.'
      )

    } catch (err) {

      setError(getErrorMessage(err))

    } finally {

      setBusyId(null)

    }

  }

  return (

    <div className="mx-auto max-w-7xl space-y-6">

      {/* Page heading */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>

          <h1 className="text-3xl font-extrabold text-[#123C35]">

            Manage opportunities

          </h1>

          <p className="mt-2 text-sm text-slate-500">

            Create, publish and manage your
            recruitment listings.

          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            disabled={loading || busyId !== null}
            onClick={refreshData}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#123C35] disabled:opacity-50"
          >

            <RefreshCw
              size={17}
              className={
                loading ? 'animate-spin' : ''
              }
            />

            Refresh

          </button>

          <Link
            to="/employer/opportunities/create"
            className="inline-flex items-center gap-2 rounded-xl bg-[#16826B] px-5 py-3 text-sm font-semibold text-white"
          >

            <Plus size={18} />

            Create opportunity

          </Link>

        </div>

      </div>

      {/* Error and success messages */}

      {error && (

        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        >

          <CircleAlert
            size={20}
            className="shrink-0"
          />

          <p className="text-sm">

            {error}

          </p>

        </div>

      )}

      {message && (

        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700"
        >

          <CheckCircle2
            size={20}
            className="shrink-0"
          />

          <p className="text-sm">

            {message}

          </p>

        </div>

      )}

      {/* Loading state */}

      {loading ? (

        <div
          role="status"
          className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-20"
        >

          <LoaderCircle
            size={38}
            className="animate-spin text-[#16826B]"
          />

          <p className="mt-4 text-sm text-slate-500">

            Loading your opportunities...

          </p>

        </div>

      ) : (

        <>

          {/* Statistics */}

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">

            {statistics.map((item) => (

              <article
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >

                <item.icon
                  size={24}
                  className="text-[#16826B]"
                />

                <p className="mt-4 text-sm text-slate-500">

                  {item.label}

                </p>

                <p className="mt-2 text-3xl font-extrabold text-[#123C35]">

                  {item.value}

                </p>

              </article>

            ))}

          </div>

          {/* Search and status filter */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="grid gap-4 md:grid-cols-3">

              <div className="relative md:col-span-2">

                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  aria-label="Search opportunities"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search your opportunities..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm"
                />

              </div>

              <select
                aria-label="Filter by opportunity status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as StatusFilter
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              >

                <option value="all">
                  All statuses
                </option>

                <option value="draft">
                  Draft
                </option>

                <option value="published">
                  Published
                </option>

                <option value="closed">
                  Closed
                </option>

              </select>

            </div>

          </section>

          <div className="flex items-center justify-between">

            <h2 className="text-lg font-bold text-[#123C35]">

              Your listings

            </h2>

            <p className="text-sm text-slate-500">

              {filteredOpportunities.length} results

            </p>

          </div>

          {/* Empty state */}

          {filteredOpportunities.length === 0 ? (

            <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">

              <BriefcaseBusiness
                size={44}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 text-lg font-semibold text-[#123C35]">

                No opportunities found

              </h3>

              <p className="mt-2 text-sm text-slate-500">

                {opportunities.length === 0

                  ? 'Create your first recruitment listing.'

                  : 'Try changing your search or status filter.'

                }

              </p>

              {opportunities.length === 0 ? (

                <Link
                  to="/employer/opportunities/create"
                  className="mt-5 inline-flex rounded-xl bg-[#16826B] px-5 py-3 text-sm font-semibold text-white"
                >

                  Create opportunity

                </Link>

              ) : (

                <button
                  type="button"
                  onClick={() => {

                    setSearch('')

                    setStatusFilter('all')

                  }}
                  className="mt-5 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-[#16826B]"
                >

                  Clear filters

                </button>

              )}

            </section>

          ) : (

            <div className="space-y-4">

              {filteredOpportunities.map((item) => {

                const expanded =
                  expandedId === item.id

                const busy =
                  busyId === item.id

                const requiredSkills =
                  item.opportunity_skills.filter(
                    (skill) => skill.is_required
                  )

                const preferredSkills =
                  item.opportunity_skills.filter(
                    (skill) => !skill.is_required
                  )

                const expired =
                  isDeadlinePassed(item.deadline)

                return (

                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                  >

                    {/* Listing information */}

                    <div className="flex flex-wrap items-start gap-4">

                      <div className="rounded-xl bg-[#EAF3EE] p-3 text-[#16826B]">

                        <BriefcaseBusiness size={26} />

                      </div>

                      <div className="min-w-0 flex-1">

                        <h3 className="break-words text-lg font-bold text-[#123C35]">

                          {item.title}

                        </h3>

                        <p className="mt-1 text-sm text-slate-500">

                          {item.organization}

                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">

                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-600">

                            {item.opportunity_type}

                          </span>

                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-600">

                            {item.work_mode}

                          </span>

                          {item.is_demo && (

                            <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs text-amber-700">

                              Demo listing

                            </span>

                          )}

                          {expired && (

                            <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs text-red-700">

                              Deadline passed

                            </span>

                          )}

                        </div>

                      </div>

                      <span className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusStyles[item.status]}`}>

                        {item.status}

                      </span>

                    </div>

                    {/* Metadata */}

                    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">

                      <span className="inline-flex items-center gap-2">

                        <MapPin size={16} />

                        {item.location ||
                          'Location not specified'}

                      </span>

                      <span className="inline-flex items-center gap-2">

                        <CalendarDays size={16} />

                        {item.deadline ||
                          'No deadline'}

                      </span>

                      <span className="inline-flex items-center gap-2">

                        <Users size={16} />

                        {applicationCounts.get(item.id) ?? 0}{' '}
                        applications

                      </span>

                    </div>

                    {/* Competency summary */}

                    <div className="mt-5 flex flex-wrap gap-3">

                      <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">

                        {requiredSkills.length}{' '}
                        required skills

                      </span>

                      <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">

                        {preferredSkills.length}{' '}
                        preferred skills

                      </span>

                    </div>

                    {/* Expanded details */}

                    {expanded && (

                      <div className="mt-5 space-y-5 rounded-xl bg-[#F6F8F5] p-5">

                        <div>

                          <h4 className="font-semibold text-[#123C35]">

                            Description

                          </h4>

                          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600">

                            {item.description}

                          </p>

                        </div>

                        <div>

                          <h4 className="font-semibold text-[#123C35]">

                            Compensation

                          </h4>

                          <p className="mt-2 text-sm text-slate-600">

                            {item.compensation ||
                              'Not specified'}

                          </p>

                        </div>

                        <div>

                          <h4 className="font-semibold text-[#123C35]">

                            Required competencies

                          </h4>

                          <div className="mt-3 flex flex-wrap gap-2">

                            {requiredSkills.map((skill) => (

                              <span
                                key={skill.id}
                                className="rounded-lg bg-white px-3 py-2 text-xs text-[#16826B]"
                              >

                                {skill.skills.name}

                              </span>

                            ))}

                            {requiredSkills.length === 0 && (

                              <p className="text-sm text-slate-500">

                                No required skills selected.

                              </p>

                            )}

                          </div>

                        </div>

                        <div>

                          <h4 className="font-semibold text-[#123C35]">

                            Preferred competencies

                          </h4>

                          <div className="mt-3 flex flex-wrap gap-2">

                            {preferredSkills.map((skill) => (

                              <span
                                key={skill.id}
                                className="rounded-lg bg-white px-3 py-2 text-xs text-slate-600"
                              >

                                {skill.skills.name}

                              </span>

                            ))}

                            {preferredSkills.length === 0 && (

                              <p className="text-sm text-slate-500">

                                No preferred skills selected.

                              </p>

                            )}

                          </div>

                        </div>

                      </div>

                    )}

                    {/* Listing actions */}

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">

                      <button
                        type="button"
                        aria-expanded={expanded}
                        onClick={() =>
                          setExpandedId(
                            expanded ? null : item.id
                          )
                        }
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#16826B]"
                      >

                        <Eye size={17} />

                        {expanded

                          ? 'Hide details'

                          : 'View details'

                        }

                        {expanded

                          ? <ChevronUp size={16} />

                          : <ChevronDown size={16} />

                        }

                      </button>

                      <div className="flex flex-wrap gap-3">

                        {/* Draft actions */}

                        {item.status === 'draft' &&
                          !item.is_demo && (

                          <>

                            <Link
                              to={`/employer/opportunities/${item.id}/edit`}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#123C35]"
                            >

                              <Pencil size={16} />

                              Edit draft

                            </Link>

                            <button
                              type="button"
                              disabled={busyId !== null}
                              onClick={() =>
                                void handlePublish(item)
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-[#16826B] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                            >

                              {busy

                                ? <LoaderCircle
                                    size={16}
                                    className="animate-spin"
                                  />

                                : <Globe size={16} />

                              }

                              {busy
                                ? 'Publishing...'
                                : 'Publish'}

                            </button>

                          </>

                        )}

                        {/* Published actions */}

                        {item.status === 'published' && (

                          <button
                            type="button"
                            disabled={busyId !== null}
                            onClick={() =>
                              void handleClose(item)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >

                            {busy

                              ? <LoaderCircle
                                  size={16}
                                  className="animate-spin"
                                />

                              : <Lock size={16} />

                            }

                            {busy
                              ? 'Closing...'
                              : 'Close listing'}

                          </button>

                        )}

                        {/* Closed listing state */}

                        {item.status === 'closed' && (

                          <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-600">

                            <Lock size={15} />

                            Recruitment closed

                          </span>

                        )}

                      </div>

                    </div>

                  </article>

                )

              })}

            </div>

          )}

        </>

      )}

      {/* Lifecycle guidance */}

      <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-[#EAF3EE] p-5">

        <CircleAlert
          size={20}
          className="shrink-0 text-[#16826B]"
        />

        <p className="text-xs leading-relaxed text-slate-600">

          Draft opportunities are private and editable.
          Published opportunities are visible to
          candidates. Closing a listing prevents new
          applications while preserving previously
          submitted applications.

        </p>

      </div>

    </div>

  )
}