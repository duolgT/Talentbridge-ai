import type { UserRole } from '../types/auth'

export const ROLES = {
  CANDIDATE: 'candidate',
  REVIEWER: 'reviewer',
  EMPLOYER: 'employer',
  ADMIN: 'admin',
} as const

export const ROLE_HOME: Record<UserRole, string> = {
  candidate: '/dashboard',
  reviewer: '/reviewer/dashboard',
  employer: '/employer/dashboard',
  admin: '/admin/dashboard',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  candidate: 'Candidate',
  reviewer: 'Reviewer',
  employer: 'Employer',
  admin: 'Administrator',
}