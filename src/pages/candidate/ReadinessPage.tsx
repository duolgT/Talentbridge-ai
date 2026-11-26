import {
  useEffect,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import {
  Target,
  CheckCircle2,
  Circle,
  ArrowRight,
  RefreshCw,
  LoaderCircle,
  UserRound,
  BriefcaseBusiness,
  BadgeCheck,
  Compass,
  Lightbulb,
  Info,
} from 'lucide-react'

import { useAuthStore } from '../../store/authStore'

import ReadinessGauge from '../../features/readiness/ReadinessGauge'

import {
  getReadinessSnapshot,
  completeReadinessTask,
  resetReadinessTask,
} from '../../services/readinessService'

import {
  calculateReadiness,
  getReadinessLabel,
} from '../../utils/readinessEngine'

import type {
  ReadinessSnapshot,
  ReadinessTask,
  ReadinessCategory,
  ManualTaskKey,
} from '../../types/readiness'

const categories = [
  {
    key: 'profile',
    label: 'Professional profile',
    icon: UserRound,
  },
  {
    key: 'history',
    label: 'Professional history',
    icon: BriefcaseBusiness,
  },
  {
    key: 'credentials',
    label: 'Skills and evidence',
    icon: BadgeCheck,
  },
  {
    key: 'career',
    label: 'Career preparation',
    icon: Compass,
  },
] as const

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

  return 'Something went wrong. Please try again.'
}

export default function ReadinessPage() {

  const profile = useAuthStore(
    (state) => state.profile
  )

  if (!profile) return null

  return (
    <ReadinessWorkspace
      key={profile.id}
      candidateId={profile.id}
    />
  )
}

