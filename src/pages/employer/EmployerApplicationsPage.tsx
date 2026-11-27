import { useEffect, useState } from 'react'

import {
  Users,
  Inbox,
  ClipboardList,
  UserCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  LoaderCircle,
  CircleAlert,
} from 'lucide-react'

import { useAuthStore } from '../../store/authStore'

import ApplicationCard from '../../features/employer/ApplicationCard'

import {
  getEmployerApplications,
  updateApplicationStatus,
} from '../../services/employerService'

import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_TRANSITIONS,
} from '../../constants/applicationWorkflow'

import type {
  EmployerApplication,
  EmployerApplicationDecision,
} from '../../types/employer'

import type {
  ApplicationStatus,
} from '../../types/opportunity'

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

export default function EmployerApplicationsPage() {
  const profile = useAuthStore((state) => state.profile)

  if (!profile) return null

  return (
    <ApplicationsWorkspace
      key={profile.id}
      employerId={profile.id}
    />
  )
}

function ApplicationsWorkspace({
  employerId,
}: {
  employerId: string
}) {
  const [applications, setApplications] =
    useState<EmployerApplication[]>([])

  const [loading, setLoading] = useState(true)

  const [busyId, setBusyId] =
    useState<string | null>(null)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [search, setSearch] = useState('')

  const [statusFilter, setStatusFilter] =
    useState<ApplicationStatus | 'all'>('all')

  const [opportunityFilter, setOpportunityFilter] =
    useState('all')

  useEffect(() => {
    let active = true

    getEmployerApplications(employerId)
      .then((data) => {
        if (active) setApplications(data)
      })
      .catch((err: unknown) => {
        if (active) {
          setError(getErrorMessage(err))
          setApplications([])
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [employerId, reloadKey])

  function refresh() {
    if (loading || busyId) return

    setError('')
    setMessage('')
    setLoading(true)
    setReloadKey((previous) => previous + 1)
  }

  async function handleDecision(
    applicationId: string,
    decision: EmployerApplicationDecision
  ) {
    if (busyId || loading) return

    const application = applications.find(
      (item) => item.id === applicationId
    )

    if (
      !application ||
      !APPLICATION_TRANSITIONS[application.status].includes(decision)
    ) {
      setError('Invalid application status transition.')
      return
    }

    setBusyId(applicationId)
    setError('')
    setMessage('')

    try {
      const updated = await updateApplicationStatus(
        applicationId,
        decision
      )

      setApplications((previous) =>
        previous.map((item) =>
          item.id === updated.id
            ? {
                ...item,
                ...updated,
                opportunities: item.opportunities,
              }
            : item
        )
      )

      setMessage(
        `Application updated to ${APPLICATION_STATUS_LABELS[updated.status]}.`
      )
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  const statistics = [
    {
      label: 'Total applications',
      value: applications.length,
      icon: Users,
    },
    {
      label: 'Submitted',
      value: applications.filter(
        (item) => item.status === 'submitted'
      ).length,
      icon: Inbox,
    },
    {
      label: 'Under review',
      value: applications.filter(
        (item) => item.status === 'under_review'
      ).length,
      icon: ClipboardList,
    },
    {
      label: 'Shortlisted',
      value: applications.filter(
        (item) => item.status === 'shortlisted'
      ).length,
      icon: UserCheck,
    },
    {
      label: 'Accepted',
      value: applications.filter(
        (item) => item.status === 'accepted'
      ).length,
      icon: CheckCircle2,
    },
    {
      label: 'Rejected',
      value: applications.filter(
        (item) => item.status === 'rejected'
      ).length,
      icon: XCircle,
    },
  ]

  const opportunities = [
    ...new Map(
      applications.map((item) => [
        item.opportunity_id,
        item.opportunities,
      ])
    ).values(),
  ]

  const filteredApplications = applications.filter((item) => {
    const searchableText = [
      item.candidate_id,
      item.opportunities.title,
      item.opportunities.organization,
      item.cover_letter || '',
    ].join(' ').toLowerCase()

    return (
      searchableText.includes(search.trim().toLowerCase()) &&
      (
        statusFilter === 'all' ||
        item.status === statusFilter
      ) &&
      (
        opportunityFilter === 'all' ||
        item.opportunity_id === opportunityFilter
      )
    )
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#123C35]">
            Manage applications
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review applications and discover talent through UjuziLink.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading || busyId !== null}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={loading ? 'animate-spin' : ''}
          />

          Refresh
        </button>
      </div>

      <section className="rounded-2xl bg-[#123C35] p-7 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#D5F76A]">
          Responsible recruitment
        </p>

        <h2 className="mt-3 text-2xl font-bold">
          Discover talent beyond borders.
        </h2>

        <p className="mt-3 text-sm text-white/70">
          Evaluate applications based on relevant professional
          competencies and qualifications.
        </p>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          <CircleAlert size={20} />
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          <CheckCircle2 size={20} />
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center rounded-2xl bg-white py-20">
          <LoaderCircle
            size={38}
            className="animate-spin text-[#16826B]"
          />
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {statistics.map((item) => (
              <article
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <item.icon size={24} className="text-[#16826B]" />

                <p className="mt-4 text-3xl font-bold text-[#123C35]">
                  {item.value}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {item.label}
                </p>
              </article>
            ))}
          </section>

          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-3">

            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-3.5 text-slate-400"
              />

              <input
                type="search"
                aria-label="Search applications"
                placeholder="Search applications..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm"
              />
            </div>

            <select
              aria-label="Filter application status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as ApplicationStatus | 'all'
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              <option value="all">All statuses</option>

              {Object.entries(APPLICATION_STATUS_LABELS).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>

            <select
              aria-label="Filter by opportunity"
              value={opportunityFilter}
              onChange={(event) =>
                setOpportunityFilter(event.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              <option value="all">All opportunities</option>

              {opportunities.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>

          </section>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#123C35]">
              Received applications
            </h2>

            <p className="text-sm text-slate-500">
              {filteredApplications.length} results
            </p>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <Users size={42} className="mx-auto text-slate-300" />

              <h3 className="mt-4 font-bold text-[#123C35]">
                No applications found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                New applications will appear here when candidates
                apply to your opportunities.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  busy={busyId === application.id}
                  disabled={busyId !== null}
                  onDecision={handleDecision}
                />
              ))}
            </div>
          )}

          <p className="text-xs text-slate-500">
            Acceptance represents a platform recruitment decision,
            not a formal employment contract.
          </p>
        </>
      )}
    </div>
  )
}