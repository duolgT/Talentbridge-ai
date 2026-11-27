import { isDeadlinePassed } from '../../utils/opportunityUtils'

import {

  BriefcaseBusiness,
  Bookmark,
  MapPin,
  CalendarDays,
  BadgeCheck,
  ArrowRight,
  GraduationCap,
  Laptop,
  Building2,
  CheckCircle2,
  CircleAlert,
} from 'lucide-react'

import type {
  OpportunityMatch,
  Application,
} from '../../types/opportunity'

interface OpportunityCardProps {
  match: OpportunityMatch
  saved: boolean
  application?: Application
  busy?: boolean
  onToggleSave: (id: string) => void
  onView: (id: string) => void
}

const opportunityLabels = {
  employment: 'Employment',
  freelance: 'Freelance',
  internship: 'Internship',
  training: 'Training',
  volunteer: 'Volunteer',
}

const workModeLabels = {
  onsite: 'On-site',
  remote: 'Remote',
  hybrid: 'Hybrid',
}

// Compare deadlines using Kenya's local date.



export default function OpportunityCard({
  match,
  saved,
  application,
  busy = false,
  onToggleSave,
  onView,
}: OpportunityCardProps) {

  const {
    opportunity,
    matchPercentage,
    requiredCoverage,
    matchedSkills,
    verifiedMatches,
    selfReportedMatches,
    missingRequiredSkills,
    missingPreferredSkills,
  } = match

  const verifiedIds = new Set(
    verifiedMatches.map(
      (skill) => skill.skill_id
    )
  )

  const missingSkills = [
    ...missingRequiredSkills,
    ...missingPreferredSkills,
  ]

  const expired = isDeadlinePassed(
    opportunity.deadline
  )

  const OpportunityIcon =
    opportunity.opportunity_type === 'training'
      ? GraduationCap
      : opportunity.opportunity_type === 'freelance'
        ? Laptop
        : BriefcaseBusiness

  return (

    <article className="flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">

      {/* Opportunity heading */}

      <div className="flex items-start gap-4">

        <div className="shrink-0 rounded-xl bg-brand-50 p-3 text-primary">

          <OpportunityIcon size={26} />

        </div>

        <div className="min-w-0 flex-1">

          <h2 className="break-words text-lg font-bold">

            {opportunity.title}

          </h2>

          <p className="mt-1 flex items-center gap-2 text-sm text-muted">

            <Building2 size={14} />

            {opportunity.organization}

          </p>

          {opportunity.is_demo && (

            <span className="mt-2 inline-block rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">

              Demo listing

            </span>

          )}

        </div>

        {/* Bookmark */}

        <button
          type="button"
          disabled={busy}
          aria-pressed={saved}
          aria-label={
            saved
              ? `Unsave ${opportunity.title}`
              : `Save ${opportunity.title}`
          }
          onClick={() => onToggleSave(opportunity.id)}
          className="rounded-lg p-2 text-primary transition-colors hover:bg-brand-50 disabled:opacity-50"
        >

          <Bookmark
            size={22}
            fill={saved ? 'currentColor' : 'none'}
          />

        </button>

      </div>

      {/* Opportunity metadata */}

      <div className="mt-5 flex flex-wrap gap-2">

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">

          {opportunityLabels[
            opportunity.opportunity_type
          ]}

        </span>

        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-primary">

          {workModeLabels[
            opportunity.work_mode
          ]}

        </span>

        {expired && (

          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">

            Deadline passed

          </span>

        )}

      </div>

      <div className="mt-4 space-y-2 text-sm text-muted">

        <p className="flex items-center gap-2">

          <MapPin size={16} />

          {opportunity.location ||
            'Location not specified'}

        </p>

        <p className="flex items-center gap-2">

          <CalendarDays size={16} />

          {opportunity.deadline
            ? `Deadline: ${opportunity.deadline}`
            : 'No deadline specified'}

        </p>

        {opportunity.compensation && (

          <p className="font-semibold text-primary">

            {opportunity.compensation}

          </p>

        )}

      </div>

      {/* Short description */}

      <p className="mt-5 line-clamp-3 text-sm leading-relaxed text-muted">

        {opportunity.description}

      </p>

      {/* Matching score */}

      <div className="mt-6 rounded-xl bg-surface p-4">

        <div className="flex items-center justify-between">

          <span className="text-sm font-semibold">

            Skill overlap

          </span>

          <span className="text-2xl font-extrabold text-primary">

            {matchPercentage === null
              ? 'N/A'
              : `${matchPercentage}%`}

          </span>

        </div>

        {matchPercentage !== null && (

          <div
            role="progressbar"
            aria-label="Skill overlap"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={matchPercentage}
            className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
          >

            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${matchPercentage}%`,
              }}
            />

          </div>

        )}

        <p className="mt-3 text-xs text-muted">

          Required skills coverage:{' '}

          {requiredCoverage === null
            ? 'Not specified'
            : `${requiredCoverage}%`}

        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">

          <div>

            <p className="text-lg font-bold text-primary">

              {verifiedMatches.length}

            </p>

            <p className="text-xs text-muted">

              Verified matches

            </p>

          </div>

          <div>

            <p className="text-lg font-bold">

              {selfReportedMatches.length}

            </p>

            <p className="text-xs text-muted">

              Unverified claims

            </p>

          </div>

        </div>

      </div>

      {/* Matching skills */}

      <div className="mt-5">

        <h3 className="text-sm font-semibold">

          Matching competencies

        </h3>

        {matchedSkills.length === 0 ? (

          <p className="mt-2 text-xs text-muted">

            No matching skills recorded yet.

          </p>

        ) : (

          <div className="mt-3 flex flex-wrap gap-2">

            {matchedSkills.map((skill) => (

              <span
                key={skill.id}
                title={
                  verifiedIds.has(skill.skill_id)
                    ? 'Evidence reviewed'
                    : 'Not independently verified'
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-primary"
              >

                {verifiedIds.has(skill.skill_id) && (

                  <BadgeCheck size={14} />

                )}

                {skill.skills.name}

              </span>

            ))}

          </div>

        )}

      </div>

      {/* Skill gaps */}

      {missingSkills.length > 0 && (

        <div className="mt-5">

          <h3 className="flex items-center gap-2 text-sm font-semibold">

            <CircleAlert
              size={16}
              className="text-amber-600"
            />

            Skills not recorded

          </h3>

          <div className="mt-3 flex flex-wrap gap-2">

            {missingSkills.map((skill) => (

              <span
                key={skill.id}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-muted"
              >

                {skill.skills.name}

                {skill.is_required && (

                  <span className="ml-1 text-amber-700">

                    · Required

                  </span>

                )}

              </span>

            ))}

          </div>

        </div>

      )}

      {/* Application status */}

      {application && (

        <div className="mt-5 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">

          <CheckCircle2 size={17} />

          <span className="capitalize">

            Application:{' '}

            {application.status.replaceAll('_', ' ')}

          </span>

        </div>

      )}

      {/* Card action */}

      <div className="mt-auto pt-6">

        <button
          type="button"
          onClick={() => onView(opportunity.id)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >

          View opportunity

          <ArrowRight size={18} />

        </button>

      </div>

    </article>

  )
}