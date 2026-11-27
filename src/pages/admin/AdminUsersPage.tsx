import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  Users,
  UserRound,
  ShieldCheck,
  BriefcaseBusiness,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  CircleAlert,
  CheckCircle2,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import { useAuthStore } from '../../store/authStore'

import {
  searchAdminUsers,
  getAdminDashboardStats,
  assignUserRole,
} from '../../services/adminService'

import UserManagementTable from '../../features/admin/UserManagementTable'

import RoleAssignmentModal from '../../features/admin/RoleAssignmentModal'

import type {
  AdminUser,
  AdminDashboardStats,
  AdminRoleFilter,
  RoleAssignmentInput,
} from '../../types/admin'

const PAGE_SIZE = 20

interface DirectoryProps {
  reviewersOnly?: boolean
}

function getErrorMessage(error: unknown): string {

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    return String(error.message)
  }

  return 'Unable to load the user directory.'
}

export default function AdminUsersPage({
  reviewersOnly = false,
}: DirectoryProps) {

  const profile = useAuthStore(
    (state) => state.profile
  )

  if (!profile) return null

  return (

    <UserDirectory
      key={`${profile.id}-${reviewersOnly}`}
      adminId={profile.id}
      reviewersOnly={reviewersOnly}
    />

  )
}

function UserDirectory({
  adminId,
  reviewersOnly,
}: {
  adminId: string
  reviewersOnly: boolean
}) {

  const [users, setUsers] =
    useState<AdminUser[]>([])

  const [stats, setStats] =
    useState<AdminDashboardStats | null>(null)

  const [searchInput, setSearchInput] =
    useState('')

  const [search, setSearch] =
    useState('')

  const [roleFilter, setRoleFilter] =
    useState<AdminRoleFilter>(
      reviewersOnly ? 'reviewer' : 'all'
    )

  const [page, setPage] =
    useState(0)

  const [hasMore, setHasMore] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [reloadKey, setReloadKey] =
    useState(0)

  const [selectedUser, setSelectedUser] =
    useState<AdminUser | null>(null)

  // ========================================
  // FETCH USER DIRECTORY
  // ========================================

  useEffect(() => {

    let active = true

    Promise.all([

      searchAdminUsers({
        search,
        role: roleFilter,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),

      getAdminDashboardStats(),

    ])
      .then(([result, dashboardStats]) => {

        if (!active) return

        setUsers(result.users)
        setHasMore(result.hasMore)
        setStats(dashboardStats)

      })
      .catch((err: unknown) => {

        if (!active) return

        setError(getErrorMessage(err))

        setUsers([])
        setStats(null)
        setHasMore(false)

      })
      .finally(() => {

        if (active) setLoading(false)

      })

    return () => {
      active = false
    }

  }, [search, roleFilter, page, reloadKey])

  // ========================================
  // SEARCH AND PAGINATION
  // ========================================

  function prepareReload() {
    setLoading(true)
    setError('')
    setUsers([])
    setHasMore(false)
  }

  function handleSearch(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault()

    prepareReload()
    setMessage('')
    setPage(0)
    setSearch(searchInput.trim())

    setReloadKey(
      (previous) => previous + 1
    )

  }

  function changeRoleFilter(
    role: AdminRoleFilter
  ) {

    if (role === roleFilter) return

    prepareReload()
    setMessage('')
    setPage(0)
    setRoleFilter(role)

  }

  function changePage(nextPage: number) {

    if (loading || nextPage < 0) return

    prepareReload()
    setPage(nextPage)

  }

  function refresh() {

    if (loading) return

    prepareReload()
    setMessage('')

    setReloadKey(
      (previous) => previous + 1
    )

  }

  function resetFilters() {

    prepareReload()

    setMessage('')
    setSearchInput('')
    setSearch('')
    setPage(0)

    setRoleFilter(
      reviewersOnly ? 'reviewer' : 'all'
    )

    setReloadKey(
      (previous) => previous + 1
    )

  }

  // ========================================
  // PRIVILEGED ROLE ASSIGNMENT
  // ========================================

  async function handleRoleAssignment(
    input: RoleAssignmentInput
  ) {

    if (
      !selectedUser ||
      selectedUser.id !== input.userId ||
      selectedUser.role !== 'candidate' ||
      input.userId === adminId
    ) {

      throw new Error(
        'Invalid account role assignment.'
      )

    }

    await assignUserRole(input)

    setSelectedUser(null)

    setMessage(
      `Account successfully assigned the ${input.newRole} role. The user should sign out and sign in again.`
    )

    prepareReload()
    setPage(0)

    setReloadKey(
      (previous) => previous + 1
    )

  }

  const statistics = stats

    ? [

        {
          label: 'Total users',
          value: stats.total_users,
          icon: Users,
        },

        {
          label: 'Candidates',
          value: stats.total_candidates,
          icon: UserRound,
        },

        {
          label: 'Reviewers',
          value: stats.total_reviewers,
          icon: ShieldCheck,
        },

        {
          label: 'Employers',
          value: stats.total_employers,
          icon: BriefcaseBusiness,
        },

      ]

    : []

  return (

    <div className="mx-auto max-w-7xl space-y-6">

      {/* Page heading */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>

          <h1 className="text-3xl font-extrabold text-[#123C35]">

            {reviewersOnly
              ? 'Reviewer management'
              : 'User management'}

          </h1>

          <p className="mt-2 text-sm text-slate-500">

            {reviewersOnly

              ? 'Oversee authorized professional evidence reviewers.'

              : 'Manage registered UjuziLink accounts and controlled role assignments.'}

          </p>

        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#123C35] disabled:opacity-50"
        >

          <RefreshCw
            size={18}
            className={loading ? 'animate-spin' : ''}
          />

          Refresh

        </button>

      </div>

      {/* Management banner */}

      <section className="rounded-3xl bg-[#123C35] p-7 text-white">

        <ShieldCheck
          size={35}
          className="text-[#D5F76A]"
        />

        <h2 className="mt-4 text-2xl font-bold">

          {reviewersOnly

            ? 'Maintain professional verification standards.'

            : 'Manage access. Protect platform integrity.'}

        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">

          {reviewersOnly

            ? 'Reviewer accounts have privileged access to submitted evidence. Only authorized and appropriately onboarded individuals should receive this role.'

            : 'Assign platform roles responsibly. Administrative changes are authorized by the database and recorded in the audit log.'}

        </p>

        {reviewersOnly && (

          <Link
            to="/admin/users"
            className="mt-5 inline-flex rounded-xl bg-[#D5F76A] px-5 py-3 text-sm font-bold text-[#123C35]"
          >

            Manage reviewer onboarding

          </Link>

        )}

      </section>

      {/* Feedback */}

      {error && (

        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >

          <CircleAlert size={20} className="shrink-0" />

          {error}

        </div>

      )}

      {message && (

        <div
          role="status"
          className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700"
        >

          <CheckCircle2 size={20} className="shrink-0" />

          {message}

        </div>

      )}

      {/* Statistics */}

      {stats && (

        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">

          {statistics.map((item) => (

            <article
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >

              <div className="inline-flex rounded-xl bg-[#EAF3EE] p-3 text-[#16826B]">

                <item.icon size={23} />

              </div>

              <p className="mt-4 text-3xl font-extrabold text-[#123C35]">

                {item.value}

              </p>

              <p className="mt-2 text-sm text-slate-500">

                {item.label}

              </p>

            </article>

          ))}

        </section>

      )}

      {/* Search and filters */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">

        <div className="flex flex-wrap gap-3">

          <form
            onSubmit={handleSearch}
            className="flex min-w-0 flex-1 gap-2"
          >

            <div className="relative min-w-0 flex-1">

              <Search
                size={18}
                className="absolute left-4 top-3.5 text-slate-400"
              />

              <input
                type="search"
                aria-label="Search registered users"
                value={searchInput}
                maxLength={200}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search name, title or user ID..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm"
              />

            </div>

            <button
              type="submit"
              className="rounded-xl bg-[#16826B] px-4 py-3 text-sm font-semibold text-white"
            >

              Search

            </button>

          </form>

          {!reviewersOnly && (

            <select
              aria-label="Filter account role"
              value={roleFilter}
              onChange={(event) =>
                changeRoleFilter(
                  event.target.value as AdminRoleFilter
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >

              <option value="all">
                All roles
              </option>

              <option value="candidate">
                Candidates
              </option>

              <option value="reviewer">
                Reviewers
              </option>

              <option value="employer">
                Employers
              </option>

              <option value="admin">
                Administrators
              </option>

            </select>

          )}

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
          >

            Reset

          </button>

        </div>

      </section>

      {/* User directory */}

      <div className="flex flex-wrap items-center justify-between gap-3">

        <h2 className="text-lg font-bold text-[#123C35]">

          {reviewersOnly
            ? 'Registered reviewers'
            : 'Registered users'}

        </h2>

        {!loading && !error && (

          <p className="text-sm text-slate-500">

            {users.length} records on this page

          </p>

        )}

      </div>

      {loading ? (

        <div
          role="status"
          className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-16"
        >

          <LoaderCircle
            size={36}
            className="animate-spin text-[#16826B]"
          />

          <p className="mt-4 text-sm text-slate-500">

            Loading user directory...

          </p>

        </div>

      ) : !error ? (

        <>

          <UserManagementTable
            users={users}
            currentAdminId={adminId}
            onAssignRole={
              reviewersOnly
                ? undefined
                : setSelectedUser
            }
          />

          {/* Pagination */}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">

            <p className="text-sm text-slate-500">

              Page {page + 1}

              {users.length > 0 &&
                ` · Records ${page * PAGE_SIZE + 1}–${page * PAGE_SIZE + users.length}`}

            </p>

            <div className="flex items-center gap-3">

              <button
                type="button"
                disabled={page === 0 || loading}
                onClick={() => changePage(page - 1)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:opacity-40"
              >

                <ChevronLeft size={17} />

                Previous

              </button>

              <button
                type="button"
                disabled={!hasMore || loading}
                onClick={() => changePage(page + 1)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:opacity-40"
              >

                Next

                <ChevronRight size={17} />

              </button>

            </div>

          </div>

        </>

      ) : null}

      {/* Privacy and permissions */}

      <section className="rounded-xl border border-emerald-100 bg-[#EAF3EE] p-5">

        <div className="flex items-start gap-3">

          <ShieldCheck
            size={22}
            className="shrink-0 text-[#16826B]"
          />

          <div>

            <h3 className="font-semibold text-[#123C35]">

              Controlled administrative access

            </h3>

            <p className="mt-2 text-xs leading-relaxed text-slate-600">

              This directory does not expose passwords,
              authentication credentials, private evidence
              documents or unpublished skills passports.
              Role assignment is restricted to eligible
              dedicated accounts.

            </p>

          </div>

        </div>

      </section>

      {/* Role assignment dialog */}

      {selectedUser && !reviewersOnly && (

        <RoleAssignmentModal
          key={selectedUser.id}
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSubmit={handleRoleAssignment}
        />

      )}

    </div>

  )
}