import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  Plus,
  Pencil,
  Trash2,
  BriefcaseBusiness,
  GraduationCap,
  LoaderCircle,
} from 'lucide-react'

import {
  getHistory,
  createHistory,
  updateHistory,
  deleteHistory,
} from '../../services/historyService'

import type {
  HistoryKind,
  HistoryRecord,
} from '../../types/professional'

interface HistorySectionProps {
  kind: HistoryKind
  candidateId: string
}

interface Field {
  name: string
  label: string
  type?: string
  required?: boolean
}

const experienceFields: Field[] = [
  {
    name: 'job_title',
    label: 'Job title',
    required: true,
  },
  {
    name: 'organization',
    label: 'Organization',
    required: true,
  },
  {
    name: 'location',
    label: 'Location',
  },
  {
    name: 'start_date',
    label: 'Start date',
    type: 'date',
    required: true,
  },
  {
    name: 'end_date',
    label: 'End date',
    type: 'date',
  },
]

const educationFields: Field[] = [
  {
    name: 'institution',
    label: 'Institution',
    required: true,
  },
  {
    name: 'qualification',
    label: 'Qualification',
    required: true,
  },
  {
    name: 'field_of_study',
    label: 'Field of study',
  },
  {
    name: 'country',
    label: 'Country',
  },
  {
    name: 'start_year',
    label: 'Start year',
    type: 'number',
  },
  {
    name: 'graduation_year',
    label: 'Graduation year',
    type: 'number',
  },
]

type FormValues = Record<string, string>

