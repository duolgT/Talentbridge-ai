import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  Users,
  UserRound,
  ShieldCheck,
  BriefcaseBusiness,
  ContactRound,
  ClipboardList,
  FileClock,
  FileCheck2,
  RefreshCw,
  LoaderCircle,
  CircleAlert,
  ArrowUpRight,
  History,
  Settings2,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react'

import {
  useAuthStore,
} from '../../store/authStore'

import {
  getAdminDashboardData,
} from '../../services/adminService'

import type {
  AdminDashboardData,
} from '../../types/admin'

import type {
  UserRole,
} from '../../types/auth'

const numberFormatter =
  new Intl.NumberFormat('en-KE')

const roleStyles: Record<UserRole, string> = {
  candidate: 'bg-blue-50 text-blue-700',
  reviewer: 'bg-amber-50 text-amber-700',
  employer: 'bg-emerald-50 text-emerald-700',
  admin: 'bg-purple-50 text-purple-700',
}

function formatNumber(
  value: number
): string {

  return numberFormatter.format(value)

}

function formatDate(
  value: string
): string {

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeZone: 'Africa/Nairobi',
  }).format(new Date(value))

}

function getPercentage(
  value: number,
  total: number
): number {

  if (total <= 0) return 0

  return Math.min(
    100,
    Math.max(
      0,
      Math.round((value / total) * 100)
    )
  )
}

function getErrorMessage(
  error: unknown
): string {

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    return String(error.message)
  }

  return 'Unable to load administrator information.'
}

// ==========================================
// REUSABLE STATISTIC CARD
// ==========================================

interface DashboardStatCardProps {
  label: string
  value: number
  description: string
  icon: LucideIcon
  color?: string
}

function DashboardStatCard({
  label,
  value,
  description,
  icon: Icon,
  color = 'bg-[#EAF3EE] text-[#16826B]',
}: DashboardStatCardProps) {

  return (

    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div className={`inline-flex rounded-xl p-3 ${color}`}>

          <Icon size={23} />

        </div>

      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">

        {label}

      </p>

      <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#123C35]">

        {formatNumber(value)}

      </p>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">

        {description}

      </p>

    </article>

  )
}

// ==========================================
// REUSABLE PROGRESS METRIC
// ==========================================

interface ProgressMetricProps {
  label: string
  value: number
  total: number
  color: string
}

function ProgressMetric({
  label,
  value,
  total,
  color,
}: ProgressMetricProps) {

  const percentage =
    getPercentage(value, total)

  return (

    <div>

      <div className="mb-2 flex items-center justify-between gap-3">

        <span className="text-sm text-slate-600">

          {label}

        </span>

        <span className="text-sm font-semibold text-[#123C35]">

          {formatNumber(value)}

          <span className="ml-2 text-xs font-normal text-slate-400">

            {percentage}%

          </span>

        </span>

      </div>

      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        className="h-2.5 overflow-hidden rounded-full bg-slate-100"
      >

        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>

  )
}

// ==========================================
// ADMIN DASHBOARD ENTRY
// ==========================================

export default function AdminDashboard() {

  const profile = useAuthStore(
    (state) => state.profile
  )

  if (!profile) return null

  return (

    <AdminWorkspace
      key={profile.id}
      fullName={profile.full_name}
    />

  )
}

// ==========================================
// ADMIN WORKSPACE
// ==========================================

