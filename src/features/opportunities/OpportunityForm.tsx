import {
  useState,
  type FormEvent,
} from 'react'

import {
  BriefcaseBusiness,
  Building2,
  Search,
  Plus,
  X,
  Save,
  Globe,
  LoaderCircle,
  CircleAlert,
  ListChecks,
  Info,
} from 'lucide-react'

import type { Skill } from '../../types/skills'

import type {
  Opportunity,
  OpportunityType,
  WorkMode,
} from '../../types/opportunity'

import type {
  OpportunityInput,
  OpportunitySkillInput,
} from '../../types/employer'

import {
  isDeadlinePassed,
} from '../../utils/opportunityUtils'

interface OpportunityFormProps {
  catalogue: Skill[]
  initialOpportunity?: Opportunity
  busy?: boolean

  onSubmit: (
    input: OpportunityInput,
    skills: OpportunitySkillInput[],
    publish: boolean
  ) => Promise<void>

  onCancel: () => void
}

interface FormValues {
  title: string
  organization: string
  description: string
  location: string
  opportunity_type: OpportunityType
  work_mode: WorkMode
  compensation: string
  deadline: string
}

const fieldClass =
  'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#16826B] focus:ring-2 focus:ring-emerald-100 disabled:opacity-60'

const labelClass =
  'block text-sm font-semibold text-[#123C35]'

