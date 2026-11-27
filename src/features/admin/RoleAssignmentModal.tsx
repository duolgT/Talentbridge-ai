import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'

import {
  X,
  UserCog,
  ShieldCheck,
  LoaderCircle,
  CircleAlert,
  History,
} from 'lucide-react'

import type {
  AdminUser,
  AssignableRole,
  RoleAssignmentInput,
} from '../../types/admin'

interface RoleAssignmentModalProps {
  user: AdminUser
  onClose: () => void
  onSubmit: (
    input: RoleAssignmentInput
  ) => Promise<void>
}

export default function RoleAssignmentModal({
  user,
  onClose,
  onSubmit,
}: RoleAssignmentModalProps) {

  const dialogRef = useRef<HTMLDialogElement>(null)
  const submittingRef = useRef(false)

  const [newRole, setNewRole] =
    useState<AssignableRole>('reviewer')

  const [reason, setReason] = useState('')

  const [confirmed, setConfirmed] =
    useState(false)

  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] = useState('')

  useEffect(() => {

    const dialog = dialogRef.current

    if (!dialog) return

    if (!dialog.open) {
      dialog.showModal()
    }

    return () => {
      if (dialog.open) dialog.close()
    }

  }, [])

  const validReason =
    reason.trim().length >= 10 &&
    reason.trim().length <= 1000

  const canSubmit =
    user.role === 'candidate' &&
    validReason &&
    confirmed &&
    !submitting

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault()

    if (!canSubmit || submittingRef.current) return

    submittingRef.current = true

    setSubmitting(true)
    setError('')

    try {

      await onSubmit({
        userId: user.id,
        newRole,
        reason: reason.trim(),
      })

    } catch (err) {

      setError(
        typeof err === 'object' &&
        err !== null &&
        'message' in err

          ? String(err.message)

          : 'Unable to assign the requested role.'
      )

    } finally {

      submittingRef.current = false

      setSubmitting(false)

    }
  }

  return (

    <dialog
      ref={dialogRef}
      aria-labelledby="role-modal-title"
      onCancel={(event) => {
        event.preventDefault()

        if (!submittingRef.current) {
          onClose()
        }
      }}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-black/60"
    >

      <form onSubmit={handleSubmit}>

        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-[#EAF3EE] p-3 text-[#16826B]">

              <UserCog size={25} />

            </div>

            <div>

              <h2
                id="role-modal-title"
                className="text-xl font-bold text-[#123C35]"
              >
                Assign account role
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Administrator authorization required
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close role assignment"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
          >

            <X size={22} />

          </button>

        </div>

        <div className="max-h-[65vh] space-y-5 overflow-y-auto p-6">

          <div className="rounded-xl bg-[#F6F8F5] p-4">

            <p className="font-bold text-[#123C35]">
              {user.full_name || 'Unnamed user'}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Current role: {user.role}
            </p>

            <p className="mt-1 break-all font-mono text-xs text-slate-400">
              {user.id}
            </p>

          </div>

          <div>

            <label
              htmlFor="new-role"
              className="text-sm font-semibold text-[#123C35]"
            >
              New account role
            </label>

            <select
              id="new-role"
              value={newRole}
              disabled={submitting}
              onChange={(event) => {
                setNewRole(
                  event.target.value as AssignableRole
                )
                setConfirmed(false)
              }}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >

              <option value="reviewer">
                Reviewer
              </option>

              <option value="employer">
                Employer
              </option>

            </select>

            <p className="mt-2 text-xs leading-relaxed text-slate-500">

              {newRole === 'reviewer'

                ? 'Reviewers can assess submitted professional evidence and record verification decisions.'

                : 'Employers can publish opportunities and manage applications submitted to their listings.'}

            </p>

          </div>

          <div>

            <label
              htmlFor="assignment-reason"
              className="text-sm font-semibold text-[#123C35]"
            >
              Administrative reason
            </label>

            <textarea
              id="assignment-reason"
              value={reason}
              required
              minLength={10}
              maxLength={1000}
              rows={4}
              disabled={submitting}
              onChange={(event) =>
                setReason(event.target.value)
              }
              placeholder="Explain why this account is authorized for the selected role..."
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />

            <div className="mt-1 flex justify-between text-xs text-slate-400">

              <span>Minimum 10 characters</span>

              <span>{reason.length}/1000</span>

            </div>

          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">

            <input
              type="checkbox"
              checked={confirmed}
              disabled={submitting}
              onChange={(event) =>
                setConfirmed(event.target.checked)
              }
              className="mt-1 h-4 w-4 accent-[#16826B]"
            />

            <span className="text-xs leading-relaxed text-amber-900">

              I confirm this is a dedicated account
              authorized for the selected role and
              that the user has completed the required
              onboarding. This action changes their
              platform privileges.

            </span>

          </label>

          <div className="flex items-start gap-3 rounded-xl bg-[#EAF3EE] p-4">

            <History
              size={20}
              className="shrink-0 text-[#16826B]"
            />

            <p className="text-xs leading-relaxed text-slate-600">

              Successful role assignments are recorded
              in the administrative audit log.
              Existing professional candidate accounts
              with protected records cannot be repurposed.

            </p>

          </div>

          {error && (

            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700"
            >

              <CircleAlert
                size={20}
                className="shrink-0"
              />

              {error}

            </div>

          )}

        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 p-6">

          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-[#16826B] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >

            {submitting

              ? <LoaderCircle
                  size={18}
                  className="animate-spin"
                />

              : <ShieldCheck size={18} />

            }

            {submitting
              ? 'Assigning...'
              : 'Assign role'}

          </button>

        </div>

      </form>

    </dialog>

  )
}