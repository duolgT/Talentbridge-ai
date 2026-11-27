import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  ArrowLeft,
  LoaderCircle,
  CircleAlert,
  BriefcaseBusiness,
} from 'lucide-react'

import { useAuthStore } from '../../store/authStore'

import OpportunityForm from '../../features/opportunities/OpportunityForm'

import { getSkills } from '../../services/skillService'

import {
  getEmployerOpportunity,
  saveOpportunityDraft,
} from '../../services/employerService'

import type { Skill } from '../../types/skills'

import type {
  Opportunity,
} from '../../types/opportunity'

import type {
  OpportunityInput,
  OpportunitySkillInput,
} from '../../types/employer'

function getErrorMessage(error: unknown): string {

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    return String(error.message)
  }

  return 'Unable to load opportunity information.'
}

export default function CreateOpportunityPage() {

  const profile = useAuthStore(
    (state) => state.profile
  )

  const { id } = useParams<{ id: string }>()

  if (!profile) return null

  return (

    <OpportunityEditor
      key={`${profile.id}:${id ?? 'new'}`}
      employerId={profile.id}
      opportunityId={id ?? null}
    />

  )
}

function OpportunityEditor({
  employerId,
  opportunityId,
}: {
  employerId: string
  opportunityId: string | null
}) {

  const navigate = useNavigate()

  const editing = opportunityId !== null

  const [catalogue, setCatalogue] =
    useState<Skill[]>([])

  const [opportunity, setOpportunity] =
    useState<Opportunity | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [busy, setBusy] =
    useState(false)

  const [error, setError] =
    useState('')

  const [reloadKey, setReloadKey] =
    useState(0)

  // Load catalogue and existing draft

  useEffect(() => {

    let active = true

    Promise.all([

      getSkills(),

      opportunityId

        ? getEmployerOpportunity(
            employerId,
            opportunityId
          )

        : Promise.resolve(null),

    ])
      .then(([skills, existing]) => {

        if (!active) return

        if (
          existing &&
          (
            existing.status !== 'draft' ||
            existing.is_demo
          )
        ) {

          throw new Error(
            'Only non-demo draft opportunities can be edited.'
          )

        }

        setCatalogue(skills)

        setOpportunity(existing)

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

  }, [employerId, opportunityId, reloadKey])

  function retryLoading() {

    setError('')

    setLoading(true)

    setReloadKey(
      (previous) => previous + 1
    )

  }

  // Save or publish opportunity

  async function handleSave(
    input: OpportunityInput,
    skills: OpportunitySkillInput[],
    publish: boolean
  ) {

    if (busy) return

    setBusy(true)

    try {

      await saveOpportunityDraft(
        opportunityId,
        input,
        skills,
        publish
      )

      navigate(
        '/employer/opportunities',
        {
          replace: true,
          state: {
            message: publish

              ? 'Opportunity published successfully.'

              : editing

                ? 'Draft updated successfully.'

                : 'Draft created successfully.',
          },
        }
      )

    } finally {

      setBusy(false)

    }

  }

  return (

    <div className="mx-auto max-w-5xl space-y-6">

      {/* Back navigation */}

      <Link
        to="/employer/opportunities"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#16826B]"
      >

        <ArrowLeft size={18} />

        Back to opportunities

      </Link>

      {/* Heading */}

      <div className="flex items-start gap-4">

        <div className="rounded-2xl bg-[#123C35] p-4 text-[#D5F76A]">

          <BriefcaseBusiness size={28} />

        </div>

        <div>

          <h1 className="text-3xl font-extrabold text-[#123C35]">

            {editing

              ? 'Edit opportunity'

              : 'Create opportunity'

            }

          </h1>

          <p className="mt-2 text-sm leading-relaxed text-slate-500">

            {editing

              ? 'Update the details and competencies of your draft listing.'

              : 'Connect skilled professionals to employment, freelance and training opportunities.'

            }

          </p>

        </div>

      </div>

      {/* Loading state */}

      {loading ? (

        <div
          role="status"
          className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-20"
        >

          <LoaderCircle
            size={38}
            className="animate-spin text-[#16826B]"
          />

          <p className="mt-4 text-sm text-slate-500">

            Loading opportunity editor...

          </p>

        </div>

      ) : error ? (

        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"
        >

          <CircleAlert size={28} />

          <h2 className="mt-3 font-bold">

            Unable to open opportunity editor

          </h2>

          <p className="mt-2 text-sm">

            {error}

          </p>

          <button
            type="button"
            onClick={retryLoading}
            className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold"
          >

            Try again

          </button>

        </div>

      ) : (

        <OpportunityForm
          catalogue={catalogue}
          initialOpportunity={
            opportunity ?? undefined
          }
          busy={busy}
          onSubmit={handleSave}
          onCancel={() =>
            navigate('/employer/opportunities')
          }
        />

      )}

    </div>

  )
}