export default function OpportunityForm({
  catalogue,
  initialOpportunity,
  busy = false,
  onSubmit,
  onCancel,
}: OpportunityFormProps) {

  // Form initialization

  const [values, setValues] =
    useState<FormValues>(() => ({

      title: initialOpportunity?.title ?? '',

      organization:
        initialOpportunity?.organization ?? '',

      description:
        initialOpportunity?.description ?? '',

      location:
        initialOpportunity?.location ?? '',

      opportunity_type:
        initialOpportunity?.opportunity_type ??
        'employment',

      work_mode:
        initialOpportunity?.work_mode ?? 'onsite',

      compensation:
        initialOpportunity?.compensation ?? '',

      deadline:
        initialOpportunity?.deadline ?? '',

    }))

  const [selectedSkills, setSelectedSkills] =
    useState<OpportunitySkillInput[]>(() =>

      initialOpportunity?.opportunity_skills.map(
        (item) => ({
          skill_id: item.skill_id,
          is_required: item.is_required,
        })
      ) ?? []

    )

  const [skillSearch, setSkillSearch] =
    useState('')

  const [categoryFilter, setCategoryFilter] =
    useState('all')

  const [validationError, setValidationError] =
    useState('')

  const [pendingAction, setPendingAction] =
    useState<'draft' | 'publish' | null>(null)

  // Derived state

  const catalogueMap = new Map(
    catalogue.map((skill) => [
      skill.id,
      skill,
    ])
  )

  const selectedIds = new Set(
    selectedSkills.map(
      (item) => item.skill_id
    )
  )

  const categories = [
    ...new Set(
      catalogue.map((skill) => skill.category)
    ),
  ].sort()

  const requiredCount =
    selectedSkills.filter(
      (item) => item.is_required
    ).length

  const preferredCount =
    selectedSkills.length - requiredCount

  const normalizedSearch =
    skillSearch.trim().toLowerCase()

  const availableSkills = catalogue.filter(
    (skill) => {

      if (selectedIds.has(skill.id)) {
        return false
      }

      if (
        categoryFilter !== 'all' &&
        skill.category !== categoryFilter
      ) {
        return false
      }

      return (
        skill.name.toLowerCase()
          .includes(normalizedSearch) ||

        skill.category.toLowerCase()
          .includes(normalizedSearch)
      )
    }
  )

  // Update individual form fields

  function updateField<K extends keyof FormValues>(
    key: K,
    value: FormValues[K]
  ) {

    setValues((previous) => ({
      ...previous,
      [key]: value,
    }))

    setValidationError('')
  }

  // Add competency

  function addSkill(skillId: string) {

    if (
      busy ||
      selectedIds.has(skillId) ||
      selectedSkills.length >= 50
    ) {
      return
    }

    setSelectedSkills((previous) => [

      ...previous,

      {
        skill_id: skillId,
        is_required: true,
      },

    ])

    setValidationError('')
  }

  // Remove competency

  function removeSkill(skillId: string) {

    setSelectedSkills((previous) =>
      previous.filter(
        (item) => item.skill_id !== skillId
      )
    )
  }

  // Change required/preferred classification

  function updateSkillRequirement(
    skillId: string,
    isRequired: boolean
  ) {

    setSelectedSkills((previous) =>

      previous.map((item) =>

        item.skill_id === skillId

          ? {
              ...item,
              is_required: isRequired,
            }

          : item

      )

    )

    setValidationError('')
  }

  // Form validation

  function validateForm(
    publish: boolean
  ): string | null {

    if (values.title.trim().length < 3) {
      return 'Enter an opportunity title of at least 3 characters.'
    }

    if (values.organization.trim().length < 2) {
      return 'Enter the organization name.'
    }

    if (values.description.trim().length < 20) {
      return 'Provide a description of at least 20 characters.'
    }

    if (selectedSkills.length > 50) {
      return 'Select no more than 50 competencies.'
    }

    if (publish && requiredCount === 0) {
      return 'Add at least one required competency before publishing.'
    }

    if (
      publish &&
      isDeadlinePassed(values.deadline || null)
    ) {
      return 'The application deadline has already passed.'
    }

    return null
  }

  // Save or publish

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault()

    if (busy || pendingAction) return

    const nativeEvent =
      event.nativeEvent as SubmitEvent

    const submitter =
      nativeEvent.submitter as HTMLButtonElement | null

    const publish =
      submitter?.value === 'publish'

    setValidationError('')

    const error = validateForm(publish)

    if (error) {
      setValidationError(error)
      return
    }

    if (
      publish &&
      !window.confirm(
        'Publish this opportunity? Candidates will be able to discover it and submit applications. Published listings cannot be edited in this version.'
      )
    ) {
      return
    }

    const input: OpportunityInput = {

      title: values.title.trim(),

      organization:
        values.organization.trim(),

      description:
        values.description.trim(),

      location:
        values.location.trim() || null,

      opportunity_type:
        values.opportunity_type,

      work_mode:
        values.work_mode,

      compensation:
        values.compensation.trim() || null,

      deadline:
        values.deadline || null,

    }

    setPendingAction(
      publish ? 'publish' : 'draft'
    )

    try {

      await onSubmit(
        input,
        selectedSkills,
        publish
      )

    } catch (err) {

      setValidationError(

        typeof err === 'object' &&
        err !== null &&
        'message' in err

          ? String(err.message)

          : 'Unable to save the opportunity.'

      )

    } finally {

      setPendingAction(null)

    }
  }

  const disabled = busy || pendingAction !== null

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      {/* Validation errors */}

      {validationError && (

        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        >

          <CircleAlert
            size={20}
            className="shrink-0"
          />

          <p className="text-sm">

            {validationError}

          </p>

        </div>

      )}

      {/* Basic information */}

      <fieldset
        disabled={disabled}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >

        <div className="flex items-center gap-4">

          <div className="rounded-xl bg-[#EAF3EE] p-3 text-[#16826B]">

            <BriefcaseBusiness size={24} />

          </div>

          <div>

            <h2 className="text-lg font-bold text-[#123C35]">

              Opportunity information

            </h2>

            <p className="mt-1 text-sm text-slate-500">

              Provide clear and accurate listing details.

            </p>

          </div>

        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">

          <label className={labelClass}>

            Opportunity title *

            <input
              type="text"
              required
              minLength={3}
              maxLength={150}
              value={values.title}
              onChange={(event) =>
                updateField(
                  'title',
                  event.target.value
                )
              }
              placeholder="e.g. Junior Front-End Developer"
              className={fieldClass}
            />

          </label>

          <label className={labelClass}>

            Organization *

            <input
              type="text"
              required
              minLength={2}
              maxLength={150}
              value={values.organization}
              onChange={(event) =>
                updateField(
                  'organization',
                  event.target.value
                )
              }
              placeholder="Organization name"
              className={fieldClass}
            />

          </label>

          <label className={labelClass}>

            Opportunity type *

            <select
              value={values.opportunity_type}
              onChange={(event) =>
                updateField(
                  'opportunity_type',
                  event.target.value as OpportunityType
                )
              }
              className={fieldClass}
            >

              <option value="employment">
                Employment
              </option>

              <option value="freelance">
                Freelance
              </option>

              <option value="internship">
                Internship
              </option>

              <option value="training">
                Training
              </option>

              <option value="volunteer">
                Volunteer
              </option>

            </select>

          </label>

          <label className={labelClass}>

            Work arrangement *

            <select
              value={values.work_mode}
              onChange={(event) =>
                updateField(
                  'work_mode',
                  event.target.value as WorkMode
                )
              }
              className={fieldClass}
            >

              <option value="onsite">
                On-site
              </option>

              <option value="remote">
                Remote
              </option>

              <option value="hybrid">
                Hybrid
              </option>

            </select>

          </label>

          <label className={labelClass}>

            Location

            <input
              type="text"
              maxLength={200}
              value={values.location}
              onChange={(event) =>
                updateField(
                  'location',
                  event.target.value
                )
              }
              placeholder="e.g. Kakuma, Kenya"
              className={fieldClass}
            />

          </label>

          <label className={labelClass}>

            Compensation

            <input
              type="text"
              maxLength={200}
              value={values.compensation}
              onChange={(event) =>
                updateField(
                  'compensation',
                  event.target.value
                )
              }
              placeholder="e.g. KES 30,000 per month"
              className={fieldClass}
            />

          </label>

          <label className={labelClass}>

            Application deadline

            <input
              type="date"
              value={values.deadline}
              onChange={(event) =>
                updateField(
                  'deadline',
                  event.target.value
                )
              }
              className={fieldClass}
            />

          </label>

        </div>

        <label className={`${labelClass} mt-6`}>

          Opportunity description *

          <textarea
            rows={8}
            required
            minLength={20}
            maxLength={10000}
            value={values.description}
            onChange={(event) =>
              updateField(
                'description',
                event.target.value
              )
            }
            placeholder="Describe the role, responsibilities, qualifications, working conditions and any legitimate eligibility requirements..."
            className={fieldClass}
          />

        </label>

        <p className="mt-2 text-right text-xs text-slate-500">

          {values.description.length}/10000

        </p>

      </fieldset>

      {/* Selected competencies */}

      <fieldset
        disabled={disabled}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >

        <div className="flex items-center gap-4">

          <div className="rounded-xl bg-[#EAF3EE] p-3 text-[#16826B]">

            <ListChecks size={24} />

          </div>

          <div>

            <h2 className="text-lg font-bold text-[#123C35]">

              Professional competencies

            </h2>

            <p className="mt-1 text-sm text-slate-500">

              Define the required and preferred skills.

            </p>

          </div>

        </div>

        {/* Competency statistics */}

        <div className="mt-6 grid grid-cols-3 gap-3">

          {[

            {
              label: 'Selected',
              value: selectedSkills.length,
            },

            {
              label: 'Required',
              value: requiredCount,
            },

            {
              label: 'Preferred',
              value: preferredCount,
            },

          ].map((item) => (

            <div
              key={item.label}
              className="rounded-xl bg-[#F6F8F5] p-4 text-center"
            >

              <p className="text-2xl font-extrabold text-[#123C35]">

                {item.value}

              </p>

              <p className="mt-1 text-xs text-slate-500">

                {item.label}

              </p>

            </div>

          ))}

        </div>

        {/* Selected skills */}

        <div className="mt-6">

          <h3 className="font-semibold text-[#123C35]">

            Selected competencies

          </h3>

          {selectedSkills.length === 0 ? (

            <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">

              No competencies selected yet.
              Add skills from the catalogue below.

            </div>

          ) : (

            <div className="mt-4 divide-y divide-slate-100">

              {selectedSkills.map((item) => {

                const skill =
                  catalogueMap.get(item.skill_id)

                return (

                  <div
                    key={item.skill_id}
                    className="flex flex-wrap items-center gap-3 py-4"
                  >

                    <div className="min-w-0 flex-1">

                      <p className="font-semibold text-[#123C35]">

                        {skill?.name ?? 'Unknown skill'}

                      </p>

                      <p className="mt-1 text-xs text-slate-500">

                        {skill?.category ?? ''}

                      </p>

                    </div>

                    <select
                      aria-label={`Requirement for ${skill?.name ?? 'skill'}`}
                      value={
                        item.is_required
                          ? 'required'
                          : 'preferred'
                      }
                      onChange={(event) =>
                        updateSkillRequirement(
                          item.skill_id,
                          event.target.value === 'required'
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    >

                      <option value="required">
                        Required
                      </option>

                      <option value="preferred">
                        Preferred
                      </option>

                    </select>

                    <button
                      type="button"
                      aria-label={`Remove ${skill?.name ?? 'skill'}`}
                      onClick={() =>
                        removeSkill(item.skill_id)
                      }
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    >

                      <X size={18} />

                    </button>

                  </div>

                )

              })}

            </div>

          )}

        </div>

        {/* Search catalogue */}

        <div className="mt-7 border-t border-slate-100 pt-6">

          <h3 className="font-semibold text-[#123C35]">

            Browse skills catalogue

          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                aria-label="Search skills catalogue"
                value={skillSearch}
                onChange={(event) =>
                  setSkillSearch(event.target.value)
                }
                placeholder="Search skills..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm"
              />

            </div>

            <select
              aria-label="Filter skills by category"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >

              <option value="all">
                All categories
              </option>

              {categories.map((category) => (

                <option
                  key={category}
                  value={category}
                >

                  {category}

                </option>

              ))}

            </select>

          </div>

          <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">

            {availableSkills.length === 0 ? (

              <p className="p-5 text-center text-sm text-slate-500">

                No additional skills match your search.

              </p>

            ) : (

              availableSkills.map((skill) => (

                <div
                  key={skill.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                >

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-semibold text-[#123C35]">

                      {skill.name}

                    </p>

                    <p className="mt-1 text-xs text-slate-500">

                      {skill.category}

                    </p>

                  </div>

                  <button
                    type="button"
                    disabled={selectedSkills.length >= 50}
                    onClick={() => addSkill(skill.id)}
                    aria-label={`Add ${skill.name}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#EAF3EE] px-3 py-2 text-xs font-semibold text-[#16826B] hover:bg-emerald-100 disabled:opacity-50"
                  >

                    <Plus size={16} />

                    Add

                  </button>

                </div>

              ))

            )}

          </div>

        </div>

      </fieldset>

      {/* Publication guidance */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-4">

          <div className="rounded-xl bg-[#EAF3EE] p-3 text-[#16826B]">

            <Building2 size={24} />

          </div>

          <div>

            <h2 className="text-lg font-bold text-[#123C35]">

              Save or publish

            </h2>

            <p className="mt-1 text-sm text-slate-500">

              Choose how to complete this listing.

            </p>

          </div>

        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          <div className="rounded-xl border border-slate-200 p-4">

            <Save
              size={22}
              className="text-[#16826B]"
            />

            <h3 className="mt-3 font-semibold text-[#123C35]">

              Save as draft

            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">

              Keep this opportunity private and
              continue editing it later.

            </p>

          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">

            <Globe
              size={22}
              className="text-[#16826B]"
            />

            <h3 className="mt-3 font-semibold text-[#123C35]">

              Publish opportunity

            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-600">

              Make the opportunity discoverable
              to registered candidates.

            </p>

          </div>

        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#F6F8F5] p-4">

          <Info
            size={18}
            className="shrink-0 text-[#16826B]"
          />

          <p className="text-xs leading-relaxed text-slate-600">

            Publish only genuine opportunities.
            Ensure the requirements are relevant
            to the role and avoid discriminatory
            selection criteria.

            Published listings cannot be edited
            in the current version.

          </p>

        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">

          <button
            type="button"
            disabled={disabled}
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 disabled:opacity-50"
          >

            Cancel

          </button>

          <button
            type="submit"
            name="action"
            value="draft"
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-xl border border-[#16826B] px-5 py-3 text-sm font-semibold text-[#16826B] disabled:opacity-50"
          >

            {pendingAction === 'draft'

              ? <LoaderCircle
                  size={17}
                  className="animate-spin"
                />

              : <Save size={17} />

            }

            {pendingAction === 'draft'
              ? 'Saving...'
              : 'Save draft'}

          </button>

          <button
            type="submit"
            name="action"
            value="publish"
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-xl bg-[#16826B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#123C35] disabled:opacity-50"
          >

            {pendingAction === 'publish'

              ? <LoaderCircle
                  size={17}
                  className="animate-spin"
                />

              : <Globe size={17} />

            }

            {pendingAction === 'publish'
              ? 'Publishing...'
              : 'Publish opportunity'}

          </button>

        </div>

      </section>

    </form>

  )
}