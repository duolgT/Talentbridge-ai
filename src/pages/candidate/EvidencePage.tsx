import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  FolderCheck,
  UploadCloud,
  FileText,
  Eye,
  Trash2,
  LoaderCircle,
  BadgeCheck,
  Send,
  Clock,
  CircleX,
  RefreshCw,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import { useAuthStore } from '../../store/authStore'

import {
  getCandidateSkills,
} from '../../services/skillService'

import {
  getEvidence,
  uploadEvidence,
  deleteEvidence,
  getEvidenceUrl,
  validateEvidenceFile,
} from '../../services/evidenceService'

import {
  submitEvidence,
  getEvidenceReviews,
} from '../../services/reviewService'

import type {
  Evidence,
  EvidenceType,
  EvidenceStatus,
} from '../../types/evidence'

import type {
  CandidateSkill,
} from '../../types/skills'

import type {
  Review,
} from '../../types/review'

// Evidence categories

const evidenceTypes: {
  value: EvidenceType
  label: string
}[] = [
  {
    value: 'certificate',
    label: 'Professional certificate',
  },
  {
    value: 'work_sample',
    label: 'Work sample',
  },
  {
    value: 'reference_letter',
    label: 'Reference letter',
  },
  {
    value: 'qualification',
    label: 'Academic qualification',
  },
  {
    value: 'other',
    label: 'Other supporting evidence',
  },
]

// Status configuration

const statusConfig: Record<
  EvidenceStatus,
  {
    label: string
    className: string
    icon: typeof FileText
  }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-600',
    icon: FileText,
  },

  pending: {
    label: 'Pending review',
    className: 'bg-amber-50 text-amber-700',
    icon: Clock,
  },

  approved: {
    label: 'Approved',
    className: 'bg-green-50 text-green-700',
    icon: BadgeCheck,
  },

  rejected: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700',
    icon: CircleX,
  },
}

// Error handling

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

// Main page

export default function EvidencePage() {
  const profile = useAuthStore(
    (state) => state.profile
  )

  if (!profile) return null

  return (
    <EvidenceWorkspace
      key={profile.id}
      candidateId={profile.id}
    />
  )
}

// Evidence workspace

