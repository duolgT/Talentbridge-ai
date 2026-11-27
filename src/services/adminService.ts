
import type {
  AdminOpportunity,
  AdminOpportunitySearchParams,
  AdminOpportunitiesResult,
  AdminCloseOpportunityInput,
} from '../types/admin'



import type {
  AdminUserSearchParams,
  AdminUsersResult,
} from '../types/admin'


import { supabase } from '../lib/supabase'

import type {
  AdminDashboardStats,
  AdminDashboardData,
  AdminUser,
  AdminAuditLog,
  RoleAssignmentInput,
} from '../types/admin'

// ==========================================
// PLATFORM STATISTICS
// ==========================================

export async function getAdminDashboardStats():
  Promise<AdminDashboardStats> {

  const { data, error } = await supabase.rpc(
    'get_admin_dashboard_stats'
  )

  if (error) throw error

  if (!data) {
    throw new Error(
      'Administrator statistics are unavailable.'
    )
  }

  return data as AdminDashboardStats
}

// ==========================================
// USER DIRECTORY
// ==========================================

export async function getAdminUsers(
  limit = 50,
  offset = 0
): Promise<AdminUser[]> {

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new Error(
      'Invalid user pagination parameters.'
    )
  }

  const { data, error } = await supabase.rpc(
    'get_admin_users',
    {
      p_limit: limit,
      p_offset: offset,
    }
  )

  if (error) throw error

  return (data ?? []) as AdminUser[]
}

// ==========================================
// ROLE ASSIGNMENT
// ==========================================

export async function assignUserRole(
  input: RoleAssignmentInput
): Promise<void> {

  const reason = input.reason.trim()

  if (
    input.newRole !== 'reviewer' &&
    input.newRole !== 'employer'
  ) {
    throw new Error(
      'Unsupported role assignment.'
    )
  }

  if (
    reason.length < 10 ||
    reason.length > 1000
  ) {
    throw new Error(
      'Provide a reason between 10 and 1000 characters.'
    )
  }

  const { error } = await supabase.rpc(
    'admin_assign_role',
    {
      p_user_id: input.userId,
      p_new_role: input.newRole,
      p_reason: reason,
    }
  )

  if (error) throw error
}

// ==========================================
// ADMINISTRATIVE AUDIT LOGS
// ==========================================

export async function getAdminAuditLogs(
  limit = 50,
  offset = 0
): Promise<AdminAuditLog[]> {

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new Error(
      'Invalid audit log pagination parameters.'
    )
  }

  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', {
      ascending: false,
    })
    .order('id', {
      ascending: false,
    })
    .range(offset, offset + limit - 1)

  if (error) throw error

  return (data ?? []) as AdminAuditLog[]
}

// ==========================================
// COMBINED DASHBOARD DATA
// ==========================================

export async function getAdminDashboardData():
  Promise<AdminDashboardData> {

  const [
    stats,
    recentUsers,
    recentAuditLogs,
  ] = await Promise.all([

    getAdminDashboardStats(),

    getAdminUsers(5, 0),

    getAdminAuditLogs(5, 0),

  ])

  return {
    stats,
    recentUsers,
    recentAuditLogs,
  }
}

export async function searchAdminUsers({
  search = '',
  role = 'all',
  limit = 20,
  offset = 0,
}: AdminUserSearchParams = {}):
  Promise<AdminUsersResult> {

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 99 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new Error(
      'Invalid pagination parameters.'
    )
  }

  const { data, error } = await supabase.rpc(
    'search_admin_users',
    {
      p_search: search.trim(),
      p_role: role,
      p_limit: limit + 1,
      p_offset: offset,
    }
  )

  if (error) throw error

  const records = (data ?? []) as AdminUser[]

  return {
    users: records.slice(0, limit),
    hasMore: records.length > limit,
  }
}


export async function getAdminOpportunities({
  search = '',
  status = 'all',
  limit = 20,
  offset = 0,
}: AdminOpportunitySearchParams = {}):
  Promise<AdminOpportunitiesResult> {

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 99 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new Error('Invalid pagination parameters.')
  }

  const { data, error } = await supabase.rpc(
    'get_admin_opportunities',
    {
      p_search: search.trim(),
      p_status: status,
      p_limit: limit + 1,
      p_offset: offset,
    }
  )

  if (error) throw error

  const records = (data ?? []) as AdminOpportunity[]

  return {
    opportunities: records.slice(0, limit),
    hasMore: records.length > limit,
  }
}


export async function adminCloseOpportunity({
  opportunityId,
  reason,
}: AdminCloseOpportunityInput): Promise<void> {

  const cleanReason = reason.trim()

  if (
    cleanReason.length < 10 ||
    cleanReason.length > 1000
  ) {
    throw new Error(
      'Provide a reason between 10 and 1000 characters.'
    )
  }

  const { error } = await supabase.rpc(
    'admin_close_opportunity',
    {
      p_opportunity_id: opportunityId,
      p_reason: cleanReason,
    }
  )

  if (error) throw error
}