function AdminWorkspace({
  fullName,
}: {
  fullName: string
}) {

  const [data, setData] =
    useState<AdminDashboardData | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [reloadKey, setReloadKey] =
    useState(0)

  const [lastUpdated, setLastUpdated] =
    useState<string | null>(null)

  // ========================================
  // LOAD ADMINISTRATOR DATA
  // ========================================

  useEffect(() => {

    let active = true

    getAdminDashboardData()
      .then((result) => {

        if (!active) return

        setData(result)

        setLastUpdated(
          new Date().toISOString()
        )

      })
      .catch((err: unknown) => {

        if (active) {

          setError(
            getErrorMessage(err)
          )

          // Do not retain privileged data after
          // a failed authorization or refresh.

          setData(null)

          setLastUpdated(null)

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

  }, [reloadKey])

  function refreshDashboard() {

    if (loading) return

    setLoading(true)

    setError('')

    setReloadKey(
      (previous) => previous + 1
    )

  }

  const firstName =
    fullName.trim().split(/\s+/)[0] ||
    'Administrator'

  const updatedTime = lastUpdated

    ? new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Africa/Nairobi',
      }).format(new Date(lastUpdated))

    : null

  const stats = data?.stats

  // ========================================
  // DERIVED METRICS
  // ========================================

  const draftEvidence = stats

    ? Math.max(
        0,
        stats.total_evidence -
        stats.pending_evidence -
        stats.approved_evidence -
        stats.rejected_evidence
      )

    : 0

  const reviewedEvidence = stats

    ? stats.approved_evidence +
      stats.rejected_evidence

    : 0

  const evidenceApprovalRate = stats

    ? getPercentage(
        stats.approved_evidence,
        reviewedEvidence
      )

    : 0

  const passportPublicationRate = stats

    ? getPercentage(
        stats.published_passports,
        stats.total_passports
      )

    : 0

  const skillVerificationRate = stats

    ? getPercentage(
        stats.verified_skills,
        stats.total_candidate_skills
      )

    : 0

  return (

    <div className="mx-auto max-w-7xl space-y-6">

      {/* Dashboard heading */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#123C35]">

            Platform overview

          </h1>

          <p className="mt-2 text-sm text-slate-500">

            Monitor UjuziLink activity,
            verification and recruitment.

          </p>

        </div>

        <button
          type="button"
          onClick={refreshDashboard}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#123C35] hover:bg-slate-50 disabled:opacity-50"
        >

          <RefreshCw
            size={17}
            className={
              loading ? 'animate-spin' : ''
            }
          />

          Refresh dashboard

        </button>

      </div>

      {/* Welcome banner */}

      <section className="relative overflow-hidden rounded-3xl bg-[#123C35] p-7 text-white sm:p-9">

        <div className="pointer-events-none absolute -right-14 -top-16 h-64 w-64 rounded-full border border-white/10" />

        <div className="pointer-events-none absolute -bottom-24 right-12 h-60 w-60 rounded-full bg-[#16826B]/20" />

        <div className="relative flex flex-wrap items-center justify-between gap-6">

          <div className="max-w-2xl">

            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#D5F76A]">

              <ShieldCheck size={15} />

              Administration

            </div>

            <h2 className="mt-5 text-2xl font-extrabold sm:text-3xl">

              Welcome, {firstName}.

            </h2>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">

              Help build an inclusive and
              trustworthy platform by overseeing
              professional verification,
              user management and responsible
              recruitment.

            </p>

            <Link
              to="/admin/users"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D5F76A] px-5 py-3 text-sm font-bold text-[#123C35]"
            >

              Manage users

              <ArrowUpRight size={18} />

            </Link>

          </div>

          <ShieldCheck
            size={100}
            strokeWidth={1}
            className="hidden text-[#D5F76A] lg:block"
          />

        </div>

      </section>

      {/* Error state */}

      {error && (

        <section
          role="alert"
          className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700"
        >

          <CircleAlert
            size={25}
            className="shrink-0"
          />

          <div>

            <h3 className="font-bold">

              Unable to load dashboard

            </h3>

            <p className="mt-2 text-sm">

              {error}

            </p>

            <button
              type="button"
              onClick={refreshDashboard}
              disabled={loading}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >

              Try again

            </button>

          </div>

        </section>

      )}

      {/* Loading state */}

      {loading ? (

        <section
          role="status"
          className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-20"
        >

          <LoaderCircle
            size={42}
            className="animate-spin text-[#16826B]"
          />

          <p className="mt-4 text-sm text-slate-500">

            Loading platform statistics...

          </p>

        </section>

      ) : data && stats ? (

        <>

          {/* Last updated */}

          <div className="flex flex-wrap items-center justify-between gap-3">

            <h2 className="text-lg font-bold text-[#123C35]">

              Platform statistics

            </h2>

            {updatedTime && (

              <p className="text-xs text-slate-500">

                Updated: {updatedTime} EAT

              </p>

            )}

          </div>

          {/* Primary statistics */}

          <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">

            <DashboardStatCard
              label="Registered users"
              value={stats.total_users}
              description="All registered platform profiles"
              icon={Users}
            />

            <DashboardStatCard
              label="Candidates"
              value={stats.total_candidates}
              description="Professional candidate accounts"
              icon={UserRound}
            />

            <DashboardStatCard
              label="Verified skills"
              value={stats.verified_skills}
              description="Candidate competencies marked verified"
              icon={ShieldCheck}
            />

            <DashboardStatCard
              label="Published passports"
              value={stats.published_passports}
              description="Candidate-published skills credentials"
              icon={ContactRound}
            />

            <DashboardStatCard
              label="Active opportunities"
              value={stats.active_opportunities}
              description="Published, non-demo, unexpired listings"
              icon={BriefcaseBusiness}
            />

            <DashboardStatCard
              label="Applications"
              value={stats.total_applications}
              description="Application records across the platform"
              icon={ClipboardList}
            />

            <DashboardStatCard
              label="Pending evidence"
              value={stats.pending_evidence}
              description="Evidence awaiting reviewer assessment"
              icon={FileClock}
              color="bg-amber-50 text-amber-700"
            />

            <DashboardStatCard
              label="Completed reviews"
              value={stats.total_reviews}
              description="Recorded reviewer decisions"
              icon={FileCheck2}
            />

          </section>

          {/* User distribution and review pipeline */}

          <div className="grid gap-6 xl:grid-cols-2">

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between gap-3">

                <div>

                  <h2 className="text-lg font-bold text-[#123C35]">

                    User distribution

                  </h2>

                  <p className="mt-1 text-sm text-slate-500">

                    Registered profiles by role

                  </p>

                </div>

                <Users
                  size={24}
                  className="text-[#16826B]"
                />

              </div>

              <div className="mt-7 space-y-6">

                <ProgressMetric
                  label="Candidates"
                  value={stats.total_candidates}
                  total={stats.total_users}
                  color="bg-[#16826B]"
                />

                <ProgressMetric
                  label="Employers"
                  value={stats.total_employers}
                  total={stats.total_users}
                  color="bg-teal-400"
                />

                <ProgressMetric
                  label="Reviewers"
                  value={stats.total_reviewers}
                  total={stats.total_users}
                  color="bg-amber-400"
                />

                <ProgressMetric
                  label="Administrators"
                  value={stats.total_admins}
                  total={stats.total_users}
                  color="bg-[#123C35]"
                />

              </div>

              <Link
                to="/admin/users"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#16826B]"
              >

                View user directory

                <ArrowUpRight size={16} />

              </Link>

            </section>

            {/* Evidence pipeline */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between gap-3">

                <div>

                  <h2 className="text-lg font-bold text-[#123C35]">

                    Evidence verification

                  </h2>

                  <p className="mt-1 text-sm text-slate-500">

                    {formatNumber(stats.total_evidence)} evidence records

                  </p>

                </div>

                <FileCheck2
                  size={24}
                  className="text-[#16826B]"
                />

              </div>

              <div className="mt-7 space-y-6">

                <ProgressMetric
                  label="Draft"
                  value={draftEvidence}
                  total={stats.total_evidence}
                  color="bg-slate-400"
                />

                <ProgressMetric
                  label="Pending review"
                  value={stats.pending_evidence}
                  total={stats.total_evidence}
                  color="bg-amber-400"
                />

                <ProgressMetric
                  label="Approved"
                  value={stats.approved_evidence}
                  total={stats.total_evidence}
                  color="bg-[#16826B]"
                />

                <ProgressMetric
                  label="Rejected"
                  value={stats.rejected_evidence}
                  total={stats.total_evidence}
                  color="bg-red-400"
                />

              </div>

              <Link
                to="/admin/reviewers"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#16826B]"
              >

                Reviewer management

                <ArrowUpRight size={16} />

              </Link>

            </section>

          </div>

          {/* Platform performance */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-bold text-[#123C35]">

              Credential progress

            </h2>

            <p className="mt-1 text-sm text-slate-500">

              Aggregate activity across candidate credentials

            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">

              {[

                {
                  label: 'Skills verified',
                  percentage: skillVerificationRate,
                  total: stats.total_candidate_skills,
                  detail:
                    `${stats.verified_skills} of ${stats.total_candidate_skills} recorded skills`,
                },

                {
                  label: 'Evidence approval rate',
                  percentage: evidenceApprovalRate,
                  total: reviewedEvidence,
                  detail:
                    `${stats.approved_evidence} of ${reviewedEvidence} decided evidence records`,
                },

                {
                  label: 'Passports published',
                  percentage: passportPublicationRate,
                  total: stats.total_passports,
                  detail:
                    `${stats.published_passports} of ${stats.total_passports} generated passports`,
                },

              ].map((item) => (

                <article
                  key={item.label}
                  className="rounded-xl bg-[#F6F8F5] p-5"
                >

                  <p className="text-sm font-semibold text-[#123C35]">

                    {item.label}

                  </p>

                  <p className="mt-3 text-3xl font-extrabold text-[#16826B]">

                    {item.total > 0
                      ? `${item.percentage}%`
                      : '—'}

                  </p>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-emerald-100">

                    <div
                      className="h-full rounded-full bg-[#16826B]"
                      style={{
                        width: `${item.percentage}%`,
                      }}
                    />

                  </div>

                  <p className="mt-3 text-xs text-slate-500">

                    {item.total > 0
                      ? item.detail
                      : 'No records available yet'}

                  </p>

                </article>

              ))}

            </div>

          </section>

          {/* Recruitment activity */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-wrap items-center justify-between gap-3">

              <div>

                <h2 className="text-lg font-bold text-[#123C35]">

                  Recruitment overview

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  Opportunity and application activity

                </p>

              </div>

              <Link
                to="/admin/opportunities"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#16826B]"
              >

                Opportunity oversight

                <ArrowUpRight size={16} />

              </Link>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">

              {[

                {
                  label: 'Total non-demo listings',
                  value: stats.total_opportunities,
                },

                {
                  label: 'Active opportunities',
                  value: stats.active_opportunities,
                },

                {
                  label: 'Closed opportunities',
                  value: stats.closed_opportunities,
                },

                {
                  label: 'Demo listings',
                  value: stats.demo_opportunities,
                },

                {
                  label: 'Shortlisted applications',
                  value: stats.shortlisted_applications,
                },

                {
                  label: 'Accepted applications',
                  value: stats.accepted_applications,
                },

              ].map((item) => (

                <article
                  key={item.label}
                  className="rounded-xl border border-slate-100 bg-[#F6F8F5] p-4"
                >

                  <p className="text-2xl font-extrabold text-[#123C35]">

                    {formatNumber(item.value)}

                  </p>

                  <p className="mt-2 text-xs text-slate-500">

                    {item.label}

                  </p>

                </article>

              ))}

            </div>

            <p className="mt-5 text-xs leading-relaxed text-slate-500">

              Demo listings are counted separately.
              Accepted applications represent
              recruitment decisions recorded in the
              platform, not confirmed employment.

            </p>

          </section>

          {/* Recently registered users */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-6">

              <div>

                <h2 className="text-lg font-bold text-[#123C35]">

                  Recently registered users

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  Latest five platform profiles

                </p>

              </div>

              <Link
                to="/admin/users"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#16826B]"
              >

                View all users

                <ArrowUpRight size={16} />

              </Link>

            </div>

            {data.recentUsers.length > 0 ? (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[600px] text-left text-sm">

                  <thead className="bg-slate-50 text-xs text-slate-500">

                    <tr>

                      <th
                        scope="col"
                        className="px-6 py-4 font-semibold"
                      >

                        User

                      </th>

                      <th
                        scope="col"
                        className="px-6 py-4 font-semibold"
                      >

                        Role

                      </th>

                      <th
                        scope="col"
                        className="px-6 py-4 font-semibold"
                      >

                        Registered

                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {data.recentUsers.map((user) => (

                      <tr key={user.id}>

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF3EE] font-bold text-[#16826B]">

                              {user.full_name
                                ?.trim()
                                .charAt(0)
                                .toUpperCase() || 'U'}

                            </div>

                            <div>

                              <p className="font-semibold text-[#123C35]">

                                {user.full_name ||
                                  'Unnamed user'}

                              </p>

                              <p className="mt-1 text-xs text-slate-500">

                                {user.professional_title ||
                                  `ID: ${user.id.slice(0, 8)}`}

                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-4">

                          <span className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
                            roleStyles[user.role]
                          }`}>

                            {user.role}

                          </span>

                        </td>

                        <td className="px-6 py-4 text-slate-500">

                          {formatDate(user.created_at)}

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            ) : (

              <p className="p-10 text-center text-sm text-slate-500">

                No user records found.

              </p>

            )}

          </section>

          {/* Recent administrative activity */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-wrap items-center justify-between gap-3">

              <div>

                <h2 className="text-lg font-bold text-[#123C35]">

                  Administrative activity

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  Recently audited administrator actions

                </p>

              </div>

              <Link
                to="/admin/audit-logs"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#16826B]"
              >

                View audit logs

                <ArrowUpRight size={16} />

              </Link>

            </div>

            {data.recentAuditLogs.length > 0 ? (

              <div className="mt-5 divide-y divide-slate-100">

                {data.recentAuditLogs.map((log) => (

                  <article
                    key={log.id}
                    className="flex items-start gap-4 py-4"
                  >

                    <div className="rounded-xl bg-[#EAF3EE] p-3 text-[#16826B]">

                      <History size={20} />

                    </div>

                    <div className="min-w-0 flex-1">

                      <h3 className="text-sm font-semibold capitalize text-[#123C35]">

                        {log.action
                          .replaceAll('_', ' ')
                          .toLowerCase()}

                      </h3>

                      <p className="mt-1 text-xs text-slate-500">

                        Target: {log.target_type}

                        {log.target_id &&
                          ` · ${log.target_id.slice(0, 8)}`}

                      </p>

                      {log.reason && (

                        <p className="mt-2 break-words text-sm text-slate-600">

                          {log.reason}

                        </p>

                      )}

                    </div>

                    <span className="text-xs text-slate-500">

                      {formatDate(log.created_at)}

                    </span>

                  </article>

                ))}

              </div>

            ) : (

              <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-8 text-center">

                <History
                  size={36}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-3 font-semibold text-[#123C35]">

                  No audited actions yet

                </h3>

                <p className="mt-2 text-sm text-slate-500">

                  Administrative role assignments
                  will appear here.

                </p>

              </div>

            )}

          </section>

          {/* Administrative shortcuts */}

          <section>

            <h2 className="text-lg font-bold text-[#123C35]">

              Administration tools

            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

              {[

                {
                  title: 'User management',
                  description:
                    'View platform profiles and controlled role assignments.',
                  path: '/admin/users',
                  icon: Users,
                },

                {
                  title: 'Reviewer management',
                  description:
                    'Oversee professional evidence verification.',
                  path: '/admin/reviewers',
                  icon: ShieldCheck,
                },

                {
                  title: 'Opportunity oversight',
                  description:
                    'Monitor platform recruitment listings.',
                  path: '/admin/opportunities',
                  icon: BriefcaseBusiness,
                },

                {
                  title: 'Platform analytics',
                  description:
                    'Explore aggregate platform activity.',
                  path: '/admin/analytics',
                  icon: ClipboardList,
                },

                {
                  title: 'Audit logs',
                  description:
                    'Review recorded administrative actions.',
                  path: '/admin/audit-logs',
                  icon: History,
                },

                {
                  title: 'My profile',
                  description:
                    'Manage your administrator profile.',
                  path: '/account/profile',
                  icon: Settings2,
                },

              ].map((item) => (

                <Link
                  key={item.path}
                  to={item.path}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-emerald-300 hover:shadow-md"
                >

                  <div className="flex items-center justify-between">

                    <div className="rounded-xl bg-[#EAF3EE] p-3 text-[#16826B]">

                      <item.icon size={23} />

                    </div>

                    <ArrowUpRight
                      size={19}
                      className="text-slate-400 group-hover:text-[#16826B]"
                    />

                  </div>

                  <h3 className="mt-4 font-bold text-[#123C35]">

                    {item.title}

                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-500">

                    {item.description}

                  </p>

                </Link>

              ))}

            </div>

          </section>

        </>

      ) : null}

      {/* Administration guidance */}

      <section className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-[#EAF3EE] p-5">

        <CheckCircle2
          size={21}
          className="shrink-0 text-[#16826B]"
        />

        <div>

          <h3 className="text-sm font-bold text-[#123C35]">

            Responsible platform administration

          </h3>

          <p className="mt-2 text-xs leading-relaxed text-slate-600">

            Use administrative privileges only
            for authorized platform operations.

            Private evidence documents remain
            restricted, and role assignments
            performed through the administrator
            function are recorded in the
            audit log.

          </p>

        </div>

      </section>

    </div>

  )
}