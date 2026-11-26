import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  BadgeCheck,
  ClipboardCheck,
  FileText,
  Eye,
  LogOut,
  Clock,
  CircleX,
  RefreshCw,
} from 'lucide-react'

import { useAuthStore } from '../../store/authStore'
import { logoutUser } from '../../services/authService'
import { getEvidenceUrl } from '../../services/evidenceService'

import {
  getReviewQueue,
  getMyReviews,
  reviewEvidence,
} from '../../services/reviewService'

import type {
  Review,
  ReviewDecision,
  ReviewQueueItem,
} from '../../types/review'

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

export default function ReviewerDashboard() {

  const profile = useAuthStore(
    (state) => state.profile
  )

  if (!profile) return null

  return (
    <ReviewerWorkspace
      key={profile.id}
      reviewerId={profile.id}
      fullName={profile.full_name}
    />
  )
}

function ReviewerWorkspace({
  reviewerId,
  fullName,
}: {
  reviewerId: string
  fullName: string
}) {

  const [queue, setQueue] =
    useState<ReviewQueueItem[]>([])

  const [reviews, setReviews] =
    useState<Review[]>([])

  const [selectedId, setSelectedId] =
    useState<string | null>(null)

  const [feedback, setFeedback] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [busy, setBusy] =
    useState(false)

  const [error, setError] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [documentUrl, setDocumentUrl] =
    useState('')

  const [reloadKey, setReloadKey] =
    useState(0)

  useEffect(() => {

    let active = true

    Promise.all([
      getReviewQueue(),
      getMyReviews(reviewerId),
    ])
      .then(([pending, history]) => {

        if (!active) return

        setQueue(pending)
        setReviews(history)

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

  }, [reviewerId, reloadKey])

  const selected = queue.find(
    (item) => item.id === selectedId
  )

  const approvedCount = reviews.filter(
    (item) => item.decision === 'approved'
  ).length

  const rejectedCount = reviews.filter(
    (item) => item.decision === 'rejected'
  ).length

  function selectEvidence(
    item: ReviewQueueItem
  ) {

    setSelectedId(item.id)
    setFeedback('')
    setDocumentUrl('')
    setError('')
    setMessage('')

  }

  function refreshQueue() {

    setLoading(true)
    setError('')
    setSelectedId(null)
    setFeedback('')
    setDocumentUrl('')

    setReloadKey((value) => value + 1)

  }

  async function handleViewDocument() {

    if (!selected || busy) return

    setBusy(true)
    setError('')
    setDocumentUrl('')

    try {

      const url = await getEvidenceUrl(
        selected.file_path
      )

      setDocumentUrl(url)

    } catch (err) {
      setError(getErrorMessage(err))

    } finally {
      setBusy(false)
    }
  }

  async function handleDecision(
    decision: ReviewDecision
  ) {

    if (!selected || busy) return

    if (feedback.trim().length < 10) {
      setError(
        'Provide meaningful feedback of at least 10 characters.'
      )
      return
    }

    const confirmed = window.confirm(
      `Confirm this ${decision} decision?`
    )

    if (!confirmed) return

    setBusy(true)
    setError('')
    setMessage('')

    try {

      await reviewEvidence(
        selected.id,
        decision,
        feedback
      )

      setQueue((previous) =>
        previous.filter(
          (item) => item.id !== selected.id
        )
      )

      setSelectedId(null)
      setFeedback('')
      setDocumentUrl('')

      setMessage(
        `Evidence ${decision} successfully.`
      )

      refreshQueue()

    } catch (err) {
      setError(getErrorMessage(err))

    } finally {
      setBusy(false)
    }
  }

  async function handleLogout() {

    try {
      await logoutUser()
    } catch (err) {
      setError(getErrorMessage(err))
    }

  }

  return (
    <main className="min-h-screen bg-surface">

      {/* Header */}

      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-white px-6 py-5">

        <div className="flex items-center gap-3">

          <BadgeCheck
            size={30}
            className="text-primary"
          />

          <div>
            <h1 className="font-bold">
              TalentBridge AI
            </h1>

            <p className="text-xs text-muted">
              Reviewer workspace
            </p>
          </div>

        </div>

        <div className="flex items-center gap-4">

          <Link
            to="/account/profile"
            className="text-sm font-medium"
          >
            {fullName}
          </Link>

          <button
            type="button"
            onClick={() => void handleLogout()}
            aria-label="Sign out"
            className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={22} />
          </button>

        </div>

      </header>

      <div className="mx-auto max-w-7xl space-y-6 p-6 sm:p-10">

        {/* Hero */}

        <section className="rounded-2xl bg-primary-dark p-8 text-white">

          <ClipboardCheck
            size={44}
            className="mb-5 text-accent"
          />

          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            Professional validation
          </p>

          <h2 className="mt-3 text-3xl font-extrabold">
            Every skill deserves recognition.
          </h2>

          <p className="mt-3 max-w-2xl text-white/70">
            Evaluate supporting evidence and help
            candidates build trusted professional
            credentials.
          </p>

        </section>

        {/* Statistics */}

        <div className="grid gap-4 sm:grid-cols-3">

          {[
            {
              label: 'Pending reviews',
              value: queue.length,
              icon: Clock,
            },
            {
              label: 'Approved by me',
              value: approvedCount,
              icon: BadgeCheck,
            },
            {
              label: 'Rejected by me',
              value: rejectedCount,
              icon: CircleX,
            },
          ].map((item) => (

            <article
              key={item.label}
              className="rounded-xl border border-border bg-white p-6"
            >

              <item.icon
                size={24}
                className="mb-4 text-primary"
              />

              <p className="text-sm text-muted">
                {item.label}
              </p>

              <p className="mt-2 text-3xl font-bold">
                {item.value}
              </p>

            </article>

          ))}

        </div>

        {/* Feedback */}

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-4 text-red-700"
          >
            {error}
          </p>
        )}

        {message && (
          <p
            role="status"
            className="rounded-lg bg-green-50 p-4 text-green-700"
          >
            {message}
          </p>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-2">

          {/* Review queue */}

          <section className="rounded-2xl border border-border bg-white p-6">

            <div className="flex items-center justify-between gap-3">

              <h2 className="text-xl font-bold">
                Pending evidence
              </h2>

              <button
                type="button"
                disabled={busy || loading}
                onClick={refreshQueue}
                aria-label="Refresh review queue"
                className="rounded-lg p-2 text-primary disabled:opacity-50"
              >

                <RefreshCw
                  size={20}
                  className={
                    loading ? 'animate-spin' : ''
                  }
                />

              </button>

            </div>

            {loading ? (

              <p className="py-10 text-center text-muted">
                Loading submissions...
              </p>

            ) : queue.length === 0 ? (

              <div className="py-12 text-center">

                <ClipboardCheck
                  size={44}
                  className="mx-auto text-muted"
                />

                <p className="mt-4 text-sm text-muted">
                  No pending evidence submissions.
                </p>

              </div>

            ) : (

              <div className="mt-5 space-y-3">

                {queue.map((item) => (

                  <button
                    key={item.id}
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      selectEvidence(item)
                    }
                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                      selectedId === item.id
                        ? 'border-primary bg-brand-50'
                        : 'border-border hover:bg-surface'
                    }`}
                  >

                    <FileText
                      size={25}
                      className="shrink-0 text-primary"
                    />

                    <div className="min-w-0 flex-1">

                      <h3 className="break-words font-semibold">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm text-primary">
                        {item.skill_name}
                      </p>

                      <p className="mt-1 text-xs capitalize text-muted">
                        {item.evidence_type.replaceAll('_', ' ')}
                      </p>

                    </div>

                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700">
                      Pending
                    </span>

                  </button>

                ))}

              </div>

            )}

          </section>

          {/* Review workspace */}

          <section className="rounded-2xl border border-border bg-white p-6">

            <h2 className="text-xl font-bold">
              Evidence evaluation
            </h2>

            {!selected ? (

              <div className="py-12 text-center">

                <FileText
                  size={44}
                  className="mx-auto text-muted"
                />

                <p className="mt-4 text-sm text-muted">
                  Select evidence from the review queue.
                </p>

              </div>

            ) : (

              <div className="mt-6 space-y-5">

                <div>

                  <h3 className="text-lg font-bold">
                    {selected.title}
                  </h3>

                  <p className="mt-2 text-sm text-primary">
                    Related skill: {selected.skill_name}
                  </p>

                  <p className="mt-3 whitespace-pre-wrap break-words text-sm text-muted">
                    {selected.description ||
                      'No description provided.'}
                  </p>

                </div>

                {/* View document */}

                <div className="rounded-xl border border-border p-4">

                  <p className="break-words text-sm font-medium">
                    {selected.file_name}
                  </p>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void handleViewDocument()
                    }
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                  >

                    <Eye size={18} />
                    Generate document link

                  </button>

                  {documentUrl && (

                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 block text-sm font-semibold text-primary underline"
                    >
                      Open supporting document
                      (expires after 60 seconds)
                    </a>

                  )}

                </div>

                {/* Evaluation guidance */}

                <div className="rounded-xl bg-surface p-4">

                  <h4 className="font-semibold">
                    Evaluation criteria
                  </h4>

                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">

                    <li>
                      Is the evidence relevant to the linked skill?
                    </li>

                    <li>
                      Is the document legible and credible?
                    </li>

                    <li>
                      Does it demonstrate sufficient competency?
                    </li>

                  </ul>

                </div>

                {/* Feedback */}

                <label className="block text-sm font-medium">

                  Reviewer feedback

                  <textarea
                    rows={5}
                    value={feedback}
                    disabled={busy}
                    maxLength={2000}
                    onChange={(event) =>
                      setFeedback(event.target.value)
                    }
                    placeholder="Explain your assessment and decision..."
                    className="mt-2 w-full rounded-xl border border-border px-4 py-3"
                  />

                </label>

                <p className="text-right text-xs text-muted">
                  {feedback.length}/2000
                </p>

                {/* Review actions */}

                <div className="grid gap-3 sm:grid-cols-2">

                  <button
                    type="button"
                    disabled={busy || loading || feedback.trim().length < 10}
                    onClick={() =>
                      void handleDecision('rejected')
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >

                    <CircleX size={18} />
                    Reject

                  </button>

                  <button
                    type="button"
                    disabled={busy || loading || feedback.trim().length < 10}
                    onClick={() =>
                      void handleDecision('approved')
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white disabled:opacity-50"
                  >

                    <BadgeCheck size={18} />
                    Approve

                  </button>

                </div>

              </div>

            )}

          </section>

        </div>

        {/* Review history */}

        <section className="rounded-2xl border border-border bg-white p-6">

          <h2 className="text-xl font-bold">
            My review history
          </h2>

          {reviews.length === 0 ? (

            <p className="py-8 text-center text-sm text-muted">
              No reviews completed yet.
            </p>

          ) : (

            <div className="mt-5 divide-y divide-border">

              {reviews.map((review) => (

                <article
                  key={review.id}
                  className="py-4"
                >

                  <div className="flex items-center justify-between">

                    <span className={`text-sm font-semibold capitalize ${
                      review.decision === 'approved'
                        ? 'text-primary'
                        : 'text-red-600'
                    }`}>

                      {review.decision}

                    </span>

                    <time className="text-xs text-muted">
                      {new Date(review.created_at)
                        .toLocaleDateString()}
                    </time>

                  </div>

                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted">
                    {review.feedback}
                  </p>

                </article>

              ))}

            </div>

          )}

        </section>

      </div>

    </main>
  )
}