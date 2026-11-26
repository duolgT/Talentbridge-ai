import { Link } from 'react-router-dom'

import {
  BadgeCheck,
  BriefcaseBusiness,
  ShieldCheck,
  LogOut,
  UserRound,
} from 'lucide-react'

import { useAuthStore } from '../store/authStore'
import { logoutUser } from '../services/authService'
import { ROLE_LABELS } from '../constants/roles'
import type { UserRole } from '../types/auth'

type WorkspaceRole = Exclude<UserRole, 'candidate'>

const workspaceConfig = {
  reviewer: {
    title: 'Reviewer workspace',
    description:
      'Review evidence and validate professional competencies.',
    icon: BadgeCheck,
    features: [
      'Pending reviews',
      'Verified submissions',
      'Review history',
    ],
  },

  employer: {
    title: 'Employer workspace',
    description:
      'Discover professional talent and publish opportunities.',
    icon: BriefcaseBusiness,
    features: [
      'Job opportunities',
      'Talent discovery',
      'Applications',
    ],
  },

  admin: {
    title: 'Administration workspace',
    description:
      'Manage platform operations and approved user roles.',
    icon: ShieldCheck,
    features: [
      'User management',
      'Role approvals',
      'Platform oversight',
    ],
  },
}

interface RoleDashboardProps {
  role: WorkspaceRole
}

export default function RoleDashboard({
  role,
}: RoleDashboardProps) {
  const profile = useAuthStore(
    (state) => state.profile
  )

  const config = workspaceConfig[role]

  const WorkspaceIcon = config.icon

  async function handleLogout() {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Logout failed:', error)
      window.alert('Unable to sign out.')
    }
  }

  return (
    <main className="min-h-screen bg-surface">

      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-white px-6 py-5">

        <div className="flex items-center gap-3">

          <WorkspaceIcon
            size={28}
            className="text-primary"
          />

          <div>
            <h1 className="font-bold">
              TalentBridge AI
            </h1>

            <p className="text-xs text-muted">
              {ROLE_LABELS[role]}
            </p>
          </div>

        </div>

        <div className="flex items-center gap-4">

          <Link
            to="/account/profile"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <UserRound size={18} />
            {profile?.full_name || 'My profile'}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={21} />
          </button>

        </div>

      </header>

      <section className="mx-auto max-w-7xl space-y-8 p-6 sm:p-10">

        <div className="rounded-2xl bg-primary-dark p-8 text-white">

          <WorkspaceIcon
            size={40}
            className="mb-5 text-accent"
          />

          <h2 className="text-3xl font-bold">
            {config.title}
          </h2>

          <p className="mt-3 text-white/70">
            {config.description}
          </p>

          <p className="mt-5 font-semibold text-accent">
            Welcome, {profile?.full_name}
          </p>

        </div>

        <div className="grid gap-5 md:grid-cols-3">

          {config.features.map((feature) => (
            <article
              key={feature}
              className="rounded-xl border border-border bg-white p-6"
            >

              <WorkspaceIcon
                size={24}
                className="mb-4 text-primary"
              />

              <h3 className="font-bold">
                {feature}
              </h3>

              <p className="mt-2 text-sm text-muted">
                This feature will be available
                in an upcoming development phase.
              </p>

            </article>
          ))}

        </div>

      </section>

    </main>
  )
}