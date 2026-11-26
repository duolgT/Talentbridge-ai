import { useEffect, useState } from 'react'

import {
  BrainCircuit,
  Sparkles,
  Plus,
  X,
  Trash2,
  BadgeCheck,
} from 'lucide-react'

import { useAuthStore } from '../../store/authStore'

import { getHistory } from '../../services/historyService'

import {
  getSkills,
  getCandidateSkills,
  addCandidateSkill,
  removeCandidateSkill,
} from '../../services/skillService'

import { mapSkills } from '../../utils/skillMapper'

import type {
  Skill,
  CandidateSkill,
  SkillSuggestion,
} from '../../types/skills'

import type {
  Experience,
  Education,
} from '../../types/professional'

import type { Profile } from '../../types/auth'

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

export default function SkillsPage() {
  const profile = useAuthStore(
    (state) => state.profile
  )

  if (!profile) return null

  return (
    <SkillsWorkspace
      key={profile.id}
      profile={profile}
    />
  )
}

function SkillsWorkspace({
  profile,
}: {
  profile: Profile
}) {

  const candidateId = profile.id

  const [catalogue, setCatalogue] =
    useState<Skill[]>([])

  const [mySkills, setMySkills] =
    useState<CandidateSkill[]>([])

  const [suggestions, setSuggestions] =
    useState<SkillSuggestion[]>([])

  const [selectedSkill, setSelectedSkill] =
    useState('')

  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([
      getSkills(),
      getCandidateSkills(candidateId),
    ])
      .then(([skills, savedSkills]) => {

        if (!active) return

        setCatalogue(skills)
        setMySkills(savedSkills)

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

  const savedSkillIds = new Set(
    mySkills.map((item) => item.skill_id)
  )

  const availableSkills = catalogue.filter(
    (skill) => !savedSkillIds.has(skill.id)
  )

  const visibleSuggestions = suggestions.filter(
    (item) => !savedSkillIds.has(item.skill.id)
  )

  const verifiedCount = mySkills.filter(
    (item) => item.status === 'verified'
  ).length

  async function handleAnalyze() {
    if (busy || loading) return

    setBusy(true)
    setError('')
    setMessage('')

    try {

      const [experiences, education] =
        await Promise.all([
          getHistory('experiences', candidateId),
          getHistory('education', candidateId),
        ])

      const detected = mapSkills(
        catalogue,
        experiences as Experience[],
        education as Education[],
        profile.bio || '',
        profile.professional_title || ''
      )

      const newSuggestions = detected.filter(
        (item) => !savedSkillIds.has(item.skill.id)
      )

      setSuggestions(newSuggestions)

      setMessage(
        `${newSuggestions.length} new skill suggestions found.`
      )

    } catch (err) {
      setError(getErrorMessage(err))

    } finally {
      setBusy(false)
    }
  }

  async function handleAdd(
    skillId: string,
    source: 'manual' | 'rule_based'
  ) {

    if (busy || loading) return

    setBusy(true)
    setError('')
    setMessage('')

    try {

      const record = await addCandidateSkill(
        candidateId,
        skillId,
        source
      )

      setMySkills((previous) => [
        record,
        ...previous,
      ])

      setSuggestions((previous) =>
        previous.filter(
          (item) => item.skill.id !== skillId
        )
      )

      setSelectedSkill('')
      setMessage('Skill added successfully.')

    } catch (err) {
      setError(getErrorMessage(err))

    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(
    record: CandidateSkill
  ) {

    if (busy) return

    if (
      !window.confirm(
        `Remove ${record.skills.name}?`
      )
    ) {
      return
    }

    setBusy(true)
    setError('')
    setMessage('')

    try {

      await removeCandidateSkill(
        candidateId,
        record.id
      )

      setMySkills((previous) =>
        previous.filter(
          (item) => item.id !== record.id
        )
      )

      setMessage('Skill removed.')

    } catch (err) {
      setError(getErrorMessage(err))

    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      <div>
        <h1 className="text-3xl font-extrabold">
          AI Skills Mapping
        </h1>

        <p className="mt-2 text-muted">
          Discover and document your professional
          competencies.
        </p>
      </div>

      {/* Analysis banner */}

      <section className="rounded-2xl bg-primary-dark p-8 text-white">

        <BrainCircuit
          size={42}
          className="mb-5 text-accent"
        />

        <h2 className="text-3xl font-bold">
          Discover your hidden potential.
        </h2>

        <p className="mt-3 max-w-2xl text-white/70">
          Analyze your professional experience,
          education and biography to discover
          relevant skills.
        </p>

        <p className="mt-3 text-xs text-accent">
          Extraction method: keyword matching
        </p>

        <button
          type="button"
          disabled={busy || loading}
          onClick={() => void handleAnalyze()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-primary-dark disabled:opacity-50"
        >

          <Sparkles size={20} />

          {busy
            ? 'Processing...'
            : 'Analyze my professional history'}

        </button>

      </section>

      {/* Statistics */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {[
          {
            title: 'Suggested skills',
            value: visibleSuggestions.length,
          },
          {
            title: 'My skills',
            value: mySkills.length,
          },
          {
            title: 'Verified skills',
            value: verifiedCount,
          },
        ].map((item) => (

          <article
            key={item.title}
            className="rounded-xl border border-border bg-white p-5"
          >

            <p className="text-sm text-muted">
              {item.title}
            </p>

            <p className="mt-2 text-3xl font-bold text-primary">
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

      {/* Suggested competencies */}

      <section className="rounded-2xl border border-border bg-white p-6">

        <h2 className="text-xl font-bold">
          Suggested competencies
        </h2>

        <p className="mt-2 text-sm text-muted">
          Review each suggestion before adding it
          to your professional skills.
        </p>

        {visibleSuggestions.length === 0 ? (

          <p className="py-8 text-center text-sm text-muted">
            Analyze your professional history
            to discover new skills.
          </p>

        ) : (

          <div className="mt-5 divide-y divide-border">

            {visibleSuggestions.map((item) => (

              <article
                key={item.skill.id}
                className="flex flex-wrap items-start gap-4 py-5"
              >

                <div className="rounded-xl bg-brand-50 p-3 text-primary">
                  <Sparkles size={22} />
                </div>

                <div className="min-w-0 flex-1">

                  <h3 className="font-bold">
                    {item.skill.name}
                  </h3>

                  <p className="text-sm text-primary">
                    {item.skill.category}
                  </p>

                  <p className="mt-2 text-xs text-muted">
                    Sources: {
                      item.matchedSources.join(', ')
                    }
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Matches: {
                      item.matchedKeywords.join(', ')
                    }
                  </p>

                </div>

                <button
                  type="button"
                  disabled={busy}
                  aria-label={`Dismiss ${item.skill.name}`}
                  onClick={() =>
                    setSuggestions((previous) =>
                      previous.filter(
                        (suggestion) =>
                          suggestion.skill.id !==
                          item.skill.id
                      )
                    )
                  }
                  className="rounded-lg border border-border p-3"
                >
                  <X size={18} />
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void handleAdd(
                      item.skill.id,
                      'rule_based'
                    )
                  }
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Plus size={18} />
                  Add skill
                </button>

              </article>

            ))}

          </div>

        )}

      </section>

      {/* Saved skills */}

      <section className="rounded-2xl border border-border bg-white p-6">

        <h2 className="text-xl font-bold">
          My professional skills
        </h2>

        <p className="mt-2 text-sm text-muted">
          Manage your confirmed competencies.
        </p>

        {/* Manual skill selection */}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">

          <select
            aria-label="Select a professional skill"
            value={selectedSkill}
            disabled={loading || busy}
            onChange={(e) =>
              setSelectedSkill(e.target.value)
            }
            className="min-w-0 flex-1 rounded-lg border border-border px-4 py-3"
          >

            <option value="">
              Select a professional skill
            </option>

            {availableSkills.map((skill) => (

              <option
                key={skill.id}
                value={skill.id}
              >
                {skill.name} — {skill.category}
              </option>

            ))}

          </select>

          <button
            type="button"
            disabled={!selectedSkill || busy || loading}
            onClick={() =>
              void handleAdd(
                selectedSkill,
                'manual'
              )
            }
            className="rounded-lg bg-primary px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            Add manually
          </button>

        </div>

        {loading && (
          <p className="py-6 text-muted">
            Loading skills...
          </p>
        )}

        {!loading && mySkills.length === 0 && (
          <p className="py-8 text-center text-muted">
            No professional skills added yet.
          </p>
        )}

        <div className="mt-5 divide-y divide-border">

          {mySkills.map((record) => (

            <article
              key={record.id}
              className="flex items-center gap-4 py-4"
            >

              <div className="min-w-0 flex-1">

                <h3 className="font-semibold">
                  {record.skills.name}
                </h3>

                <p className="text-xs text-muted">
                  {record.skills.category}
                </p>

              </div>

              <span
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium capitalize ${
                  record.status === 'verified'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >

                {record.status === 'verified' && (
                  <BadgeCheck size={15} />
                )}

                {record.status}

              </span>

              {record.status === 'unverified' && (

                <button
                  type="button"
                  disabled={busy}
                  aria-label={`Remove ${record.skills.name}`}
                  onClick={() =>
                    void handleRemove(record)
                  }
                  className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>

              )}

            </article>

          ))}

        </div>

      </section>

    </div>
  )
}