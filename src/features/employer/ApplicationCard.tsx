import { useState } from 'react'
import { UserRound, CalendarDays, ShieldCheck, LoaderCircle } from 'lucide-react'

import {
  APPLICATION_TRANSITIONS,
  APPLICATION_STATUS_LABELS,
  APPLICATION_ACTION_LABELS,
} from '../../constants/applicationWorkflow'

import type {
  EmployerApplication,
  EmployerApplicationDecision,
} from '../../types/employer'

interface ApplicationCardProps {
  application: EmployerApplication
  busy?: boolean
  disabled?: boolean
  onDecision: (
    id: string,
    decision: EmployerApplicationDecision
  ) => Promise<void>
}

export default function ApplicationCard({
  application,
  busy = false,
  disabled = false,
  onDecision,
}: ApplicationCardProps) {
  const [expanded, setExpanded] = useState(false)

  const actions = APPLICATION_TRANSITIONS[application.status] ?? []

  async function handleDecision(
    decision: EmployerApplicationDecision
  ) {
    if (busy || disabled) return

    if (!window.confirm(
      `Confirm action: ${APPLICATION_ACTION_LABELS[decision]}? Accepted and rejected statuses are final.`
    )) return

    await onDecision(application.id, decision)
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex flex-wrap items-start gap-4">
        <div className="rounded-xl bg-[#EAF3EE] p-4 text-[#16826B]">
          <UserRound size={26} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-[#123C35]">
            Candidate #{application.candidate_id.slice(0, 8)}
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            {application.opportunities.title}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {application.opportunities.organization}
          </p>
        </div>

        <span className="rounded-full bg-[#EAF3EE] px-3 py-1.5 text-xs font-semibold text-[#16826B]">
          {APPLICATION_STATUS_LABELS[application.status]}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
        <CalendarDays size={16} />

        Submitted{' '}
        {new Date(application.created_at).toLocaleDateString(
          'en-GB',
          { timeZone: 'Africa/Nairobi' }
        )}
      </div>

      <div className="mt-5 rounded-xl bg-[#F6F8F5] p-5">
        <h4 className="font-semibold text-[#123C35]">
          Application statement
        </h4>

        <p className={`mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600 ${
          expanded ? '' : 'line-clamp-3'
        }`}>
          {application.cover_letter || 'No cover letter submitted.'}
        </p>

        {application.cover_letter && (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-xs font-semibold text-[#16826B]"
          >
            {expanded ? 'Show less' : 'Read full statement'}
          </button>
        )}
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
        <ShieldCheck size={17} className="shrink-0 text-[#16826B]" />

        Private candidate credentials must be voluntarily shared.
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">

        {actions.length === 0 && (
          <p className="text-sm text-slate-500">
            No further status changes available.
          </p>
        )}

        {actions.map((decision) => (
          <button
            key={decision}
            type="button"
            disabled={busy || disabled}
            onClick={() => void handleDecision(decision)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50 ${
              decision === 'rejected'
                ? 'border border-red-200 text-red-700'
                : 'bg-[#16826B] text-white'
            }`}
          >
            {busy && (
              <LoaderCircle size={16} className="animate-spin" />
            )}

            {APPLICATION_ACTION_LABELS[decision]}
          </button>
        ))}

      </div>
    </article>
  )
}