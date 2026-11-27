import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import { Link } from 'react-router-dom'

import {
  BriefcaseBusiness,
  Bookmark,
  Send,
  Search,
  SlidersHorizontal,
  RefreshCw,
  LoaderCircle,
  BadgeCheck,
  ArrowLeft,
  MapPin,
  CalendarDays,
  Building2,
  CheckCircle2,
  CircleAlert,
  Info,
} from 'lucide-react'

import { useAuthStore } from '../../store/authStore'

import OpportunityCard from '../../features/opportunities/OpportunityCard'
import { isDeadlinePassed } from '../../utils/opportunityUtils'

import {
  getCandidateSkills,
} from '../../services/skillService'

import {
  getOpportunities,
  getSavedOpportunities,
  saveOpportunity,
  unsaveOpportunity,
  getApplications,
  applyForOpportunity,
} from '../../services/opportunityService'

import {
  matchOpportunities,
} from '../../utils/matchingEngine'

import type {
  CandidateSkill,
} from '../../types/skills'

import type {
  Opportunity,
  OpportunityType,
  WorkMode,
  Application,
} from '../../types/opportunity'

// View and filter types

type ActiveTab =
  | 'discover'
  | 'saved'
  | 'applications'

type SortMode =
  | 'match'
  | 'newest'
  | 'title'

// Error handling

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

// Main page

export default function OpportunitiesPage() {

  const profile = useAuthStore(
    (state) => state.profile
  )

  if (!profile) return null

  return (

    <OpportunitiesWorkspace
      key={profile.id}
      candidateId={profile.id}
    />

  )
}

// Opportunities workspace