export default function HistorySection({
  kind,
  candidateId,
}: HistorySectionProps) {

  const isExperience = kind === 'experiences'

  const fields = isExperience
    ? experienceFields
    : educationFields

  const Icon = isExperience
    ? BriefcaseBusiness
    : GraduationCap

  const title = isExperience
    ? 'Work experience'
    : 'Education and qualifications'

  const itemName = isExperience
    ? 'experience'
    : 'education'

  const [records, setRecords] =
    useState<HistoryRecord[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formOpen, setFormOpen] = useState(false)

  const [editingId, setEditingId] =
    useState<string | null>(null)

  const [form, setForm] = useState<FormValues>({})
  const [isCurrent, setIsCurrent] = useState(false)

  const [reloadKey, setReloadKey] = useState(0)

  // Load existing records

  useEffect(() => {
    let active = true

    getHistory(kind, candidateId)
      .then((data) => {
        if (active) {
          setRecords(data)
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load records.'
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
  }, [kind, candidateId, reloadKey])

  function handleChange(
    name: string,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    setError('')
    setSuccess('')
  }

  function openCreateForm() {
    setEditingId(null)

    setForm({
      employment_type: 'full-time',
    })

    setIsCurrent(false)
    setError('')
    setSuccess('')
    setFormOpen(true)
  }

  function openEditForm(
    record: HistoryRecord
  ) {
    const values: FormValues = {}

    Object.entries(record).forEach(
      ([key, value]) => {
        values[key] = String(value ?? '')
      }
    )

    setForm(values)
    setEditingId(record.id)
    setIsCurrent(record.is_current)
    setError('')
    setSuccess('')
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
    setForm({})
    setIsCurrent(false)
    setError('')
  }

  // CREATE and UPDATE

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (saving) return

    setError('')
    setSuccess('')

    for (const field of fields) {
      if (
        field.required &&
        !form[field.name]?.trim()
      ) {
        setError(`${field.label} is required.`)
        return
      }
    }

    if (
      isExperience &&
      !isCurrent &&
      form.end_date &&
      form.end_date < form.start_date
    ) {
      setError(
        'End date cannot be before start date.'
      )
      return
    }

    if (
      !isExperience &&
      !isCurrent &&
      form.start_year &&
      form.graduation_year &&
      Number(form.graduation_year) <
        Number(form.start_year)
    ) {
      setError(
        'Graduation year cannot be before start year.'
      )
      return
    }

    const input = isExperience
      ? {
          job_title: form.job_title.trim(),
          organization: form.organization.trim(),
          location: form.location?.trim() || null,

          employment_type:
            form.employment_type || 'full-time',

          start_date: form.start_date,

          end_date: isCurrent
            ? null
            : form.end_date || null,

          is_current: isCurrent,

          description:
            form.description?.trim() || null,
        }
      : {
          institution: form.institution.trim(),

          qualification:
            form.qualification.trim(),

          field_of_study:
            form.field_of_study?.trim() || null,

          country: form.country?.trim() || null,

          start_year: form.start_year
            ? Number(form.start_year)
            : null,

          graduation_year: isCurrent
            ? null
            : form.graduation_year
              ? Number(form.graduation_year)
              : null,

          is_current: isCurrent,

          description:
            form.description?.trim() || null,
        }

    try {
      setSaving(true)

      if (editingId) {
        await updateHistory(
          kind,
          candidateId,
          editingId,
          input
        )
      } else {
        await createHistory(
          kind,
          candidateId,
          input
        )
      }

      setSuccess(
        editingId
          ? 'Record updated successfully.'
          : 'Record added successfully.'
      )

      closeForm()

      setLoading(true)
      setReloadKey((value) => value + 1)

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save record.'
      )

    } finally {
      setSaving(false)
    }
  }

  // DELETE

  async function handleDelete(id: string) {

    if (saving) return

    const confirmed = window.confirm(
      'Are you sure you want to delete this record?'
    )

    if (!confirmed) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await deleteHistory(
        kind,
        candidateId,
        id
      )

      setRecords((previous) =>
        previous.filter(
          (record) => record.id !== id
        )
      )

      if (editingId === id) {
        closeForm()
      }

      setSuccess('Record deleted successfully.')

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete record.'
      )

    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-white p-6 sm:p-8">

      {/* Section heading */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-brand-50 p-3 text-primary">
            <Icon size={24} />
          </div>

          <div>
            <h2 className="text-xl font-bold">
              {title}
            </h2>

            <p className="text-sm text-muted">
              {records.length} records
            </p>
          </div>

        </div>

        <button
          type="button"
          disabled={saving || loading}
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Plus size={18} />
          Add {itemName}
        </button>

      </div>

      {/* Feedback messages */}

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      {/* Create and edit form */}

      {formOpen && (

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-xl border border-border bg-surface p-5"
        >

          <h3 className="mb-5 text-lg font-bold">
            {editingId ? 'Edit' : 'Add'} {itemName}
          </h3>

          <fieldset
            disabled={saving}
            className="space-y-5"
          >

            <div className="grid gap-5 sm:grid-cols-2">

              {fields.map((field) => {

                const disabled =
                  isCurrent &&
                  (
                    field.name === 'end_date' ||
                    field.name === 'graduation_year'
                  )

                return (
                  <label
                    key={field.name}
                    className="block text-sm font-medium"
                  >
                    {field.label}

                    <input
                      type={field.type || 'text'}
                      value={
                        disabled
                          ? ''
                          : form[field.name] || ''
                      }
                      onChange={(e) =>
                        handleChange(
                          field.name,
                          e.target.value
                        )
                      }
                      required={field.required}
                      disabled={disabled}
                      min={
                        field.type === 'number'
                          ? 1900
                          : undefined
                      }
                      max={
                        field.type === 'number'
                          ? new Date().getFullYear() + 10
                          : undefined
                      }
                      className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 disabled:opacity-50"
                    />

                  </label>
                )
              })}

              {isExperience && (

                <label className="block text-sm font-medium">
                  Employment type

                  <select
                    value={
                      form.employment_type ||
                      'full-time'
                    }
                    onChange={(e) =>
                      handleChange(
                        'employment_type',
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3"
                  >
                    <option value="full-time">
                      Full-time
                    </option>
                    <option value="part-time">
                      Part-time
                    </option>
                    <option value="freelance">
                      Freelance
                    </option>
                    <option value="internship">
                      Internship
                    </option>
                    <option value="volunteer">
                      Volunteer
                    </option>
                    <option value="contract">
                      Contract
                    </option>
                    <option value="self-employed">
                      Self-employed
                    </option>
                  </select>

                </label>

              )}

            </div>

            <label className="flex items-center gap-3 text-sm">

              <input
                type="checkbox"
                checked={isCurrent}
                onChange={(e) =>
                  setIsCurrent(e.target.checked)
                }
                className="h-4 w-4 accent-primary"
              />

              {isExperience
                ? 'I currently work here'
                : 'I am currently studying here'}

            </label>

            <label className="block text-sm font-medium">
              Description

              <textarea
                rows={4}
                maxLength={2000}
                value={form.description || ''}
                onChange={(e) =>
                  handleChange(
                    'description',
                    e.target.value
                  )
                }
                placeholder={
                  isExperience
                    ? 'Describe your responsibilities and achievements.'
                    : 'Describe your studies and qualifications.'
                }
                className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3"
              />

            </label>

          </fieldset>

          <div className="mt-5 flex justify-end gap-3">

            <button
              type="button"
              disabled={saving}
              onClick={closeForm}
              className="rounded-lg border border-border px-4 py-3 text-sm font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving && (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              )}

              {saving
                ? 'Saving...'
                : 'Save record'}

            </button>

          </div>

        </form>
      )}

      {/* Loading state */}

      {loading ? (

        <div
          role="status"
          className="flex justify-center py-10"
        >
          <LoaderCircle
            size={28}
            className="animate-spin text-primary"
          />

          <span className="sr-only">
            Loading records
          </span>
        </div>

      ) : records.length === 0 ? (

        <div className="mt-6 rounded-xl border border-dashed border-border py-10 text-center">

          <Icon
            size={36}
            className="mx-auto text-muted"
          />

          <h3 className="mt-4 font-semibold">
            No records added yet
          </h3>

          <p className="mt-2 text-sm text-muted">
            Add your first {itemName} record.
          </p>

        </div>

      ) : (

        <div className="mt-6 divide-y divide-border">

          {records.map((record) => {

            const experience =
              'job_title' in record

            const recordTitle = experience
              ? record.job_title
              : record.qualification

            const organization = experience
              ? record.organization
              : record.institution

            const start = experience
              ? record.start_date
              : record.start_year

            const end = experience
              ? record.end_date
              : record.graduation_year

            return (

              <article
                key={record.id}
                className="flex flex-wrap items-start gap-4 py-5"
              >

                <div className="rounded-xl bg-brand-50 p-3 text-primary">
                  <Icon size={24} />
                </div>

                <div className="min-w-0 flex-1">

                  <h3 className="break-words font-bold">
                    {recordTitle}
                  </h3>

                  <p className="mt-1 text-sm font-medium text-primary">
                    {organization}
                  </p>

                  <p className="mt-1 text-xs text-muted">

                    {start || 'Not specified'}

                    {' — '}

                    {record.is_current
                      ? 'Present'
                      : end || 'Not specified'}

                  </p>

                  {record.description && (
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm text-muted">
                      {record.description}
                    </p>
                  )}

                </div>

                <div className="flex gap-2">

                  <button
                    type="button"
                    disabled={saving || loading}
                    aria-label={`Edit ${recordTitle}`}
                    onClick={() =>
                      openEditForm(record)
                    }
                    className="rounded-lg p-2 text-muted hover:bg-brand-50 hover:text-primary"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    type="button"
                    disabled={saving || loading}
                    aria-label={`Delete ${recordTitle}`}
                    onClick={() =>
                      void handleDelete(record.id)
                    }
                    className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>

                </div>

              </article>
            )
          })}

        </div>

      )}

    </section>
  )
}