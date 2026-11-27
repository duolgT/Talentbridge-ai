import {
  useEffect,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import {
  BriefcaseBusiness,
  Globe,
  Users,
  UserCheck,
  Plus,
  ArrowRight,
  RefreshCw,
  LoaderCircle,
  CircleAlert,
  ClipboardList,
  FileText,
  ShieldCheck,
  Clock3,
  Building2,
  CheckCircle2,
} from 'lucide-react'

import { useAuthStore } from '../../store/authStore'

import {
  getEmployerDashboardData,
} from '../../services/employerService'

import {
  APPLICATION_STATUS_LABELS,
} from '../../constants/applicationWorkflow'

import type {
  EmployerDashboardData,
} from '../../types/employer'

// Error handling

function getErrorMessage(error: unknown): string {

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    return String(error.message)
  }

  return 'Unable to load your employer dashboard.'
}

// Main component

export default function EmployerDashboard() {

  const profile = useAuthStore(
    (state) => state.profile
  )

  if (!profile) return null

  return (

    <EmployerWorkspace
      key={profile.id}
      employerId={profile.id}
      fullName={profile.full_name}
    />

  )
}

// Employer workspace

function EmployerWorkspace({
  employerId,
  fullName,
}: {
  employerId: string
  fullName: string
}) {

  const [data, setData] =
    useState<EmployerDashboardData | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [reloadKey, setReloadKey] =
    useState(0)

  // ==========================================
  // LOAD EMPLOYER DATA
  // ==========================================

  useEffect(() => {

    let active = true

    getEmployerDashboardData(employerId)

      .then((result) => {

        if (active) {

          setData(result)

        }

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

  // ==========================================
  // REFRESH
  // ==========================================

  function handleRefresh() {

    setLoading(true)

    setError('')

    setReloadKey(
      (previous) => previous + 1
    )

  }

  // ==========================================
  // DERIVED STATE
  // ==========================================

  const firstName =
    fullName.trim().split(/\s+/)[0] || 'Employer'

  const stats = data?.stats

  const recentOpportunities =
    data?.opportunities.slice(0, 5) || []

  const recentApplications =
    data?.applications.slice(0, 5) || []

  const demoCount =
    data?.opportunities.filter(
      (item) => item.is_demo
    ).length || 0

  const statCards = [

    {
      label: 'Total opportunities',
      value: stats?.totalOpportunities ?? 0,
      icon: BriefcaseBusiness,
      color: 'bg-emerald-50 text-emerald-700',
    },

    {
      label: 'Published listings',
      value: stats?.publishedOpportunities ?? 0,
      icon: Globe,
      color: 'bg-blue-50 text-blue-700',
    },

    {
      label: 'Total applications',
      value: stats?.totalApplications ?? 0,
      icon: Users,
      color: 'bg-violet-50 text-violet-700',
    },

    {
      label: 'Shortlisted candidates',
      value: stats?.shortlisted ?? 0,
      icon: UserCheck,
      color: 'bg-amber-50 text-amber-700',
    },

  ]

  const applicationBreakdown = [

    {
      label: 'Submitted',
      value:
        data?.applications.filter(
          (item) => item.status === 'submitted'
        ).length ?? 0,
      color: 'bg-slate-400',
    },

    {
      label: 'Under review',
      value: stats?.underReview ?? 0,
      color: 'bg-blue-500',
    },

    {
      label: 'Shortlisted',
      value: stats?.shortlisted ?? 0,
      color: 'bg-amber-500',
    },

    {
      label: 'Accepted',
      value: stats?.accepted ?? 0,
      color: 'bg-emerald-600',
    },

    {
      label: 'Rejected',
      value: stats?.rejected ?? 0,
      color: 'bg-red-500',
    },

    {
      label: 'Withdrawn',
      value:
        data?.applications.filter(
          (item) => item.status === 'withdrawn'
        ).length ?? 0,
      color: 'bg-slate-300',
    },

  ]

  const quickActions = [

    {
      title: 'Create opportunity',
      description:
        'Publish employment, training or freelance listings.',
      icon: Plus,
      path: '/employer/opportunities/create',
    },

    {
      title: 'Manage opportunities',
      description:
        'Manage draft, published and closed listings.',
      icon: BriefcaseBusiness,
      path: '/employer/opportunities',
    },

    {
      title: 'Review applications',
      description:
        'Review and manage submitted applications.',
      icon: ClipboardList,
      path: '/employer/applications',
    },

    {
      title: 'Verify Skills Passport',
      description:
        'Validate a professional passport shared with you.',
      icon: ShieldCheck,
      path: '/employer/verify',
    },

  ]

  return (

    <div className="mx-auto max-w-7xl space-y-7">

      {/* Page heading */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#123C35]">

            Employer dashboard

          </h1>

          <p className="mt-2 text-sm text-slate-500">

            Welcome back, {firstName}.
            Manage your recruitment workspace.

          </p>

        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#123C35] transition-colors hover:bg-slate-50 disabled:opacity-50"
        >

          <RefreshCw
            size={17}
            className={loading ? 'animate-spin' : ''}
          />

          Refresh

        </button>

      </div>

      {/* Hero section */}

      <section className="relative overflow-hidden rounded-3xl bg-[#123C35] p-6 text-white sm:p-10">

        {/* Decorative background */}

        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />

        <div className="pointer-events-none absolute -bottom-24 right-12 h-64 w-64 rounded-full border border-white/10" />

        <div className="pointer-events-none absolute right-10 top-8 hidden text-white/5 md:block">

          <Building2 size={230} strokeWidth={1} />

        </div>

        <div className="relative max-w-2xl">

          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-medium tracking-wide text-[#D5F76A]">

            <ShieldCheck size={15} />

            Inclusive recruitment

          </span>

          <h2 className="mt-6 text-3xl font-extrabold leading-tight sm:text-4xl">

            Discover talent
            <span className="block text-[#D5F76A]">

              beyond borders.

            </span>

          </h2>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">

            Connect with skilled professionals,
            create meaningful opportunities and
            discover evidence-backed competencies
            through UjuziLink.

          </p>

          <div className="mt-7 flex flex-wrap gap-3">

            <Link
              to="/employer/opportunities/create"
              className="inline-flex items-center gap-2 rounded-xl bg-[#D5F76A] px-5 py-3.5 text-sm font-bold text-[#123C35] transition-opacity hover:opacity-90"
            >

              <Plus size={20} />

              Create opportunity

            </Link>

            <Link
              to="/employer/applications"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >

              Review applications

              <ArrowRight size={17} />

            </Link>

          </div>

        </div>

      </section>

      {/* Error feedback */}

      {error && (

        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        >

          <CircleAlert
            size={22}
            className="shrink-0"
          />

          <div className="flex-1">

            <p className="font-semibold">

              Unable to refresh dashboard

            </p>

            <p className="mt-1 text-sm">

              {error}

            </p>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="mt-3 text-sm font-semibold underline"
            >

              Try again

            </button>

          </div>

        </div>

      )}

      {/* Loading */}

      {loading ? (

        <div
          role="status"
          className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-20"
        >

          <LoaderCircle
            size={40}
            className="animate-spin text-[#16826B]"
          />

          <p className="mt-4 text-sm text-slate-500">

            Loading your recruitment workspace...

          </p>

        </div>

      ) : data ? (

        <>

          {/* Dashboard statistics */}

          <section>

            <div className="mb-4">

              <h2 className="text-xl font-bold text-[#123C35]">

                Recruitment overview

              </h2>

              <p className="mt-1 text-sm text-slate-500">

                Statistics from your opportunities
                and received applications.

              </p>

            </div>

            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">

              {statCards.map((item) => (

                <article
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >

                  <div className={`inline-flex rounded-xl p-3 ${item.color}`}>

                    <item.icon size={23} />

                  </div>

                  <p className="mt-5 text-sm font-medium text-slate-500">

                    {item.label}

                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-[#123C35]">

                    {item.value}

                  </p>

                </article>

              ))}

            </div>

          </section>

          {/* Demo data notice */}

          {demoCount > 0 && (

            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">

              <CircleAlert
                size={20}
                className="shrink-0"
              />

              <p className="text-sm leading-relaxed">

                Your workspace contains {demoCount}{' '}
                demonstration {demoCount === 1
                  ? 'listing'
                  : 'listings'}.
                These are fictional and cannot
                receive real applications.

              </p>

            </div>

          )}

          {/* Application pipeline and listing status */}

          <div className="grid gap-6 xl:grid-cols-3">

            {/* Application pipeline */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

              <div className="flex flex-wrap items-center justify-between gap-3">

                <div>

                  <h2 className="text-lg font-bold text-[#123C35]">

                    Application pipeline

                  </h2>

                  <p className="mt-1 text-sm text-slate-500">

                    Current application status distribution

                  </p>

                </div>

                <Link
                  to="/employer/applications"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#16826B]"
                >

                  View applications

                  <ArrowRight size={16} />

                </Link>

              </div>

              <div className="mt-7 space-y-5">

                {applicationBreakdown.map((item) => {

                  const total =
                    stats?.totalApplications || 0

                  const percentage =
                    total > 0
                      ? item.value / total * 100
                      : 0

                  return (

                    <div key={item.label}>

                      <div className="mb-2 flex items-center justify-between gap-3">

                        <span className="text-sm font-medium text-slate-600">

                          {item.label}

                        </span>

                        <span className="text-sm font-bold text-[#123C35]">

                          {item.value}

                        </span>

                      </div>

                      <div
                        role="progressbar"
                        aria-label={`${item.label} applications`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(percentage)}
                        className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                      >

                        <div
                          className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>

                  )

                })}

              </div>

              {stats?.totalApplications === 0 && (

                <p className="mt-6 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">

                  Application activity will appear
                  here when candidates submit
                  applications to your listings.

                </p>

              )}

            </section>

            {/* Opportunity status */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="text-lg font-bold text-[#123C35]">

                Opportunity status

              </h2>

              <p className="mt-1 text-sm text-slate-500">

                Your listing lifecycle

              </p>

              <div className="mt-6 space-y-4">

                {[

                  {
                    label: 'Draft',
                    value: stats?.draftOpportunities ?? 0,
                    icon: FileText,
                    style: 'bg-slate-100 text-slate-600',
                  },

                  {
                    label: 'Published',
                    value: stats?.publishedOpportunities ?? 0,
                    icon: Globe,
                    style: 'bg-emerald-50 text-emerald-700',
                  },

                  {
                    label: 'Closed',
                    value: stats?.closedOpportunities ?? 0,
                    icon: CheckCircle2,
                    style: 'bg-blue-50 text-blue-700',
                  },

                ].map((item) => (

                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"
                  >

                    <div className={`rounded-lg p-2.5 ${item.style}`}>

                      <item.icon size={20} />

                    </div>

                    <span className="flex-1 text-sm font-medium text-slate-600">

                      {item.label}

                    </span>

                    <strong className="text-xl text-[#123C35]">

                      {item.value}

                    </strong>

                  </div>

                ))}

              </div>

              <Link
                to="/employer/opportunities"
                className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#16826B] transition-colors hover:bg-emerald-50"
              >

                Manage listings

                <ArrowRight size={17} />

              </Link>

            </section>

          </div>

          {/* Recent opportunities */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-wrap items-center justify-between gap-3">

              <div>

                <h2 className="text-lg font-bold text-[#123C35]">

                  Recent opportunities

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  Your most recently created listings

                </p>

              </div>

              <Link
                to="/employer/opportunities"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#16826B]"
              >

                View all

                <ArrowRight size={17} />

              </Link>

            </div>

            {recentOpportunities.length === 0 ? (

              <div className="py-14 text-center">

                <BriefcaseBusiness
                  size={44}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 font-semibold text-[#123C35]">

                  No opportunities yet

                </h3>

                <p className="mt-2 text-sm text-slate-500">

                  Create your first opportunity
                  to connect with candidates.

                </p>

                <Link
                  to="/employer/opportunities/create"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#16826B] px-5 py-3 text-sm font-semibold text-white"
                >

                  <Plus size={17} />

                  Create opportunity

                </Link>

              </div>

            ) : (

              <div className="mt-6 overflow-x-auto">

                <table className="w-full min-w-[650px] text-left">

                  <thead>

                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">

                      <th className="pb-4 font-semibold">

                        Opportunity

                      </th>

                      <th className="pb-4 font-semibold">

                        Type

                      </th>

                      <th className="pb-4 font-semibold">

                        Applications

                      </th>

                      <th className="pb-4 font-semibold">

                        Status

                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {recentOpportunities.map((item) => {

                      const applicationCount =
                        data.applications.filter(
                          (application) =>
                            application.opportunity_id === item.id
                        ).length

                      return (

                        <tr key={item.id}>

                          <td className="py-5 pr-4">

                            <div className="flex items-center gap-3">

                              <div className="rounded-xl bg-[#EAF3EE] p-3 text-[#16826B]">

                                <BriefcaseBusiness size={20} />

                              </div>

                              <div>

                                <p className="text-sm font-semibold text-[#123C35]">

                                  {item.title}

                                </p>

                                <p className="mt-1 text-xs text-slate-500">

                                  {item.organization}

                                </p>

                                {item.is_demo && (

                                  <p className="mt-1 text-xs font-medium text-amber-700">

                                    Demo listing

                                  </p>

                                )}

                              </div>

                            </div>

                          </td>

                          <td className="py-5 pr-4 text-sm capitalize text-slate-600">

                            {item.opportunity_type}

                          </td>

                          <td className="py-5 pr-4 text-sm font-semibold text-[#123C35]">

                            {applicationCount}

                          </td>

                          <td className="py-5">

                            <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                              item.status === 'published'

                                ? 'bg-emerald-50 text-emerald-700'

                                : item.status === 'draft'

                                  ? 'bg-amber-50 text-amber-700'

                                  : 'bg-slate-100 text-slate-600'
                            }`}>

                              {item.status}

                            </span>

                          </td>

                        </tr>

                      )

                    })}

                  </tbody>

                </table>

              </div>

            )}

          </section>

          {/* Recent application activity */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-wrap items-center justify-between gap-3">

              <div>

                <h2 className="text-lg font-bold text-[#123C35]">

                  Recent applications

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  Latest applications submitted
                  to your opportunities

                </p>

              </div>

              <Link
                to="/employer/applications"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#16826B]"
              >

                Review all

                <ArrowRight size={17} />

              </Link>

            </div>

            {recentApplications.length === 0 ? (

              <div className="py-12 text-center">

                <Users
                  size={42}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 font-semibold text-[#123C35]">

                  No applications received yet

                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">

                  When candidates apply to your
                  published opportunities, their
                  application activity will appear here.

                </p>

              </div>

            ) : (

              <div className="mt-6 divide-y divide-slate-100">

                {recentApplications.map((application) => (

                  <article
                    key={application.id}
                    className="flex flex-wrap items-center gap-4 py-4"
                  >

                    <div className="rounded-xl bg-[#EAF3EE] p-3 text-[#16826B]">

                      <Users size={22} />

                    </div>

                    <div className="min-w-0 flex-1">

                      <h3 className="text-sm font-semibold text-[#123C35]">

                        {application.opportunities.title}

                      </h3>

                      <p className="mt-1 text-xs text-slate-500">

                        Candidate reference:{' '}

                        {application.candidate_id.slice(0, 8)}

                      </p>

                      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">

                        <Clock3 size={13} />

                        {new Date(
                          application.created_at
                        ).toLocaleDateString('en-GB', {
                          timeZone: 'Africa/Nairobi',
                        })}

                      </p>

                    </div>

                    <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      application.status === 'accepted'

                        ? 'bg-emerald-50 text-emerald-700'

                        : application.status === 'rejected'

                          ? 'bg-red-50 text-red-700'

                          : 'bg-slate-100 text-slate-600'
                    }`}>

                      {APPLICATION_STATUS_LABELS[
                        application.status
                      ]}

                    </span>

                  </article>

                ))}

              </div>

            )}

          </section>

        </>

      ) : null}

      {/* Quick actions */}

      <section>

        <div className="mb-4">

          <h2 className="text-xl font-bold text-[#123C35]">

            Employer tools

          </h2>

          <p className="mt-1 text-sm text-slate-500">

            Access your recruitment management tools.

          </p>

        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          {quickActions.map((item) => (

            <Link
              key={item.path}
              to={item.path}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#16826B] hover:shadow-md"
            >

              <div className="mb-5 flex items-center justify-between">

                <div className="rounded-xl bg-[#EAF3EE] p-3 text-[#16826B]">

                  <item.icon size={23} />

                </div>

                <ArrowRight
                  size={18}
                  className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#16826B]"
                />

              </div>

              <h3 className="font-bold text-[#123C35]">

                {item.title}

              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">

                {item.description}

              </p>

            </Link>

          ))}

        </div>

      </section>

      {/* Privacy reminder */}

      <section className="flex items-start gap-4 rounded-2xl border border-emerald-100 bg-[#EAF3EE] p-5">

        <ShieldCheck
          size={25}
          className="shrink-0 text-[#16826B]"
        />

        <div>

          <h3 className="font-semibold text-[#123C35]">

            Responsible recruitment

          </h3>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">

            UjuziLink supports inclusive recruitment
            based on professional competencies.
            Candidate information is restricted to
            authorized applications and credentials
            voluntarily shared by candidates.
            Recruitment decisions remain the
            responsibility of employers.

          </p>

        </div>

      </section>

      {/* Footer */}

      <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-500">

        UjuziLink — Connecting skills
        to meaningful opportunities.

      </footer>

    </div>

  )
}