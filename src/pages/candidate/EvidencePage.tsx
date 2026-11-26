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
} from 'lucide-react'

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

import type {
  Evidence,
  EvidenceType,
} from '../../types/evidence'

import type {
  CandidateSkill,
} from '../../types/skills'

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

function EvidenceWorkspace({
  candidateId,
}: {
  candidateId: string
}) {

  const [records, setRecords] =
    useState<Evidence[]>([])

  const [skills, setSkills] =
    useState<CandidateSkill[]>([])

  const [loading, setLoading] = useState(true)

  const [busy, setBusy] = useState(false)

  const [formOpen, setFormOpen] =
    useState(false)

  const [title, setTitle] = useState('')

  const [description, setDescription] =
    useState('')

  const [skillId, setSkillId] = useState('')

  const [evidenceType, setEvidenceType] =
    useState<EvidenceType>('certificate')

  const [file, setFile] =
    useState<File | null>(null)

  const [error, setError] = useState('')

  const [message, setMessage] = useState('')

  const [preview, setPreview] = useState<{
    url: string
    title: string
  } | null>(null)

  useEffect(() => {
    let active = true

    Promise.all([
      getEvidence(candidateId),
      getCandidateSkills(candidateId),
    ])
      .then(([evidence, candidateSkills]) => {

        if (!active) return

        setRecords(evidence)
        setSkills(candidateSkills)

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

  }, [candidateId])

  const pendingCount = records.filter(
    (record) => record.status === 'pending'
  ).length

  const approvedCount = records.filter(
    (record) => record.status === 'approved'
  ).length

  function resetForm() {
    setTitle('')
    setDescription('')
    setSkillId('')
    setEvidenceType('certificate')
    setFile(null)
    setFormOpen(false)
  }

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

      setMessage(
        'Evidence uploaded successfully.'
      )

    } catch (err) {
      setError(getErrorMessage(err))

    } finally {
      setBusy(false)
    }
  }

  async function handleView(record: Evidence) {

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

  async function handleDelete(
    record: Evidence
  ) {

    if (busy) return

    if (
      !window.confirm(
        `Delete "${record.title}"?`
      )
    ) return

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

      <div>

        <h1 className="text-3xl font-extrabold">
          Evidence portfolio
        </h1>

        <p className="mt-2 text-muted">
          Support your professional skills
          with meaningful evidence.
        </p>

      </div>

      {/* Hero section */}

      <section className="rounded-2xl bg-primary-dark p-8 text-white">

        <FolderCheck
          size={44}
          className="mb-5 text-accent"
        />

        <h2 className="text-3xl font-bold">
          Turn your experience into evidence.
        </h2>

        <p className="mt-3 max-w-2xl text-white/70">
          Upload certificates, project samples
          and professional references to support
          your skills.
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
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-primary-dark disabled:opacity-50"
        >
          <UploadCloud size={20} />
          Upload evidence
        </button>

        {!loading && skills.length === 0 && (
          <p className="mt-3 text-sm text-accent">
            Add a professional skill before
            uploading evidence.
          </p>
        )}

      </section>

      {/* Statistics */}

      <div className="grid gap-4 sm:grid-cols-3">

        {[
          {
            label: 'Total evidence',
            value: records.length,
          },
          {
            label: 'Awaiting review',
            value: pendingCount,
          },
          {
            label: 'Approved evidence',
            value: approvedCount,
          },
        ].map((item) => (

          <article
            key={item.label}
            className="rounded-xl border border-border bg-white p-5"
          >

            <p className="text-sm text-muted">
              {item.label}
            </p>

            <p className="mt-2 text-3xl font-bold text-primary">
              {item.value}
            </p>

          </article>

        ))}

      </div>

      {/* Feedback messages */}

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

      {/* Temporary document link */}

      {preview && (

        <section className="rounded-xl border border-border bg-white p-5">

          <h3 className="font-bold">
            {preview.title}
          </h3>

          <p className="mt-2 text-sm text-muted">
            This document link expires
            60 seconds after creation.
          </p>

          <div className="mt-4 flex gap-4">

            <a
              href={preview.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary"
            >
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

        </section>

      )}

      {/* Upload form */}

      {formOpen && (

        <section className="rounded-2xl border border-border bg-white p-6">

          <h2 className="text-xl font-bold">
            Upload supporting evidence
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >

            <fieldset
              disabled={busy}
              className="space-y-5"
            >

              <label className="block text-sm font-medium">

                Evidence title

                <input
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="e.g. Front-End Development Certificate"
                  maxLength={150}
                  required
                  className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                />

              </label>

              <div className="grid gap-5 sm:grid-cols-2">

                <label className="block text-sm font-medium">

                  Evidence type

                  <select
                    value={evidenceType}
                    onChange={(e) =>
                      setEvidenceType(
                        e.target.value as EvidenceType
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
                    onChange={(e) =>
                      setSkillId(e.target.value)
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

              <label className="block text-sm font-medium">

                Description

                <textarea
                  rows={4}
                  maxLength={1000}
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Explain how this document supports your selected skill."
                  className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                />

              </label>

              {/* File selection */}

              <label className="block cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center hover:border-primary">

                <UploadCloud
                  size={38}
                  className="mx-auto text-primary"
                />

                <span className="mt-4 block font-semibold">

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
                  onChange={(e) => {

                    handleFileChange(
                      e.target.files?.[0] || null
                    )

                    e.target.value = ''

                  }}
                  className="mt-4 max-w-full text-sm"
                />

                {file && (
                  <span className="mt-3 block text-xs text-primary">

                    {(file.size / 1024 / 1024)
                      .toFixed(2)} MB selected

                  </span>
                )}

              </label>

              <p className="text-xs text-muted">
                Upload only documents you are
                authorized to share. Avoid unnecessary
                personal identifiers or sensitive
                information.
              </p>

            </fieldset>

            <div className="flex justify-end gap-3">

              <button
                type="button"
                disabled={busy}
                onClick={resetForm}
                className="rounded-lg border border-border px-5 py-3"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={busy || !file}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white disabled:opacity-50"
              >

                {busy && (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
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

        ) : records.length === 0 ? (

          <div className="py-12 text-center">

            <FolderCheck
              size={44}
              className="mx-auto text-muted"
            />

            <h3 className="mt-4 font-semibold">
              No evidence uploaded yet
            </h3>

            <p className="mt-2 text-sm text-muted">
              Add your first supporting document.
            </p>

          </div>

        ) : (

          <div className="mt-5 divide-y divide-border">

            {records.map((record) => {

              const linkedSkill = skills.find(
                (skill) =>
                  skill.id ===
                  record.candidate_skill_id
              )

              return (

                <article
                  key={record.id}
                  className="flex flex-wrap items-start gap-4 py-5"
                >

                  <div className="rounded-xl bg-brand-50 p-3 text-primary">

                    <FileText size={26} />

                  </div>

                  <div className="min-w-0 flex-1">

                    <h3 className="break-words font-bold">
                      {record.title}
                    </h3>

                    <p className="mt-1 break-words text-sm text-muted">
                      {record.file_name}
                    </p>

                    <p className="mt-2 text-xs text-primary">

                      Linked skill: {
                        linkedSkill?.skills.name
                        || 'Unavailable'
                      }

                    </p>

                    <p className="mt-1 text-xs text-muted">

                      {(record.file_size / 1024)
                        .toFixed(1)} KB

                    </p>

                    {record.description && (

                      <p className="mt-3 break-words text-sm text-muted">
                        {record.description}
                      </p>

                    )}

                  </div>

                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">

                    {record.status === 'approved' && (
                      <BadgeCheck size={15} />
                    )}

                    {record.status}

                  </span>

                  <div className="flex gap-2">

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void handleView(record)
                      }
                      aria-label={`View ${record.title}`}
                      className="rounded-lg p-2 hover:bg-brand-50 hover:text-primary"
                    >

                      <Eye size={20} />

                    </button>

                    {record.status === 'draft' && (

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void handleDelete(record)
                        }
                        aria-label={`Delete ${record.title}`}
                        className="rounded-lg p-2 hover:bg-red-50 hover:text-red-600"
                      >

                        <Trash2 size={20} />

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