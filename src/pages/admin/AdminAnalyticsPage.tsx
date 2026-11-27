import { useEffect, useState } from 'react'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  ResponsiveContainer,
} from 'recharts'

import {
  ChartNoAxesCombined,
  RefreshCw,
  LoaderCircle,
  CircleAlert,
  Users,
  ShieldCheck,
  ContactRound,
  BriefcaseBusiness,
} from 'lucide-react'

import { useAuthStore } from '../../store/authStore'

import {
  getAdminDashboardStats,
} from '../../services/adminService'

import type {
  AdminDashboardStats,
} from '../../types/admin'

function percentage(
  numerator: number,
  denominator: number
): string {

  if (denominator <= 0) return '—'

  return `${Math.round(
    (numerator / denominator) * 100
  )}%`
}

export default function AdminAnalyticsPage() {
  const profile = useAuthStore((state) => state.profile)

  if (!profile) return null

  return <AnalyticsWorkspace key={profile.id} />
}

function AnalyticsWorkspace() {

  const [stats, setStats] =
    useState<AdminDashboardStats | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    getAdminDashboardStats()
      .then((data) => {
        if (active) setStats(data)
      })
      .catch((err: unknown) => {
        if (!active) return

        setStats(null)

        setError(
          typeof err === 'object' &&
          err !== null &&
          'message' in err
            ? String(err.message)
            : 'Unable to retrieve platform analytics.'
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [reloadKey])

  function refresh() {
    if (loading) return

    setLoading(true)
    setError('')
    setReloadKey((previous) => previous + 1)
  }

  const userData = stats
    ? [
        {
          name: 'Candidates',
          value: stats.total_candidates,
          fill: '#16826B',
        },
        {
          name: 'Employers',
          value: stats.total_employers,
          fill: '#60A995',
        },
        {
          name: 'Reviewers',
          value: stats.total_reviewers,
          fill: '#B5D96B',
        },
        {
          name: 'Admins',
          value: stats.total_admins,
          fill: '#123C35',
        },
      ]
    : []

  const evidenceData = stats
    ? [
        {
          name: 'Draft',
          value: Math.max(
            0,
            stats.total_evidence -
            stats.pending_evidence -
            stats.approved_evidence -
            stats.rejected_evidence
          ),
          fill: '#94A3B8',
        },
        {
          name: 'Pending',
          value: stats.pending_evidence,
          fill: '#F59E0B',
        },
        {
          name: 'Approved',
          value: stats.approved_evidence,
          fill: '#16826B',
        },
        {
          name: 'Rejected',
          value: stats.rejected_evidence,
          fill: '#EF4444',
        },
      ]
    : []

  const credentialData = stats
    ? [
        {
          name: 'Skills',
          Total: stats.total_candidate_skills,
          Verified: stats.verified_skills,
        },
        {
          name: 'Passports',
          Total: stats.total_passports,
          Verified: stats.published_passports,
        },
      ]
    : []

  const recruitmentData = stats
    ? [
        {
          name: 'Applications',
          value: stats.total_applications,
        },
        {
          name: 'Shortlisted',
          value: stats.shortlisted_applications,
        },
        {
          name: 'Accepted',
          value: stats.accepted_applications,
        },
      ]
    : []

  const metrics = stats
    ? [
        {
          label: 'Registered users',
          value: stats.total_users,
          icon: Users,
        },
        {
          label: 'Skill verification rate',
          value: percentage(
            stats.verified_skills,
            stats.total_candidate_skills
          ),
          icon: ShieldCheck,
        },
        {
          label: 'Passport publication rate',
          value: percentage(
            stats.published_passports,
            stats.total_passports
          ),
          icon: ContactRound,
        },
        {
          label: 'Active opportunities',
          value: stats.active_opportunities,
          icon: BriefcaseBusiness,
        },
      ]
    : []

  return (

    <div className="mx-auto max-w-7xl space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>
          <h1 className="text-3xl font-extrabold text-[#123C35]">
            Platform analytics
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Understand participation, credentials and recruitment activity.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh analytics
        </button>

      </div>

      <section className="rounded-3xl bg-[#123C35] p-7 text-white">

        <ChartNoAxesCombined
          size={38}
          className="text-[#D5F76A]"
        />

        <h2 className="mt-4 text-2xl font-bold">
          Understand platform activity.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
          Monitor how UjuziLink supports professional
          recognition, evidence verification and access
          to employment opportunities.
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

      {loading ? (
        <div
          role="status"
          className="flex justify-center rounded-2xl bg-white py-20"
        >
          <LoaderCircle
            size={38}
            className="animate-spin text-[#16826B]"
          />
        </div>
      ) : stats ? (
        <>

          {/* Key metrics */}

          <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">

            {metrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="inline-flex rounded-xl bg-[#EAF3EE] p-3 text-[#16826B]">
                  <metric.icon size={24} />
                </div>

                <p className="mt-4 text-3xl font-extrabold text-[#123C35]">
                  {metric.value}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {metric.label}
                </p>
              </article>
            ))}

          </section>

          <div className="grid gap-6 xl:grid-cols-2">

            {/* User distribution */}

            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6">

              <h2 className="text-lg font-bold text-[#123C35]">
                User distribution
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Registered profiles by role
              </p>

              {stats.total_users > 0 ? (
                <div className="mt-4 h-64">

                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={95}
                        paddingAngle={2}
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                </div>
              ) : (
                <p className="py-16 text-center text-sm text-slate-500">
                  No users recorded yet.
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">

                {userData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />

                    <span className="text-slate-600">
                      {item.name}
                    </span>

                    <span className="ml-auto font-semibold">
                      {item.value}
                    </span>
                  </div>
                ))}

              </div>

            </section>

            {/* Evidence chart */}

            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6">

              <h2 className="text-lg font-bold text-[#123C35]">
                Evidence verification pipeline
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Evidence records by current status
              </p>

              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">

                  <BarChart data={evidenceData}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis dataKey="name" fontSize={12} />

                    <YAxis
                      allowDecimals={false}
                      fontSize={12}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      name="Evidence records"
                      fill="#16826B"
                      radius={[5, 5, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>
              </div>

            </section>

            {/* Credential chart */}

            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6">

              <h2 className="text-lg font-bold text-[#123C35]">
                Credential progress
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Recorded skills and generated passports
              </p>

              <div className="mt-6 h-72">

                <ResponsiveContainer width="100%" height="100%">

                  <BarChart data={credentialData}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis dataKey="name" fontSize={12} />

                    <YAxis
                      allowDecimals={false}
                      fontSize={12}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="Total"
                      fill="#B5D5CB"
                      radius={[5, 5, 0, 0]}
                    />

                    <Bar
                      dataKey="Verified"
                      name="Verified / published"
                      fill="#16826B"
                      radius={[5, 5, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

              <p className="text-xs text-slate-500">
                Dark green represents verified skills
                or published passports, respectively.
              </p>

            </section>

            {/* Recruitment chart */}

            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6">

              <h2 className="text-lg font-bold text-[#123C35]">
                Recruitment activity
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                All applications and selected current statuses
              </p>

              <div className="mt-6 h-72">

                <ResponsiveContainer width="100%" height="100%">

                  <BarChart data={recruitmentData}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis dataKey="name" fontSize={12} />

                    <YAxis
                      allowDecimals={false}
                      fontSize={12}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      name="Application records"
                      fill="#123C35"
                      radius={[5, 5, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </section>

          </div>

          {/* Accessible numerical summary */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6">

            <h2 className="text-lg font-bold text-[#123C35]">
              Platform activity summary
            </h2>

            <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {[
                ['Recorded skills', stats.total_candidate_skills],
                ['Verified skills', stats.verified_skills],
                ['Total evidence', stats.total_evidence],
                ['Pending evidence', stats.pending_evidence],
                ['Approved evidence', stats.approved_evidence],
                ['Rejected evidence', stats.rejected_evidence],
                ['Generated passports', stats.total_passports],
                ['Published passports', stats.published_passports],
                ['Total non-demo listings', stats.total_opportunities],
                ['Demo listings', stats.demo_opportunities],
                ['Total applications', stats.total_applications],
                ['Accepted applications', stats.accepted_applications],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl bg-[#F6F8F5] p-4"
                >
                  <dt className="text-xs text-slate-500">
                    {label}
                  </dt>

                  <dd className="mt-2 text-2xl font-bold text-[#123C35]">
                    {value}
                  </dd>
                </div>
              ))}

            </dl>

          </section>

        </>
      ) : null}

      <section className="rounded-xl border border-emerald-100 bg-[#EAF3EE] p-5">

        <h3 className="font-semibold text-[#123C35]">
          Understanding these metrics
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          These are current database snapshots, not historical trends
          or independently verified employment outcomes.
          Demo opportunities are counted separately from non-demo
          opportunities. Accepted applications do not necessarily
          represent completed employment placements.
        </p>

      </section>

    </div>

  )
}