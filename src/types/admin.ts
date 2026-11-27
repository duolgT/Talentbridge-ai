import type { UserRole } from './auth'

export interface AdminDashboardStats {
  // Users
  total_users: number
  total_candidates: number
  total_employers: number
  total_reviewers: number
  total_admins: number

  // Skills
  total_candidate_skills: number
  verified_skills: number

  // Evidence
  total_evidence: number
  pending_evidence: number
  approved_evidence: number
  rejected_evidence: number

  // Passports
  total_passports: number
  published_passports: number

  // Opportunities
  total_opportunities: number
  active_opportunities: number
  demo_opportunities: number
  closed_opportunities: number

  // Applications
  total_applications: number
  shortlisted_applications: number
  accepted_applications: number

  // Reviews
  total_reviews: number
}

export interface AdminUser {
  id: string
  full_name: string
  role: UserRole
  professional_title: string | null
  created_at: string
  updated_at: string
}

export type AssignableRole =
  | 'reviewer'
  | 'employer'

export interface RoleAssignmentInput {
  userId: string
  newRole: AssignableRole
  reason: string
}

export interface AdminAuditLog {
  id: string
  admin_id: string
  action: string
  target_type: string
  target_id: string | null
  previous_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  reason: string | null
  created_at: string
}

export interface AdminDashboardData {
  stats: AdminDashboardStats
  recentUsers: AdminUser[]
  recentAuditLogs: AdminAuditLog[]
}

export type AdminRoleFilter =
  | UserRole
  | 'all'

export interface AdminUserSearchParams {
  search?: string
  role?: AdminRoleFilter
  limit?: number
  offset?: number
}

export interface AdminUsersResult {
  users: AdminUser[]
  hasMore: boolean
}

export type AdminOpportunityStatus =
  | 'draft'
  | 'published'
  | 'closed'

export type AdminOpportunityFilter =
  | AdminOpportunityStatus
  | 'all'

export interface AdminOpportunity {
  id: string
  employer_id: string
  employer_name: string
  title: string
  organization: string
  description: string
  location: string | null
  opportunity_type: string
  work_mode: string
  compensation: string | null
  deadline: string | null
  status: AdminOpportunityStatus
  is_demo: boolean
  application_count: number
  created_at: string
  updated_at: string
}

export interface AdminOpportunitySearchParams {
  search?: string
  status?: AdminOpportunityFilter
  limit?: number
  offset?: number
}

export interface AdminOpportunitiesResult {
  opportunities: AdminOpportunity[]
  hasMore: boolean
}

export interface AdminCloseOpportunityInput {
  opportunityId: string
  reason: string
}