function OpportunitiesWorkspace({
  candidateId,
}: {
  candidateId: string
}) {

  // Database state

  const [opportunities, setOpportunities] =
    useState<Opportunity[]>([])

  const [candidateSkills, setCandidateSkills] =
    useState<CandidateSkill[]>([])

  const [savedIds, setSavedIds] =
    useState<string[]>([])

  const [applications, setApplications] =
    useState<Application[]>([])

  // Interface state

  const [activeTab, setActiveTab] =
    useState<ActiveTab>('discover')

  const [loading, setLoading] =
    useState(true)

  const [busy, setBusy] =
    useState(false)

  const [reloadKey, setReloadKey] =
    useState(0)

  const [error, setError] =
    useState('')

  const [message, setMessage] =
    useState('')

  // Search and filters

  const [search, setSearch] =
    useState('')

  const [typeFilter, setTypeFilter] =
    useState<OpportunityType | 'all'>('all')

  const [workModeFilter, setWorkModeFilter] =
    useState<WorkMode | 'all'>('all')

  const [sortMode, setSortMode] =
    useState<SortMode>('match')

  // Opportunity detail state

  const [selectedId, setSelectedId] =
    useState<string | null>(null)

  // Application form state

  const [applicationOpen, setApplicationOpen] =
    useState(false)

  const [coverLetter, setCoverLetter] =
    useState('')

  const [applicationConsent, setApplicationConsent] =
    useState(false)

  // ==========================================
  // LOAD APPLICATION DATA
  // ==========================================

  useEffect(() => {

    let active = true

    Promise.all([

      getOpportunities(),

      getCandidateSkills(candidateId),

      getSavedOpportunities(candidateId),

      getApplications(candidateId),

    ])
      .then(
        ([
          listings,
          skills,
          saved,
          submittedApplications,
        ]) => {

          if (!active) return

          setOpportunities(listings)

          setCandidateSkills(skills)

          setSavedIds(
            saved.map(
              (item) => item.opportunity_id
            )
          )

          setApplications(
            submittedApplications
          )

        }
      )
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

  // ==========================================
  // DERIVED STATE
  // ==========================================

  const matchedOpportunities =
    matchOpportunities(
      opportunities,
      candidateSkills
    )

  const savedIdSet = new Set(savedIds)

  const applicationMap = new Map(
    applications.map((application) => [

      application.opportunity_id,
      application,

    ])
  )

  const opportunityMap = new Map(
    opportunities.map((opportunity) => [

      opportunity.id,
      opportunity,

    ])
  )

  const selectedMatch =
    matchedOpportunities.find(
      (match) =>
        match.opportunity.id === selectedId
    )

  const selectedOpportunity =
    selectedMatch?.opportunity

  const selectedApplication =
    selectedId
      ? applicationMap.get(selectedId)
      : undefined

  const normalizedSearch =
    search.trim().toLowerCase()

  const availableCount =
    opportunities.filter(
      (item) => !isDeadlinePassed(item.deadline)
    ).length

  const savedCount = savedIds.length

  const verifiedSkillCount =
    candidateSkills.filter(
      (skill) => skill.status === 'verified'
    ).length

  // ==========================================
  // FILTER OPPORTUNITIES
  // ==========================================

  const filteredMatches =
    matchedOpportunities

      .filter((match) => {

        const opportunity = match.opportunity

        if (
          activeTab === 'discover' &&
          isDeadlinePassed(opportunity.deadline)
        ) {
          return false
        }

        if (
          activeTab === 'saved' &&
          !savedIdSet.has(opportunity.id)
        ) {
          return false
        }

        if (
          typeFilter !== 'all' &&
          opportunity.opportunity_type !== typeFilter
        ) {
          return false
        }

        if (
          workModeFilter !== 'all' &&
          opportunity.work_mode !== workModeFilter
        ) {
          return false
        }

        if (normalizedSearch) {

          const searchableText = [

            opportunity.title,

            opportunity.organization,

            opportunity.description,

            opportunity.location || '',

            opportunity.opportunity_type,

            opportunity.work_mode,

            ...opportunity.opportunity_skills.map(
              (item) => item.skills.name
            ),

          ]
            .join(' ')
            .toLowerCase()

          if (
            !searchableText.includes(normalizedSearch)
          ) {
            return false
          }

        }

        return true

      })

      .sort((a, b) => {

        if (sortMode === 'newest') {

          return (
            new Date(b.opportunity.created_at).getTime() -
            new Date(a.opportunity.created_at).getTime()
          )

        }

        if (sortMode === 'title') {

          return a.opportunity.title.localeCompare(
            b.opportunity.title
          )

        }

        return (

          (b.matchPercentage ?? -1) -
          (a.matchPercentage ?? -1) ||

          a.opportunity.title.localeCompare(
            b.opportunity.title
          )

        )

      })

  // ==========================================
  // REFRESH DATA
  // ==========================================

  function refreshData() {

    setLoading(true)

    setError('')
    setMessage('')

    setReloadKey(
      (previous) => previous + 1
    )

  }

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  function clearFilters() {

    setSearch('')

    setTypeFilter('all')

    setWorkModeFilter('all')

    setSortMode('match')

  }

  // ==========================================
  // CHANGE TAB
  // ==========================================

  function changeTab(tab: ActiveTab) {

    setActiveTab(tab)

    setSelectedId(null)

    setApplicationOpen(false)

    setCoverLetter('')

    setApplicationConsent(false)

    setError('')

    setMessage('')

  }

  // ==========================================
  // SAVE OR UNSAVE OPPORTUNITY
  // ==========================================

  async function handleToggleSave(
    opportunityId: string
  ) {

    if (busy || loading) return

    setBusy(true)

    setError('')
    setMessage('')

    try {

      if (savedIdSet.has(opportunityId)) {

        await unsaveOpportunity(
          candidateId,
          opportunityId
        )

        setSavedIds((previous) =>
          previous.filter(
            (id) => id !== opportunityId
          )
        )

        setMessage(
          'Opportunity removed from saved listings.'
        )

      } else {

        await saveOpportunity(
          candidateId,
          opportunityId
        )

        setSavedIds((previous) => [

          ...new Set([
            ...previous,
            opportunityId,
          ]),

        ])

        setMessage(
          'Opportunity saved successfully.'
        )

      }

    } catch (err) {

      setError(
        getErrorMessage(err)
      )

    } finally {

      setBusy(false)

    }

  }

  // ==========================================
  // OPEN OPPORTUNITY DETAILS
  // ==========================================

  function openOpportunity(
    opportunityId: string
  ) {

    if (busy || loading) return

    setSelectedId(opportunityId)

    setApplicationOpen(false)

    setCoverLetter('')

    setApplicationConsent(false)

    setError('')
    setMessage('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

  }

  function closeOpportunity() {

    setSelectedId(null)

    setApplicationOpen(false)

    setCoverLetter('')

    setApplicationConsent(false)

    setError('')
    setMessage('')

  }

  // ==========================================
  // OPEN APPLICATION FORM
  // ==========================================

  function openApplicationForm() {

    if (
      !selectedOpportunity ||
      selectedOpportunity.is_demo ||
      selectedApplication ||
      isDeadlinePassed(selectedOpportunity.deadline)
    ) {
      return
    }

    setApplicationOpen(true)

    setApplicationConsent(false)

    setError('')
    setMessage('')

  }

  // ==========================================
  // SUBMIT APPLICATION
  // ==========================================

  async function handleApplicationSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault()

    if (
      !selectedOpportunity ||
      busy ||
      loading
    ) return

    setError('')
    setMessage('')

    if (selectedOpportunity.is_demo) {

      setError(
        'Demonstration listings cannot receive applications.'
      )

      return

    }

    if (
      selectedOpportunity.status !== 'published' ||
      isDeadlinePassed(selectedOpportunity.deadline)
    ) {

      setError(
        'This opportunity is no longer accepting applications.'
      )

      return

    }

    if (
      applicationMap.has(selectedOpportunity.id)
    ) {

      setError(
        'You have already applied for this opportunity.'
      )

      return

    }

    if (!applicationConsent) {

      setError(
        'Please confirm that you want to share this application with the employer.'
      )

      return

    }

    if (coverLetter.length > 3000) {

      setError(
        'Your cover letter must not exceed 3000 characters.'
      )

      return

    }

    const confirmed = window.confirm(

      `Submit your application for "${selectedOpportunity.title}"?`

    )

    if (!confirmed) return

    setBusy(true)

    try {

      const application =
        await applyForOpportunity(

          candidateId,

          selectedOpportunity.id,

          coverLetter,

        )

      setApplications((previous) => [

        application,

        ...previous,

      ])

      setApplicationOpen(false)

      setCoverLetter('')

      setApplicationConsent(false)

      setMessage(
        'Your application has been submitted successfully.'
      )

    } catch (err) {

      setError(
        getErrorMessage(err)
      )

    } finally {

      setBusy(false)

    }

  }

  // ==========================================
  // MAIN INTERFACE
  // ==========================================

  return (

    <div className="mx-auto max-w-7xl space-y-6">

      {/* Page heading */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>

          <h1 className="text-3xl font-extrabold">

            Opportunity matching

          </h1>

          <p className="mt-2 text-muted">

            Explore opportunities aligned with
            your professional competencies.

          </p>

        </div>

        <button
          type="button"
          disabled={busy || loading}
          onClick={refreshData}
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

      {/* Feedback messages */}

      {error && (

        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-red-700"
        >

          <CircleAlert
            size={20}
            className="shrink-0"
          />

          <p className="text-sm">

            {error}

          </p>

        </div>

      )}

      {message && (

        <div
          role="status"
          className="flex items-start gap-3 rounded-xl bg-green-50 p-4 text-green-700"
        >

          <CheckCircle2
            size={20}
            className="shrink-0"
          />

          <p className="text-sm">

            {message}

          </p>

        </div>

      )}

      {/* Loading state */}

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

            Loading professional opportunities...

          </p>

        </div>

      ) : selectedMatch && selectedOpportunity ? (

        // ======================================
        // OPPORTUNITY DETAILS VIEW
        // ======================================

        <>

          <button
            type="button"
            disabled={busy}
            onClick={closeOpportunity}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary disabled:opacity-50"
          >

            <ArrowLeft size={18} />

            Back to opportunities

          </button>

          {/* Opportunity details header */}

          <section className="rounded-2xl bg-[#123C35] p-6 text-white sm:p-10">

            <BriefcaseBusiness
              size={42}
              className="mb-5 text-[#D5F76A]"
            />

            {selectedOpportunity.is_demo && (

              <span className="mb-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">

                Demonstration opportunity

              </span>

            )}

            <h2 className="text-3xl font-extrabold">

              {selectedOpportunity.title}

            </h2>

            <p className="mt-3 flex items-center gap-2 text-[#D5F76A]">

              <Building2 size={18} />

              {selectedOpportunity.organization}

            </p>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/70">

              <span className="flex items-center gap-2">

                <MapPin size={16} />

                {selectedOpportunity.location ||
                  'Location not specified'}

              </span>

              <span className="capitalize">

                {selectedOpportunity.opportunity_type}

              </span>

              <span className="capitalize">

                {selectedOpportunity.work_mode}

              </span>

              <span className="flex items-center gap-2">

                <CalendarDays size={16} />

                {selectedOpportunity.deadline
                  ? `Deadline: ${selectedOpportunity.deadline}`
                  : 'No deadline specified'}

              </span>

            </div>

          </section>

          {/* Detailed content */}

          <div className="grid items-start gap-6 lg:grid-cols-3">

            <div className="space-y-6 lg:col-span-2">

              {/* Description */}

              <section className="rounded-2xl border border-border bg-white p-6">

                <h2 className="text-xl font-bold">

                  About this opportunity

                </h2>

                <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted">

                  {selectedOpportunity.description}

                </p>

                {selectedOpportunity.compensation && (

                  <div className="mt-6 rounded-xl bg-brand-50 p-4">

                    <p className="text-xs font-medium text-muted">

                      Compensation

                    </p>

                    <p className="mt-2 font-bold text-primary">

                      {selectedOpportunity.compensation}

                    </p>

                  </div>

                )}

              </section>

              {/* Detailed skill requirements */}

              <section className="rounded-2xl border border-border bg-white p-6">

                <h2 className="text-xl font-bold">

                  Skills and requirements

                </h2>

                <p className="mt-2 text-sm text-muted">

                  Compare your recorded competencies
                  with the skills listed for this opportunity.

                </p>

                {selectedOpportunity.opportunity_skills.length === 0 ? (

                  <p className="mt-5 text-sm text-muted">

                    No specific catalogue skills have
                    been listed.

                  </p>

                ) : (

                  <div className="mt-5 divide-y divide-border">

                    {selectedOpportunity.opportunity_skills.map(
                      (requirement) => {

                        const candidateSkill =
                          candidateSkills.find(
                            (skill) =>
                              skill.skill_id ===
                              requirement.skill_id
                          )

                        return (

                          <article
                            key={requirement.id}
                            className="flex flex-wrap items-center gap-4 py-4"
                          >

                            <div className="rounded-xl bg-brand-50 p-3 text-primary">

                              {candidateSkill?.status === 'verified'

                                ? <BadgeCheck size={22} />

                                : candidateSkill

                                  ? <CheckCircle2 size={22} />

                                  : <CircleAlert size={22} />

                              }

                            </div>

                            <div className="min-w-0 flex-1">

                              <h3 className="font-semibold">

                                {requirement.skills.name}

                              </h3>

                              <p className="mt-1 text-xs text-muted">

                                {requirement.skills.category}

                              </p>

                              <p className="mt-1 text-xs font-medium text-muted">

                                {requirement.is_required
                                  ? 'Required skill'
                                  : 'Preferred skill'}

                              </p>

                            </div>

                            <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                              candidateSkill?.status === 'verified'
                                ? 'bg-green-50 text-green-700'
                                : candidateSkill
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-amber-50 text-amber-700'
                            }`}>

                              {candidateSkill?.status === 'verified'

                                ? 'Verified'

                                : candidateSkill

                                  ? 'Recorded, not verified'

                                  : 'Not recorded'

                              }

                            </span>

                          </article>

                        )

                      }
                    )}

                  </div>

                )}

              </section>

              {/* Skill gap recommendations */}

              {(selectedMatch.missingRequiredSkills.length > 0 ||
                selectedMatch.missingPreferredSkills.length > 0) && (

                <section className="rounded-2xl border border-border bg-white p-6">

                  <h2 className="text-xl font-bold">

                    Your development pathway

                  </h2>

                  <p className="mt-3 text-sm leading-relaxed text-muted">

                    These competencies are not currently
                    recorded in your TalentBridge profile.
                    Add skills you already possess or explore
                    training for skills you want to develop.

                  </p>

                  <div className="mt-5 space-y-3">

                    {[

                      ...selectedMatch.missingRequiredSkills,

                      ...selectedMatch.missingPreferredSkills,

                    ].map((skill) => (

                      <div
                        key={skill.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-surface p-3"
                      >

                        <span className="text-sm font-medium">

                          {skill.skills.name}

                        </span>

                        <span className="text-xs text-muted">

                          {skill.is_required
                            ? 'Required'
                            : 'Preferred'}

                        </span>

                      </div>

                    ))}

                  </div>

                  <Link
                    to="/skills"
                    className="mt-5 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white"
                  >

                    Manage professional skills

                  </Link>

                </section>

              )}

              {/* Application form */}

              {applicationOpen && (

                <section className="rounded-2xl border border-border bg-white p-6">

                  <h2 className="text-xl font-bold">

                    Submit your application

                  </h2>

                  <p className="mt-2 text-sm text-muted">

                    Introduce yourself and explain how
                    your experience relates to this opportunity.

                  </p>

                  <form
                    onSubmit={handleApplicationSubmit}
                    className="mt-6 space-y-5"
                  >

                    <label className="block text-sm font-semibold">

                      Cover letter (optional)

                      <textarea
                        rows={8}
                        maxLength={3000}
                        disabled={busy}
                        value={coverLetter}
                        onChange={(event) =>
                          setCoverLetter(event.target.value)
                        }
                        placeholder="Explain your relevant experience, competencies and motivation..."
                        className="mt-3 w-full rounded-xl border border-border px-4 py-3 font-normal"
                      />

                    </label>

                    <p className="text-right text-xs text-muted">

                      {coverLetter.length}/3000

                    </p>

                    <label className="flex items-start gap-3 rounded-xl bg-surface p-4">

                      <input
                        type="checkbox"
                        checked={applicationConsent}
                        disabled={busy}
                        onChange={(event) =>
                          setApplicationConsent(event.target.checked)
                        }
                        className="mt-1 h-4 w-4 accent-primary"
                      />

                      <span className="text-sm leading-relaxed text-muted">

                        I agree to share this application,
                        my account identifier and cover letter
                        with the employer for this opportunity.

                        My private evidence documents will
                        not be shared automatically.

                      </span>

                    </label>

                    <div className="flex flex-wrap justify-end gap-3">

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {

                          setApplicationOpen(false)

                          setCoverLetter('')

                          setApplicationConsent(false)

                        }}
                        className="rounded-lg border border-border px-5 py-3 text-sm font-semibold"
                      >

                        Cancel

                      </button>

                      <button
                        type="submit"
                        disabled={busy || !applicationConsent}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                      >

                        {busy

                          ? <LoaderCircle
                              size={18}
                              className="animate-spin"
                            />

                          : <Send size={18} />

                        }

                        {busy
                          ? 'Submitting...'
                          : 'Submit application'}

                      </button>

                    </div>

                  </form>

                </section>

              )}

            </div>

            {/* Opportunity summary sidebar */}

            <aside className="space-y-5">

              <section className="rounded-2xl border border-border bg-white p-6">

                <h2 className="font-bold">

                  Your skill overlap

                </h2>

                <p className="mt-5 text-5xl font-extrabold text-primary">

                  {selectedMatch.matchPercentage === null
                    ? 'N/A'
                    : `${selectedMatch.matchPercentage}%`}

                </p>

                {selectedMatch.matchPercentage !== null && (

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${selectedMatch.matchPercentage}%`,
                      }}
                    />

                  </div>

                )}

                <div className="mt-6 space-y-4 text-sm">

                  <div className="flex justify-between gap-3">

                    <span className="text-muted">

                      Required coverage

                    </span>

                    <strong>

                      {selectedMatch.requiredCoverage === null
                        ? 'N/A'
                        : `${selectedMatch.requiredCoverage}%`}

                    </strong>

                  </div>

                  <div className="flex justify-between gap-3">

                    <span className="text-muted">

                      Verified matches

                    </span>

                    <strong className="text-primary">

                      {selectedMatch.verifiedMatches.length}

                    </strong>

                  </div>

                  <div className="flex justify-between gap-3">

                    <span className="text-muted">

                      Unverified matches

                    </span>

                    <strong>

                      {selectedMatch.selfReportedMatches.length}

                    </strong>

                  </div>

                  <div className="flex justify-between gap-3">

                    <span className="text-muted">

                      Missing required skills

                    </span>

                    <strong className="text-amber-700">

                      {selectedMatch.missingRequiredSkills.length}

                    </strong>

                  </div>

                </div>

              </section>

              {/* Apply and save actions */}

              <section className="rounded-2xl border border-border bg-white p-6">

                <h2 className="font-bold">

                  Interested in this opportunity?

                </h2>

                <button
                  type="button"
                  disabled={busy || loading}
                  onClick={() =>
                    void handleToggleSave(
                      selectedOpportunity.id
                    )
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold disabled:opacity-50"
                >

                  <Bookmark
                    size={18}
                    fill={
                      savedIdSet.has(selectedOpportunity.id)
                        ? 'currentColor'
                        : 'none'
                    }
                  />

                  {savedIdSet.has(selectedOpportunity.id)
                    ? 'Remove bookmark'
                    : 'Save opportunity'}

                </button>

                {selectedApplication ? (

                  <div className="mt-4 rounded-xl bg-green-50 p-4">

                    <p className="flex items-center gap-2 text-sm font-semibold text-green-700">

                      <CheckCircle2 size={18} />

                      Application recorded

                    </p>

                    <p className="mt-2 text-xs capitalize text-green-700">

                      Status:{' '}

                      {selectedApplication.status.replaceAll('_', ' ')}

                    </p>

                  </div>

                ) : selectedOpportunity.is_demo ? (

                  <div className="mt-4 rounded-xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">

                    This is a fictional demonstration
                    listing. Applications are disabled.

                  </div>

                ) : isDeadlinePassed(
                  selectedOpportunity.deadline
                ) ? (

                  <div className="mt-4 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">

                    The application deadline has passed.

                  </div>

                ) : (

                  <button
                    type="button"
                    disabled={
                      busy ||
                      applicationOpen ||
                      selectedOpportunity.status !== 'published'
                    }
                    onClick={openApplicationForm}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >

                    <Send size={18} />

                    Apply for opportunity

                  </button>

                )}

              </section>

              <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">

                <Info
                  size={18}
                  className="shrink-0 text-primary"
                />

                <p className="text-xs leading-relaxed text-muted">

                  Skill overlap is based on recorded
                  competencies. It does not determine
                  legal work eligibility or guarantee
                  employment.

                </p>

              </div>

            </aside>

          </div>

        </>

      ) : (

        // ======================================
        // OPPORTUNITY DISCOVERY VIEW
        // ======================================

        <>

          {/* Hero banner */}

          <section className="rounded-2xl bg-[#123C35] p-6 text-white sm:p-10">

            <BriefcaseBusiness
              size={42}
              className="mb-5 text-[#D5F76A]"
            />

            <p className="text-xs font-bold uppercase tracking-widest text-[#D5F76A]">

              Connecting talent to opportunity

            </p>

            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">

              Your skills. Your next opportunity.

            </h2>

            <p className="mt-4 max-w-2xl leading-relaxed text-white/70">

              Discover employment, freelance,
              training and professional development
              opportunities aligned with your skills.

            </p>

            {/* Search field */}

            <div className="relative mt-6 max-w-2xl">

              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                aria-label="Search opportunities"
                value={search}
                onChange={(event) => {

                  setSearch(event.target.value)

                  if (activeTab === 'applications') {
                    setActiveTab('discover')
                  }

                }}
                placeholder="Search jobs, organizations or skills..."
                className="w-full rounded-xl bg-white py-4 pl-12 pr-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#D5F76A]"
              />

            </div>

          </section>

          {/* Statistics */}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

            {[

              {
                label: 'Open listings',
                value: availableCount,
                icon: BriefcaseBusiness,
              },

              {
                label: 'Saved opportunities',
                value: savedCount,
                icon: Bookmark,
              },

              {
                label: 'My applications',
                value: applications.length,
                icon: Send,
              },

              {
                label: 'Verified skills',
                value: verifiedSkillCount,
                icon: BadgeCheck,
              },

            ].map((item) => (

              <article
                key={item.label}
                className="rounded-xl border border-border bg-white p-5"
              >

                <item.icon
                  size={24}
                  className="text-primary"
                />

                <p className="mt-4 text-sm text-muted">

                  {item.label}

                </p>

                <p className="mt-2 text-3xl font-extrabold text-primary">

                  {item.value}

                </p>

              </article>

            ))}

          </div>

          {/* No skills notification */}

          {candidateSkills.length === 0 && (

            <div className="flex flex-wrap items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5">

              <CircleAlert
                size={24}
                className="shrink-0 text-amber-700"
              />

              <div className="min-w-0 flex-1">

                <h3 className="font-semibold text-amber-800">

                  Add your professional skills

                </h3>

                <p className="mt-2 text-sm text-amber-700">

                  You can explore opportunities now,
                  but adding your skills will make the
                  matching results more meaningful.

                </p>

              </div>

              <Link
                to="/skills"
                className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white"
              >

                Manage skills

              </Link>

            </div>

          )}

          {/* Tabs */}

          <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-white p-2">

            {([

              {
                value: 'discover',
                label: 'Discover',
                icon: BriefcaseBusiness,
              },

              {
                value: 'saved',
                label: 'Saved opportunities',
                icon: Bookmark,
              },

              {
                value: 'applications',
                label: 'My applications',
                icon: Send,
              },

            ] as const).map((tab) => (

              <button
                key={tab.value}
                type="button"
                disabled={busy}
                aria-pressed={activeTab === tab.value}
                onClick={() => changeTab(tab.value)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                  activeTab === tab.value

                    ? 'bg-primary text-white'

                    : 'text-muted hover:bg-surface'

                }`}
              >

                <tab.icon size={17} />

                {tab.label}

              </button>

            ))}

          </div>

          {/* Filters */}

          {activeTab !== 'applications' && (

            <section className="rounded-xl border border-border bg-white p-5">

              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-2">

                  <SlidersHorizontal
                    size={20}
                    className="text-primary"
                  />

                  <h2 className="font-semibold">

                    Filter opportunities

                  </h2>

                </div>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-semibold text-primary"
                >

                  Clear filters

                </button>

              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">

                <label className="block text-xs font-medium text-muted">

                  Opportunity type

                  <select
                    value={typeFilter}
                    onChange={(event) =>
                      setTypeFilter(
                        event.target.value as OpportunityType | 'all'
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-3 text-sm"
                  >

                    <option value="all">

                      All types

                    </option>

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

                <label className="block text-xs font-medium text-muted">

                  Work arrangement

                  <select
                    value={workModeFilter}
                    onChange={(event) =>
                      setWorkModeFilter(
                        event.target.value as WorkMode | 'all'
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-3 text-sm"
                  >

                    <option value="all">

                      All arrangements

                    </option>

                    <option value="remote">

                      Remote

                    </option>

                    <option value="onsite">

                      On-site

                    </option>

                    <option value="hybrid">

                      Hybrid

                    </option>

                  </select>

                </label>

                <label className="block text-xs font-medium text-muted">

                  Sort by

                  <select
                    value={sortMode}
                    onChange={(event) =>
                      setSortMode(
                        event.target.value as SortMode
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-3 text-sm"
                  >

                    <option value="match">

                      Highest skill overlap

                    </option>

                    <option value="newest">

                      Newest listings

                    </option>

                    <option value="title">

                      Title (A–Z)

                    </option>

                  </select>

                </label>

              </div>

            </section>

          )}

          {/* ================================== */}
          {/* APPLICATION HISTORY                */}
          {/* ================================== */}

          {activeTab === 'applications' ? (

            <section className="rounded-2xl border border-border bg-white p-6">

              <h2 className="text-xl font-bold">

                My applications

              </h2>

              <p className="mt-2 text-sm text-muted">

                Track the applications you have
                submitted through TalentBridge.

              </p>

              {applications.length === 0 ? (

                <div className="py-14 text-center">

                  <Send
                    size={44}
                    className="mx-auto text-muted"
                  />

                  <h3 className="mt-5 font-semibold">

                    No applications yet

                  </h3>

                  <p className="mt-2 text-sm text-muted">

                    Applications you submit will
                    appear here.

                  </p>

                  <button
                    type="button"
                    onClick={() => changeTab('discover')}
                    className="mt-5 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white"
                  >

                    Discover opportunities

                  </button>

                </div>

              ) : (

                <div className="mt-5 divide-y divide-border">

                  {applications.map((application) => {

                    const opportunity = opportunityMap.get(
                      application.opportunity_id
                    )

                    return (

                      <article
                        key={application.id}
                        className="py-5"
                      >

                        <div className="flex flex-wrap items-start gap-4">

                          <div className="rounded-xl bg-brand-50 p-3 text-primary">

                            <BriefcaseBusiness size={25} />

                          </div>

                          <div className="min-w-0 flex-1">

                            <h3 className="font-bold">

                              {opportunity?.title ||
                                'Previously submitted opportunity'}

                            </h3>

                            <p className="mt-1 text-sm text-muted">

                              {opportunity?.organization ||
                                'Listing no longer available'}

                            </p>

                            <p className="mt-2 text-xs text-muted">

                              Submitted:{' '}

                              {new Date(
                                application.created_at
                              ).toLocaleDateString()}

                            </p>

                          </div>

                          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${

                            application.status === 'accepted'

                              ? 'bg-green-50 text-green-700'

                              : application.status === 'rejected'

                                ? 'bg-red-50 text-red-700'

                                : application.status === 'shortlisted'

                                  ? 'bg-blue-50 text-blue-700'

                                  : 'bg-slate-100 text-slate-600'

                          }`}>

                            {application.status.replaceAll('_', ' ')}

                          </span>

                        </div>

                        {application.cover_letter && (

                          <div className="mt-4 rounded-xl bg-surface p-4">

                            <p className="text-xs font-semibold text-muted">

                              Submitted cover letter

                            </p>

                            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted">

                              {application.cover_letter}

                            </p>

                          </div>

                        )}

                        {opportunity && (

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              openOpportunity(opportunity.id)
                            }
                            className="mt-4 text-sm font-semibold text-primary"
                          >

                            View opportunity

                          </button>

                        )}

                      </article>

                    )

                  })}

                </div>

              )}

            </section>

          ) : (

            // ==================================
            // DISCOVER AND SAVED OPPORTUNITIES
            // ==================================

            <>

              <div className="flex flex-wrap items-center justify-between gap-3">

                <h2 className="text-xl font-bold">

                  {activeTab === 'saved'

                    ? 'Your saved opportunities'

                    : 'Explore opportunities'

                  }

                </h2>

                <span className="text-sm text-muted">

                  {filteredMatches.length}{' '}

                  {filteredMatches.length === 1
                    ? 'result'
                    : 'results'}

                </span>

              </div>

              {/* Saved listings that are no longer visible */}

              {activeTab === 'saved' && savedIds.some(
                (id) => !opportunityMap.has(id)
              ) && (

                <section className="rounded-xl border border-border bg-white p-5">

                  <h3 className="font-semibold">

                    Unavailable saved listings

                  </h3>

                  <div className="mt-3 space-y-3">

                    {savedIds
                      .filter(
                        (id) => !opportunityMap.has(id)
                      )
                      .map((id) => (

                        <div
                          key={id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface p-3"
                        >

                          <p className="text-sm text-muted">

                            This listing is no longer visible.

                          </p>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void handleToggleSave(id)
                            }
                            className="text-xs font-semibold text-primary"
                          >

                            Remove bookmark

                          </button>

                        </div>

                      ))}

                  </div>

                </section>

              )}

              {filteredMatches.length === 0 ? (

                <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">

                  <BriefcaseBusiness
                    size={46}
                    className="mx-auto text-muted"
                  />

                  <h3 className="mt-5 text-lg font-semibold">

                    {activeTab === 'saved' &&
                      savedIds.length === 0

                      ? 'No saved opportunities yet'

                      : 'No matching opportunities'

                    }

                  </h3>

                  <p className="mt-3 text-sm text-muted">

                    {activeTab === 'saved' &&
                      savedIds.length === 0

                      ? 'Bookmark interesting opportunities to find them later.'

                      : 'Try changing your search or clearing the filters.'

                    }

                  </p>

                  <button
                    type="button"
                    onClick={() => {

                      clearFilters()

                      if (activeTab === 'saved') {
                        changeTab('discover')
                      }

                    }}
                    className="mt-5 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white"
                  >

                    {activeTab === 'saved'
                      ? 'Discover opportunities'
                      : 'Reset filters'}

                  </button>

                </div>

              ) : (

                <div className="grid gap-5 lg:grid-cols-2">

                  {filteredMatches.map((match) => (

                    <OpportunityCard

                      key={match.opportunity.id}

                      match={match}

                      saved={savedIdSet.has(
                        match.opportunity.id
                      )}

                      application={applicationMap.get(
                        match.opportunity.id
                      )}

                      busy={busy}

                      onToggleSave={(id) =>
                        void handleToggleSave(id)
                      }

                      onView={openOpportunity}

                    />

                  ))}

                </div>

              )}

            </>

          )}

          {/* Matching disclaimer */}

          <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-5">

            <Info
              size={20}
              className="shrink-0 text-primary"
            />

            <p className="text-xs leading-relaxed text-muted">

              TalentBridge matches opportunities using
              your recorded professional competencies.

              Matching percentages measure overlap
              with listed skills, not your suitability
              for employment, legal work authorization
              or probability of receiving a job offer.

              Demonstration listings are fictional
              and cannot receive applications.

            </p>

          </div>

        </>

      )}

    </div>

  )
}