function EvidenceWorkspace({
  candidateId,
}: {
  candidateId: string
}) {

  // Database state

  const [records, setRecords] =
    useState<Evidence[]>([])

  const [skills, setSkills] =
    useState<CandidateSkill[]>([])

  const [reviews, setReviews] =
    useState<Review[]>([])

  // Application state

  const [loading, setLoading] =
    useState(true)

  const [busy, setBusy] =
    useState(false)

  const [formOpen, setFormOpen] =
    useState(false)

  const [reloadKey, setReloadKey] =
    useState(0)

  const [filter, setFilter] =
    useState<EvidenceStatus | 'all'>('all')

  // Form state

  const [title, setTitle] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [skillId, setSkillId] =
    useState('')

  const [evidenceType, setEvidenceType] =
    useState<EvidenceType>('certificate')

  const [file, setFile] =
    useState<File | null>(null)

  // Feedback state

  const [error, setError] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [preview, setPreview] =
    useState<{
      url: string
      title: string
    } | null>(null)

  // Load evidence, candidate skills and reviews

  useEffect(() => {
    let active = true

    Promise.all([
      getEvidence(candidateId),
      getCandidateSkills(candidateId),
      getEvidenceReviews(),
    ])
      .then(
        ([
          evidence,
          candidateSkills,
          decisions,
        ]) => {

          if (!active) return

          setRecords(evidence)
          setSkills(candidateSkills)
          setReviews(decisions)

        }
      )
      .catch((err) => {

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

  }, [candidateId, reloadKey])

  // Derived statistics

  const draftCount = records.filter(
    (record) => record.status === 'draft'
  ).length

  const pendingCount = records.filter(
    (record) => record.status === 'pending'
  ).length

  const approvedCount = records.filter(
    (record) => record.status === 'approved'
  ).length

  const rejectedCount = records.filter(
    (record) => record.status === 'rejected'
  ).length

  const filteredRecords = records.filter(
    (record) =>
      filter === 'all' ||
      record.status === filter
  )

  // Refresh evidence

  function refreshEvidence() {
    setLoading(true)
    setError('')
    setPreview(null)

    setReloadKey(
      (previous) => previous + 1
    )
  }

  // Reset upload form

  function resetForm() {
    setTitle('')
    setDescription('')
    setSkillId('')
    setEvidenceType('certificate')
    setFile(null)
    setFormOpen(false)
  }

  // File validation

  function handleFileChange(
    selectedFile: File | null
  ) {

    setError('')
    setFile(null)

    if (!selectedFile) return

    try {

      validateEvidenceFile(selectedFile)

      setFile(selectedFile)

    } catch (err) {

      setError(getErrorMessage(err))

    }
  }

  // Upload evidence

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault()

    if (busy) return

    setError('')
    setMessage('')

    if (!file) {
      setError('Please select a document.')
      return
    }

    if (!title.trim() || !skillId) {
      setError(
        'Please provide a title and select a skill.'
      )
      return
    }

    try {

      setBusy(true)

      const record = await uploadEvidence(
        candidateId,
        {
          title,
          description,
          evidence_type: evidenceType,
          candidate_skill_id: skillId,
          file,
        }
      )

      setRecords((previous) => [
        record,
        ...previous,
      ])

      resetForm()

      setFilter('all')

      setMessage(
        'Evidence uploaded successfully. You can now submit it for verification.'
      )

    } catch (err) {

      setError(getErrorMessage(err))

    } finally {

      setBusy(false)

    }
  }

  // View document

  async function handleView(
    record: Evidence
  ) {

    if (busy) return

    setError('')
    setPreview(null)
    setBusy(true)

    try {

      const url = await getEvidenceUrl(
        record.file_path
      )

      setPreview({
        url,
        title: record.title,
      })

    } catch (err) {

      setError(getErrorMessage(err))

    } finally {

      setBusy(false)

    }
  }

  // Submit evidence for verification

  async function handleSubmitForReview(
    record: Evidence
  ) {

    if (
      busy ||
      record.status !== 'draft'
    ) return

    const confirmed = window.confirm(
      'Submit this document for verification?\n\n' +
      'Authorized reviewers will be able to view it.\n\n' +
      'You cannot delete it through the normal workflow after submission.'
    )

    if (!confirmed) return

    setBusy(true)
    setError('')
    setMessage('')

    try {

      await submitEvidence(record.id)

      setRecords((previous) =>
        previous.map((item) =>
          item.id === record.id
            ? {
                ...item,
                status: 'pending',
              }
            : item
        )
      )

      setMessage(
        'Evidence submitted successfully. An authorized reviewer will evaluate your document.'
      )

      refreshEvidence()

    } catch (err) {

      setError(getErrorMessage(err))

    } finally {

      setBusy(false)

    }
  }

  // Delete draft evidence

  async function handleDelete(
    record: Evidence
  ) {

    if (
      busy ||
      record.status !== 'draft'
    ) return

    const confirmed = window.confirm(
      `Are you sure you want to delete "${record.title}"?\n\n` +
      'This action cannot be undone.'
    )

    if (!confirmed) return

    setBusy(true)
    setError('')
    setMessage('')
    setPreview(null)

    try {

      const result = await deleteEvidence(
        candidateId,
        record
      )

      setRecords((previous) =>
        previous.filter(
          (item) => item.id !== record.id
        )
      )

      setMessage(
        result.cleanupFailed
          ? 'Record removed. Storage cleanup requires attention.'
          : 'Evidence deleted successfully.'
      )

    } catch (err) {

      setError(getErrorMessage(err))

    } finally {

      setBusy(false)

    }
  }

  return (

    <div className="mx-auto max-w-6xl space-y-6">

      {/* Page heading */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>

          <h1 className="text-3xl font-extrabold">
            Evidence portfolio
          </h1>

          <p className="mt-2 text-muted">
            Support your professional skills
            with meaningful evidence.
          </p>

        </div>

        <button
          type="button"
          disabled={busy || loading}
          onClick={refreshEvidence}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-3 text-sm font-medium disabled:opacity-50"
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

      {/* Hero section */}

      <section className="rounded-2xl bg-primary-dark p-8 text-white">

        <FolderCheck
          size={44}
          className="mb-5 text-accent"
        />

        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">
          Evidence-backed competencies
        </p>

        <h2 className="text-3xl font-bold">
          Turn your experience into evidence.
        </h2>

        <p className="mt-3 max-w-2xl leading-relaxed text-white/70">
          Upload certificates, project samples
          and professional references to support
          your skills and build a trusted
          digital skills passport.
        </p>

        <button
          type="button"
          disabled={
            loading ||
            busy ||
            skills.length === 0
          }
          onClick={() => {

            setError('')
            setMessage('')
            setFormOpen(true)

          }}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-primary-dark transition-opacity disabled:opacity-50"
        >

          <UploadCloud size={20} />

          Upload evidence

        </button>

        {!loading && skills.length === 0 && (

          <div className="mt-4">

            <p className="text-sm text-accent">
              Add a professional skill before
              uploading evidence.
            </p>

            <Link
              to="/skills"
              className="mt-2 inline-block text-sm font-semibold underline"
            >
              Go to my skills
            </Link>

          </div>

        )}

      </section>

      {/* Statistics */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        {[
          {
            label: 'Total evidence',
            value: records.length,
            icon: FolderCheck,
            color: 'text-primary',
          },
          {
            label: 'Awaiting review',
            value: pendingCount,
            icon: Clock,
            color: 'text-amber-600',
          },
          {
            label: 'Approved evidence',
            value: approvedCount,
            icon: BadgeCheck,
            color: 'text-green-600',
          },
          {
            label: 'Rejected evidence',
            value: rejectedCount,
            icon: CircleX,
            color: 'text-red-600',
          },
        ].map((item) => (

          <article
            key={item.label}
            className="rounded-xl border border-border bg-white p-5"
          >

            <item.icon
              size={24}
              className={item.color}
            />

            <p className="mt-4 text-sm text-muted">
              {item.label}
            </p>

            <p className={`mt-2 text-3xl font-bold ${item.color}`}>
              {item.value}
            </p>

          </article>

        ))}

      </div>

      {/* Verification workflow */}

      <section className="rounded-2xl border border-border bg-white p-6">

        <h2 className="font-bold">
          How verification works
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">

          {[
            {
              number: '01',
              title: 'Upload evidence',
              description:
                'Add supporting documents and link them to a professional skill.',
            },
            {
              number: '02',
              title: 'Submit for review',
              description:
                'Allow authorized reviewers to evaluate your supporting evidence.',
            },
            {
              number: '03',
              title: 'Get verified',
              description:
                'Approved evidence supports your verified professional competencies.',
            },
          ].map((step) => (

            <article
              key={step.number}
              className="rounded-xl bg-surface p-4"
            >

              <span className="text-lg font-extrabold text-primary">
                {step.number}
              </span>

              <h3 className="mt-3 text-sm font-semibold">
                {step.title}
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-muted">
                {step.description}
              </p>

            </article>

          ))}

        </div>

      </section>

      {/* Error messages */}

      {error && (

        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
        >

          <CircleX
            size={20}
            className="shrink-0"
          />

          <p className="text-sm">
            {error}
          </p>

        </div>

      )}

      {/* Success messages */}

      {message && (

        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700"
        >

          <BadgeCheck
            size={20}
            className="shrink-0"
          />

          <p className="text-sm">
            {message}
          </p>

        </div>

      )}

      {/* Temporary document link */}

      {preview && (

        <section className="rounded-xl border border-border bg-white p-5">

          <div className="flex items-start gap-4">

            <FileText
              size={28}
              className="shrink-0 text-primary"
            />

            <div className="min-w-0 flex-1">

              <h3 className="break-words font-bold">
                {preview.title}
              </h3>

              <p className="mt-2 text-sm text-muted">
                This document link expires
                60 seconds after creation.
              </p>

              <div className="mt-4 flex flex-wrap gap-4">

                <a
                  href={preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-primary"
                >

                  <Eye size={18} />

                  Open document

                </a>

                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="text-sm text-muted"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </section>

      )}

      {/* Upload form */}

      {formOpen && (

        <section className="rounded-2xl border border-border bg-white p-6 sm:p-8">

          <h2 className="text-xl font-bold">
            Upload supporting evidence
          </h2>

          <p className="mt-2 text-sm text-muted">
            Select a professional skill and attach
            a relevant supporting document.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >

            <fieldset
              disabled={busy}
              className="space-y-5"
            >

              {/* Evidence title */}

              <label className="block text-sm font-medium">

                Evidence title

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Front-End Development Certificate"
                  maxLength={150}
                  required
                  className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                />

              </label>

              {/* Evidence type and related skill */}

              <div className="grid gap-5 sm:grid-cols-2">

                <label className="block text-sm font-medium">

                  Evidence type

                  <select
                    value={evidenceType}
                    onChange={(event) =>
                      setEvidenceType(
                        event.target.value as EvidenceType
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                  >

                    {evidenceTypes.map((type) => (

                      <option
                        key={type.value}
                        value={type.value}
                      >

                        {type.label}

                      </option>

                    ))}

                  </select>

                </label>

                <label className="block text-sm font-medium">

                  Related professional skill

                  <select
                    value={skillId}
                    required
                    onChange={(event) =>
                      setSkillId(event.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                  >

                    <option value="">
                      Select a skill
                    </option>

                    {skills.map((record) => (

                      <option
                        key={record.id}
                        value={record.id}
                      >

                        {record.skills.name}

                      </option>

                    ))}

                  </select>

                </label>

              </div>

              {/* Description */}

              <label className="block text-sm font-medium">

                Description

                <textarea
                  rows={4}
                  maxLength={1000}
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Explain how this document supports your selected skill."
                  className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                />

              </label>

              <p className="text-right text-xs text-muted">
                {description.length}/1000
              </p>

              {/* File selection */}

              <label className="block cursor-pointer rounded-xl border-2 border-dashed border-border bg-surface p-8 text-center transition-colors hover:border-primary">

                <UploadCloud
                  size={38}
                  className="mx-auto text-primary"
                />

                <span className="mt-4 block break-words font-semibold">

                  {file
                    ? file.name
                    : 'Choose a document'}

                </span>

                <span className="mt-2 block text-sm text-muted">

                  PDF, PNG or JPEG — maximum 5 MB

                </span>

                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                  onChange={(event) => {

                    handleFileChange(
                      event.target.files?.[0] || null
                    )

                    event.target.value = ''

                  }}
                  className="mt-4 max-w-full text-sm"
                />

                {file && (

                  <span className="mt-3 block text-xs font-medium text-primary">

                    {(file.size / 1024 / 1024)
                      .toFixed(2)} MB selected

                  </span>

                )}

              </label>

              {/* Privacy notice */}

              <div className="rounded-lg bg-brand-50 p-4">

                <p className="text-xs leading-relaxed text-muted">

                  Your documents remain private until
                  submitted for verification.

                  Upload only documents you are authorized
                  to share. Avoid unnecessary personal
                  identifiers and sensitive information.

                </p>

              </div>

            </fieldset>

            {/* Form actions */}

            <div className="flex flex-wrap justify-end gap-3">

              <button
                type="button"
                disabled={busy}
                onClick={resetForm}
                className="rounded-lg border border-border px-5 py-3 text-sm font-medium"
              >

                Cancel

              </button>

              <button
                type="submit"
                disabled={busy || !file}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >

                {busy ? (

                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />

                ) : (

                  <UploadCloud size={18} />

                )}

                {busy
                  ? 'Uploading...'
                  : 'Upload document'}

              </button>

            </div>

          </form>

        </section>

      )}

      {/* Evidence records */}

      <section className="rounded-2xl border border-border bg-white p-6">

        <h2 className="text-xl font-bold">
          My supporting documents
        </h2>

        <p className="mt-2 text-sm text-muted">
          Manage your evidence and track
          verification decisions.
        </p>

        {/* Status filters */}

        <div className="mt-5 flex flex-wrap gap-2">

          {([
            {
              value: 'all',
              label: `All (${records.length})`,
            },
            {
              value: 'draft',
              label: `Draft (${draftCount})`,
            },
            {
              value: 'pending',
              label: `Pending (${pendingCount})`,
            },
            {
              value: 'approved',
              label: `Approved (${approvedCount})`,
            },
            {
              value: 'rejected',
              label: `Rejected (${rejectedCount})`,
            },
          ] as const).map((item) => (

            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                filter === item.value
                  ? 'bg-primary text-white'
                  : 'bg-surface text-muted hover:text-primary'
              }`}
            >

              {item.label}

            </button>

          ))}

        </div>

        {/* Loading state */}

        {loading ? (

          <div
            role="status"
            className="flex justify-center py-12"
          >

            <LoaderCircle
              size={30}
              className="animate-spin text-primary"
            />

            <span className="sr-only">
              Loading documents
            </span>

          </div>

        ) : filteredRecords.length === 0 ? (

          /* Empty state */

          <div className="py-12 text-center">

            <FolderCheck
              size={44}
              className="mx-auto text-muted"
            />

            <h3 className="mt-4 font-semibold">

              {records.length === 0
                ? 'No evidence uploaded yet'
                : 'No matching documents'}

            </h3>

            <p className="mt-2 text-sm text-muted">

              {records.length === 0
                ? 'Add your first supporting document.'
                : 'Try selecting a different evidence status.'}

            </p>

          </div>

        ) : (

          /* Evidence list */

          <div className="mt-5 divide-y divide-border">

            {filteredRecords.map((record) => {

              const linkedSkill = skills.find(
                (skill) =>
                  skill.id === record.candidate_skill_id
              )

              const review = reviews.find(
                (item) =>
                  item.evidence_id === record.id
              )

              const status =
                statusConfig[record.status]

              const StatusIcon = status.icon

              return (

                <article
                  key={record.id}
                  className="py-6"
                >

                  <div className="flex flex-wrap items-start gap-4">

                    {/* Document icon */}

                    <div className="rounded-xl bg-brand-50 p-3 text-primary">

                      <FileText size={28} />

                    </div>

                    {/* Evidence information */}

                    <div className="min-w-0 flex-1">

                      <h3 className="break-words font-bold">

                        {record.title}

                      </h3>

                      <p className="mt-1 break-words text-sm text-muted">

                        {record.file_name}

                      </p>

                      <p className="mt-2 text-xs capitalize text-muted">

                        {record.evidence_type.replaceAll('_', ' ')}

                      </p>

                      <p className="mt-2 text-sm font-medium text-primary">

                        Linked skill: {
                          linkedSkill?.skills.name ||
                          'Unavailable'
                        }

                      </p>

                      <p className="mt-1 text-xs text-muted">

                        {(record.file_size / 1024)
                          .toFixed(1)} KB

                        {' · '}

                        {new Date(
                          record.created_at
                        ).toLocaleDateString()}

                      </p>

                      {record.description && (

                        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted">

                          {record.description}

                        </p>

                      )}

                    </div>

                    {/* Verification status */}

                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}>

                      <StatusIcon size={15} />

                      {status.label}

                    </span>

                  </div>

                  {/* Pending verification message */}

                  {record.status === 'pending' && (

                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">

                      <Clock
                        size={18}
                        className="shrink-0 text-amber-600"
                      />

                      <div>

                        <p className="text-sm font-semibold text-amber-700">

                          Awaiting verification

                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-amber-700">

                          Your evidence has been submitted
                          and is waiting for an authorized
                          reviewer to evaluate it.

                        </p>

                      </div>

                    </div>

                  )}

                  {/* Reviewer feedback */}

                  {review && (

                    <div className={`mt-4 rounded-xl border p-4 ${
                      review.decision === 'approved'
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}>

                      <div className="flex items-center gap-2">

                        {review.decision === 'approved'
                          ? (
                            <BadgeCheck
                              size={20}
                              className="text-green-700"
                            />
                          )
                          : (
                            <CircleX
                              size={20}
                              className="text-red-700"
                            />
                          )
                        }

                        <p className={`text-sm font-bold ${
                          review.decision === 'approved'
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}>

                          Reviewer feedback

                        </p>

                      </div>

                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed">

                        {review.feedback}

                      </p>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">

                        <p className="text-xs font-medium capitalize">

                          Decision: {review.decision}

                        </p>

                        <time
                          dateTime={review.created_at}
                          className="text-xs text-muted"
                        >

                          {new Date(
                            review.created_at
                          ).toLocaleDateString()}

                        </time>

                      </div>

                    </div>

                  )}

                  {/* Evidence actions */}

                  <div className="mt-5 flex flex-wrap items-center justify-end gap-3">

                    {/* View document */}

                    <button
                      type="button"
                      disabled={busy || loading}
                      onClick={() =>
                        void handleView(record)
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-brand-50 hover:text-primary disabled:opacity-50"
                    >

                      <Eye size={18} />

                      View document

                    </button>

                    {/* Submit for review */}

                    {record.status === 'draft' && (

                      <button
                        type="button"
                        disabled={busy || loading}
                        onClick={() =>
                          void handleSubmitForReview(record)
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >

                        <Send size={16} />

                        Submit for review

                      </button>

                    )}

                    {/* Delete draft document */}

                    {record.status === 'draft' && (

                      <button
                        type="button"
                        disabled={busy || loading}
                        onClick={() =>
                          void handleDelete(record)
                        }
                        aria-label={`Delete ${record.title}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >

                        <Trash2 size={18} />

                        Delete

                      </button>

                    )}

                  </div>

                </article>

              )
            })}

          </div>

        )}

      </section>

    </div>
  )
}