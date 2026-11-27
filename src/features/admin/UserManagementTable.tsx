import {
  UserRound,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react'

import type { AdminUser } from '../../types/admin'
import type { UserRole } from '../../types/auth'

interface UserManagementTableProps {
  users: AdminUser[]
  currentAdminId: string
  onAssignRole?: (user: AdminUser) => void
  disabled?: boolean
}

const roleStyles: Record<UserRole, string> = {
  candidate: 'bg-blue-50 text-blue-700',
  reviewer: 'bg-amber-50 text-amber-700',
  employer: 'bg-emerald-50 text-emerald-700',
  admin: 'bg-purple-50 text-purple-700',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeZone: 'Africa/Nairobi',
  }).format(new Date(value))
}

export default function UserManagementTable({
  users,
  currentAdminId,
  onAssignRole,
  disabled = false,
}: UserManagementTableProps) {

  if (users.length === 0) {

    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">

        <Users
          size={42}
          className="mx-auto text-slate-300"
        />

        <h3 className="mt-4 font-bold text-[#123C35]">
          No users found
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Try changing your search or role filter.
        </p>

      </div>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="overflow-x-auto">

        <table className="w-full min-w-[760px] text-left text-sm">

          <thead className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500">

            <tr>

              <th scope="col" className="px-6 py-4">
                User
              </th>

              <th scope="col" className="px-6 py-4">
                Account role
              </th>

              <th scope="col" className="px-6 py-4">
                Registered
              </th>

              <th scope="col" className="px-6 py-4">
                Actions
              </th>

            </tr>

          </thead>

          <tbody className="divide-y divide-slate-100">

            {users.map((user) => {

              const isCurrentAdmin =
                user.id === currentAdminId

              const canAssign =
                user.role === 'candidate' &&
                !isCurrentAdmin &&
                Boolean(onAssignRole)

              const initials =
                user.full_name
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')
                  .toUpperCase() || 'U'

              return (

                <tr
                  key={user.id}
                  className="hover:bg-slate-50/70"
                >

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF3EE] font-bold text-[#16826B]">
                        {initials}
                      </div>

                      <div>

                        <p className="font-semibold text-[#123C35]">

                          {user.full_name || 'Unnamed user'}

                          {isCurrentAdmin && (
                            <span className="ml-2 text-xs font-normal text-slate-400">
                              (You)
                            </span>
                          )}

                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {user.professional_title || 'No professional title'}
                        </p>

                        <p
                          title={user.id}
                          className="mt-1 font-mono text-[11px] text-slate-400"
                        >
                          ID: {user.id.slice(0, 8)}
                        </p>

                      </div>

                    </div>

                  </td>

                  <td className="px-6 py-5">

                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${roleStyles[user.role]}`}>

                      {user.role === 'admin' ||
                       user.role === 'reviewer'

                        ? <ShieldCheck size={14} />

                        : <UserRound size={14} />

                      }

                      {user.role}

                    </span>

                  </td>

                  <td className="px-6 py-5 text-slate-500">
                    {formatDate(user.created_at)}
                  </td>

                  <td className="px-6 py-5">

                    {canAssign ? (

                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onAssignRole?.(user)}
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-[#16826B] hover:bg-emerald-50 disabled:opacity-50"
                      >

                        <UserCog size={15} />

                        Assign role

                      </button>

                    ) : (

                      <span className="text-xs text-slate-400">

                        {isCurrentAdmin
                          ? 'Current account'
                          : 'No role actions'}

                      </span>

                    )}

                  </td>

                </tr>

              )
            })}

          </tbody>

        </table>

      </div>

    </section>
  )
}