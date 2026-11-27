import { Link } from 'react-router-dom'

import {
  Sparkles,
  ShieldCheck,
  BriefcaseBusiness,
  ContactRound,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Circle,
} from 'lucide-react'

import StatCard from '../../components/ui/StatCard'

const stats = [
  {
    title: 'Skills identified',
    value: 8,
    description: 'Professional competencies',
    icon: Sparkles,
  },
  {
    title: 'Reviewed evidence',
    value: 3,
    description: 'Assessor-reviewed work samples',
    icon: ShieldCheck,
  },
  {
    title: 'Profile completion',
    value: '65%',
    description: 'Your professional profile',
    icon: ContactRound,
  },
  {
    title: 'Matched opportunities',
    value: 4,
    description: 'Illustrative skills matches',
    icon: BriefcaseBusiness,
  },
]

const milestones = [
  {
    title: 'Create your professional profile',
    description: 'Add your experience and education.',
    completed: true,
    path: '/profile',
  },
  {
    title: 'Identify your professional skills',
    description: 'Map experience to competencies.',
    completed: true,
    path: '/skills',
  },
  {
    title: 'Submit supporting evidence',
    description: 'Add work samples and references.',
    completed: false,
    path: '/evidence',
  },
  {
    title: 'Complete a practical assessment',
    description: 'Demonstrate your abilities.',
    completed: false,
    path: '/assessments',
  },
  {
    title: 'Publish your skills passport',
    description: 'Share your professional evidence.',
    completed: false,
    path: '/passport',
  },
]

export default function DashboardPage() {
  const completed = milestones.filter(
    (item) => item.completed
  ).length

  const progress = Math.round(
    (completed / milestones.length) * 100
  )

  return (
    <div className="space-y-8">

      {/* Heading */}

      <div>

        <p className="text-sm font-medium text-primary">
          Your professional journey
        </p>

        <h1 className="mt-2 text-3xl font-extrabold">
          Welcome to UjuziLink.
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-muted">

          Build a profile that reflects your skills,
          experience and professional potential.

        </p>

      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Prototype workspace — all statistics and progress
        shown here use illustrative data.
      </div>

      {/* Welcome banner */}

      <section className="relative overflow-hidden rounded-2xl bg-primary-dark p-7 text-white sm:p-10">

        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full border-40 border-white/5" />

        <div className="relative max-w-xl">

          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Skills without borders
          </span>

          <h2 className="mt-4 text-3xl font-bold">
            Your experience deserves to be recognised.
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-white/70">

            Complete your skills profile and provide
            supporting evidence to build your digital passport.

          </p>

          <Link
            to="/profile"
            className="mt-6 inline-flex items-center gap-2 rounded-button bg-accent px-5 py-3 text-sm font-semibold text-primary-dark"
          >
            Continue your profile
            <ArrowRight size={18} />
          </Link>

        </div>

      </section>

      {/* Overview statistics */}

      <section
        aria-label="Profile statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >

        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}

      </section>

      {/* Journey and quick actions */}

      <div className="grid gap-6 xl:grid-cols-3">

        <section className="surface-card xl:col-span-2">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Your professional journey
              </h2>

              <p className="mt-1 text-sm text-muted">
                Complete the steps to build your passport.
              </p>
            </div>

            <span className="text-sm font-semibold text-primary">
              {progress}%
            </span>

          </div>

          <div
            role="progressbar"
            aria-label="Journey completion"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-5 h-2 overflow-hidden rounded-full bg-brand-100"
          >

            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />

          </div>

          <div className="mt-6 divide-y divide-border">

            {milestones.map((item) => (

              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 py-4 hover:text-primary"
              >

                {item.completed ? (
                  <CheckCircle2
                    className="shrink-0 text-success"
                    size={23}
                  />
                ) : (
                  <Circle
                    className="shrink-0 text-muted"
                    size={23}
                  />
                )}

                <div className="min-w-0 flex-1">

                  <p className="text-sm font-semibold">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    {item.description}
                  </p>

                </div>

                <ArrowUpRight size={17} className="shrink-0 text-muted" />

              </Link>

            ))}

          </div>

        </section>

        <section className="surface-card">

          <h2 className="text-xl font-bold">
            Quick actions
          </h2>

          <div className="mt-6 space-y-4">

            <Link
              to="/skills"
              className="flex items-center gap-3 rounded-xl border border-border p-4 hover:bg-brand-50"
            >

              <Sparkles size={24} className="shrink-0 text-primary" />

              <div className="flex-1">

                <p className="text-sm font-semibold">
                  Discover my skills
                </p>

                <p className="mt-1 text-xs text-muted">
                  AI-assisted skills mapping
                </p>

              </div>

              <ArrowUpRight size={16} />

            </Link>

            <Link
              to="/passport"
              className="flex items-center gap-3 rounded-xl border border-border p-4 hover:bg-brand-50"
            >

              <ContactRound size={24} className="shrink-0 text-primary" />

              <div className="flex-1">

                <p className="text-sm font-semibold">
                  View my passport
                </p>

                <p className="mt-1 text-xs text-muted">
                  Your professional identity
                </p>

              </div>

              <ArrowUpRight size={16} />

            </Link>

            <Link
              to="/opportunities"
              className="flex items-center gap-3 rounded-xl border border-border p-4 hover:bg-brand-50"
            >

              <BriefcaseBusiness size={24} className="shrink-0 text-primary" />

              <div className="flex-1">

                <p className="text-sm font-semibold">
                  Explore opportunities
                </p>

                <p className="mt-1 text-xs text-muted">
                  Find relevant professional roles
                </p>

              </div>

              <ArrowUpRight size={16} />

            </Link>

          </div>

        </section>

      </div>

    </div>
  )
}