function ReadinessWorkspace({
  candidateId,
}: {
  candidateId: string
}) {

  const [snapshot, setSnapshot] =
    useState<ReadinessSnapshot | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [busyTask, setBusyTask] =
    useState<string | null>(null)

  const [error, setError] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [reloadKey, setReloadKey] =
    useState(0)

  const [filter, setFilter] =
    useState<
      'all' |
      'completed' |
      'incomplete'
    >('all')

  // Load current readiness information

  useEffect(() => {

    let active = true

    getReadinessSnapshot(candidateId)

      .then((data) => {

        if (active) {
          setSnapshot(data)
        }

      })

      .catch((err) => {

        if (active) {
          setError(
            getErrorMessage(err)
          )
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

  }, [candidateId, reloadKey])

  // Derived application state

  const readiness = snapshot
    ? calculateReadiness(snapshot)
    : null

  const filteredTasks =
    readiness?.tasks.filter((task) => {

      if (filter === 'completed') {
        return task.completed
      }

      if (filter === 'incomplete') {
        return !task.completed
      }

      return true

    }) || []

  function refreshReadiness() {

    setLoading(true)
    setError('')
    setMessage('')
    setSnapshot(null)

    setReloadKey(
      (previous) => previous + 1
    )
  }

  // Category scoring

  function getCategoryProgress(
    category: ReadinessCategory
  ) {

    const tasks =
      readiness?.tasks.filter(
        (task) =>
          task.category === category
      ) || []

    const total = tasks.reduce(
      (sum, task) =>
        sum + task.points,
      0
    )

    const completed = tasks
      .filter((task) => task.completed)
      .reduce(
        (sum, task) =>
          sum + task.points,
        0
      )

    return {
      total,
      completed,

      percentage: total > 0
        ? Math.round(
            completed / total * 100
          )
        : 0,
    }
  }

  // Complete or reset manual tasks

  async function handleToggleTask(
    task: ReadinessTask
  ) {

    if (
      task.type !== 'manual' ||
      busyTask ||
      loading ||
      !snapshot
    ) return

    const taskKey =
      task.key as ManualTaskKey

    setBusyTask(task.key)
    setError('')
    setMessage('')

    try {

      if (task.completed) {

        await resetReadinessTask(
          candidateId,
          taskKey
        )

        setSnapshot((previous) => {

          if (!previous) return previous

          return {

            ...previous,

            completedManualTasks:
              previous.completedManualTasks
                .filter(
                  (key) => key !== taskKey
                ),

          }
        })

        setMessage('Preparation task reset.')

      } else {

        await completeReadinessTask(
          candidateId,
          taskKey
        )

        setSnapshot((previous) => {

          if (!previous) return previous

          return {

            ...previous,

            completedManualTasks: [
              ...new Set([
                ...previous.completedManualTasks,
                taskKey,
              ]),
            ],

          }
        })

        setMessage(
          'Preparation progress updated.'
        )
      }

    } catch (err) {

      setError(
        getErrorMessage(err)
      )

    } finally {

      setBusyTask(null)

    }
  }

  return (

    <div className="mx-auto max-w-6xl space-y-6">

      {/* Page header */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>

          <h1 className="text-3xl font-extrabold">
            Employment readiness
          </h1>

          <p className="mt-2 text-muted">

            Your personalized pathway toward
            professional opportunities.

          </p>

        </div>

        <button
          type="button"
          disabled={loading || Boolean(busyTask)}
          onClick={refreshReadiness}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
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

      {/* Feedback */}

      {error && (

        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>

      )}

      {message && (

        <p
          role="status"
          className="rounded-xl bg-green-50 p-4 text-sm text-green-700"
        >
          {message}
        </p>

      )}

      {loading ? (

        <div
          role="status"
          className="flex flex-col items-center py-20"
        >

          <LoaderCircle
            size={40}
            className="animate-spin text-primary"
          />

          <p className="mt-4 text-sm text-muted">
            Calculating your preparation progress...
          </p>

        </div>

      ) : !readiness ? (

        <div className="rounded-xl border border-border bg-white p-8 text-center">

          <p className="text-muted">
            Preparation information is unavailable.
          </p>

          <button
            type="button"
            onClick={refreshReadiness}
            className="mt-4 font-semibold text-primary"
          >
            Try again
          </button>

        </div>

      ) : (

        <>

          {/* Readiness hero */}

          <section className="rounded-2xl bg-[#123C35] p-6 text-white sm:p-10">

            <div className="flex flex-col items-center gap-8 sm:flex-row">

              <ReadinessGauge
                score={readiness.score}
              />

              <div className="flex-1">

                <p className="text-xs font-bold uppercase tracking-widest text-[#D5F76A]">
                  Your career preparation
                </p>

                <h2 className="mt-3 text-3xl font-extrabold">

                  {getReadinessLabel(
                    readiness.score
                  )}

                </h2>

                <p className="mt-3 max-w-xl leading-relaxed text-white/70">

                  Complete your professional
                  preparation tasks to strengthen
                  your profile and explore relevant
                  opportunities.

                </p>

                <p className="mt-5 text-sm font-semibold text-[#D5F76A]">

                  {readiness.completedCount} of{' '}
                  {readiness.totalTasks} tasks completed

                </p>

              </div>

            </div>

          </section>

          {/* Category cards */}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

            {categories.map((category) => {

              const progress =
                getCategoryProgress(
                  category.key
                )

              return (

                <article
                  key={category.key}
                  className="rounded-xl border border-border bg-white p-5"
                >

                  <category.icon
                    size={24}
                    className="text-primary"
                  />

                  <p className="mt-4 text-sm text-muted">

                    {category.label}

                  </p>

                  <p className="mt-2 text-2xl font-extrabold text-primary">

                    {progress.completed}
                    <span className="text-sm font-medium text-muted">

                      /{progress.total}

                    </span>

                  </p>

                  <div
                    role="progressbar"
                    aria-label={category.label}
                    aria-valuenow={progress.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"
                  >

                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${progress.percentage}%`,
                      }}
                    />

                  </div>

                </article>

              )
            })}

          </div>

          {/* Recommendations */}

          <section className="rounded-2xl border border-border bg-white p-6">

            <div className="flex items-center gap-3">

              <Lightbulb
                size={24}
                className="text-primary"
              />

              <h2 className="text-xl font-bold">

                Recommended next actions

              </h2>

            </div>

            <p className="mt-2 text-sm text-muted">

              Focus on these remaining preparation
              tasks to strengthen your profile.

            </p>

            {readiness.recommendations.length === 0 ? (

              <div className="mt-5 rounded-xl bg-green-50 p-5">

                <div className="flex items-center gap-3">

                  <CheckCircle2
                    size={24}
                    className="text-green-700"
                  />

                  <p className="font-semibold text-green-700">

                    All preparation tasks completed.

                  </p>

                </div>

                <p className="mt-2 text-sm text-green-700">

                  Keep your professional information
                  updated as your experience develops.

                </p>

              </div>

            ) : (

              <div className="mt-5 space-y-3">

                {readiness.recommendations.map(
                  (task) => (

                    <article
                      key={task.key}
                      className="flex flex-wrap items-start gap-4 rounded-xl bg-surface p-4"
                    >

                      <Target
                        size={23}
                        className="shrink-0 text-primary"
                      />

                      <div className="min-w-0 flex-1">

                        <h3 className="font-semibold">

                          {task.title}

                        </h3>

                        <p className="mt-1 text-sm leading-relaxed text-muted">

                          {task.description}

                        </p>

                        <p className="mt-2 text-xs font-semibold text-primary">

                          +{task.points} preparation points

                        </p>

                      </div>

                      {task.actionPath ? (

                        <Link
                          to={task.actionPath}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                        >

                          {task.actionLabel}

                          <ArrowRight size={16} />

                        </Link>

                      ) : (

                        <a
                          href="#readiness-checklist"
                          onClick={() => setFilter('all')}
                          className="text-sm font-semibold text-primary"
                        >

                          View checklist

                        </a>

                      )}

                    </article>

                  )
                )}

              </div>

            )}

          </section>

          {/* Main checklist */}

          <section
            id="readiness-checklist"
            className="scroll-mt-6 rounded-2xl border border-border bg-white p-6"
          >

            <h2 className="text-xl font-bold">

              Your preparation checklist

            </h2>

            <p className="mt-2 text-sm text-muted">

              Automatic tasks reflect your saved
              professional information. Manual
              tasks are self-reported.

            </p>

            {/* Filters */}

            <div className="mt-5 flex flex-wrap gap-2">

              {([
                {
                  value: 'all',
                  label: 'All tasks',
                },
                {
                  value: 'completed',
                  label: 'Completed',
                },
                {
                  value: 'incomplete',
                  label: 'Remaining',
                },
              ] as const).map((item) => (

                <button
                  key={item.value}
                  type="button"
                  aria-pressed={
                    filter === item.value
                  }
                  onClick={() =>
                    setFilter(item.value)
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    filter === item.value
                      ? 'bg-primary text-white'
                      : 'bg-surface text-muted'
                  }`}
                >

                  {item.label}

                </button>

              ))}

            </div>

            {/* Tasks */}

            <div className="mt-6 divide-y divide-border">

              {filteredTasks.map((task) => (

                <article
                  key={task.key}
                  className="flex flex-wrap items-start gap-4 py-5"
                >

                  {/* Task completion control */}

                  {task.type === 'manual' ? (

                    <button
                      type="button"
                      disabled={Boolean(busyTask)}
                      aria-pressed={task.completed}
                      aria-label={
                        task.completed
                          ? `Reset ${task.title}`
                          : `Complete ${task.title}`
                      }
                      onClick={() =>
                        void handleToggleTask(task)
                      }
                      className="mt-1 shrink-0 text-primary disabled:opacity-50"
                    >

                      {busyTask === task.key ? (

                        <LoaderCircle
                          size={26}
                          className="animate-spin"
                        />

                      ) : task.completed ? (

                        <CheckCircle2 size={26} />

                      ) : (

                        <Circle
                          size={26}
                          className="text-slate-400"
                        />

                      )}

                    </button>

                  ) : (

                    <div className="mt-1 shrink-0">

                      {task.completed ? (

                        <CheckCircle2
                          size={26}
                          className="text-primary"
                        />

                      ) : (

                        <Circle
                          size={26}
                          className="text-slate-400"
                        />

                      )}

                    </div>

                  )}

                  {/* Task information */}

                  <div className="min-w-0 flex-1">

                    <h3 className="font-semibold">

                      {task.title}

                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-muted">

                      {task.description}

                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">

                        {task.type === 'automatic'
                          ? 'Automatic'
                          : 'Self-reported'}

                      </span>

                      <span className={`text-xs font-semibold ${
                        task.completed
                          ? 'text-green-700'
                          : 'text-muted'
                      }`}>

                        {task.completed
                          ? 'Completed'
                          : 'Not completed'}

                      </span>

                    </div>

                  </div>

                  {/* Points and task action */}

                  <div className="flex flex-col items-end gap-3">

                    <span className={`text-sm font-bold ${
                      task.completed
                        ? 'text-primary'
                        : 'text-muted'
                    }`}>

                      {task.completed
                        ? task.points
                        : 0}

                      /{task.points} pts

                    </span>

                    {!task.completed &&
                      task.actionPath && (

                      <Link
                        to={task.actionPath}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
                      >

                        {task.actionLabel}

                        <ArrowRight size={14} />

                      </Link>

                    )}

                  </div>

                </article>

              ))}

              {filteredTasks.length === 0 && (

                <p className="py-10 text-center text-sm text-muted">

                  No tasks match this filter.

                </p>

              )}

            </div>

          </section>

          {/* Employment guidance */}

          <section className="rounded-2xl border border-border bg-white p-6">

            <div className="flex items-center gap-3">

              <Compass
                size={26}
                className="text-primary"
              />

              <h2 className="text-xl font-bold">

                Employment information and support

              </h2>

            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted">

              If you need assistance understanding
              employment requirements, qualification
              recognition or access to professional
              opportunities, consult appropriate
              official authorities or qualified
              support organizations.

            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              {[
                {
                  title: 'UNHCR Kenya',
                  description:
                    'Refugee information and support resources.',
                  url: 'https://help.unhcr.org/kenya/',
                },
                {
                  title: 'Department of Refugee Services',
                  description:
                    'Official refugee-related information in Kenya.',
                  url: 'https://refugee.go.ke/',
                },
              ].map((resource) => (

                <a
                  key={resource.title}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-border p-4 transition-colors hover:border-primary"
                >

                  <h3 className="font-semibold text-primary">

                    {resource.title}

                  </h3>

                  <p className="mt-2 text-sm text-muted">

                    {resource.description}

                  </p>

                  <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary">

                    Visit official website

                    <ArrowRight size={14} />

                  </span>

                </a>

              ))}

            </div>

          </section>

          {/* Disclaimer */}

          <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-5">

            <Info
              size={20}
              className="shrink-0 text-primary"
            />

            <p className="text-xs leading-relaxed text-muted">

              Your preparation score measures
              completion of TalentBridge's
              professional preparation checklist.

              It does not determine legal work
              eligibility, employment suitability,
              professional licensing or likelihood
              of receiving a job offer.

              Self-reported preparation tasks are
              not independently verified.

            </p>

          </div>

        </>

      )}

    </div>

  )
}