import { supabase } from '../lib/supabase'

import type {
  Opportunity,
  Application,
} from '../types/opportunity'

import type {
  OpportunityInput,
  OpportunitySkillInput,
  EmployerApplication,
  EmployerApplicationDecision,
  EmployerDashboardData,
  EmployerDashboardStats,
} from '../types/employer'

// ==========================================
// GET EMPLOYER OPPORTUNITIES
// ==========================================

export async function getEmployerOpportunities(
  employerId: string
): Promise<Opportunity[]> {

  const { data, error } = await supabase
    .from('opportunities')
    .select(`
      *,
      opportunity_skills (
        *,
        skills (*)
      )
    `)
    .eq('employer_id', employerId)
    .order('created_at', {
      ascending: false,
    })

  if (error) throw error

  return data as Opportunity[]
}

// ==========================================
// GET SINGLE OPPORTUNITY
// ==========================================

export async function getEmployerOpportunity(
  employerId: string,
  opportunityId: string
): Promise<Opportunity> {

  const { data, error } = await supabase
    .from('opportunities')
    .select(`
      *,
      opportunity_skills (
        *,
        skills (*)
      )
    `)
    .eq('id', opportunityId)
    .eq('employer_id', employerId)
    .single()

  if (error) throw error

  return data as Opportunity
}

// ==========================================
// CREATE DRAFT OPPORTUNITY
// ==========================================

export async function createOpportunity(
  employerId: string,
  input: OpportunityInput
): Promise<Opportunity> {

  const { data, error } = await supabase
    .from('opportunities')
    .insert({
      ...input,
      employer_id: employerId,
    })
    .select(`
      *,
      opportunity_skills (
        *,
        skills (*)
      )
    `)
    .single()

  if (error) throw error

  return data as Opportunity
}

// ==========================================
// UPDATE DRAFT OPPORTUNITY
// ==========================================

export async function updateOpportunity(
  employerId: string,
  opportunityId: string,
  input: OpportunityInput
): Promise<Opportunity> {

  const { data, error } = await supabase
    .from('opportunities')
    .update(input)
    .eq('id', opportunityId)
    .eq('employer_id', employerId)
    .eq('status', 'draft')
    .select(`
      *,
      opportunity_skills (
        *,
        skills (*)
      )
    `)
    .single()

  if (error) throw error

  return data as Opportunity
}

// ==========================================
// ADD OPPORTUNITY SKILL
// ==========================================

export async function addOpportunitySkill(
  opportunityId: string,
  input: OpportunitySkillInput
): Promise<void> {

  const { error } = await supabase
    .from('opportunity_skills')
    .insert({
      opportunity_id: opportunityId,
      skill_id: input.skill_id,
      is_required: input.is_required,
    })

  if (error) throw error
}

// ==========================================
// REMOVE OPPORTUNITY SKILL
// ==========================================

export async function removeOpportunitySkill(
  opportunityId: string,
  skillRecordId: string
): Promise<void> {

  const { error } = await supabase
    .from('opportunity_skills')
    .delete()
    .eq('id', skillRecordId)
    .eq('opportunity_id', opportunityId)
    .select('id')
    .single()

  if (error) throw error
}

// ==========================================
// PUBLISH OPPORTUNITY
// ==========================================

export async function publishOpportunity(
  opportunityId: string
): Promise<void> {

  const { error } = await supabase.rpc(
    'publish_opportunity',
    {
      p_opportunity_id: opportunityId,
    }
  )

  if (error) throw error
}

// ==========================================
// CLOSE OPPORTUNITY
// ==========================================

export async function closeOpportunity(
  opportunityId: string
): Promise<void> {

  const { error } = await supabase.rpc(
    'close_opportunity',
    {
      p_opportunity_id: opportunityId,
    }
  )

  if (error) throw error
}

// ==========================================
// GET EMPLOYER APPLICATIONS
// ==========================================

export async function getEmployerApplications(
  employerId: string
): Promise<EmployerApplication[]> {

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      opportunities!inner (
        id,
        title,
        organization
      )
    `)
    .eq('opportunities.employer_id', employerId)
    .order('created_at', {
      ascending: false,
    })

  if (error) throw error

  return data as EmployerApplication[]
}

// ==========================================
// UPDATE APPLICATION STATUS
// ==========================================

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: EmployerApplicationDecision
): Promise<Application> {

  const { data, error } = await supabase.rpc(
    'update_application_status',
    {
      p_application_id: applicationId,
      p_new_status: newStatus,
    }
  )

  if (error) throw error

  return data as Application
}

// ==========================================
// CALCULATE DASHBOARD STATISTICS
// ==========================================

export function calculateEmployerStats(
  opportunities: Opportunity[],
  applications: EmployerApplication[]
): EmployerDashboardStats {

  return {
    totalOpportunities: opportunities.length,

    publishedOpportunities: opportunities.filter(
      (item) => item.status === 'published'
    ).length,

    draftOpportunities: opportunities.filter(
      (item) => item.status === 'draft'
    ).length,

    closedOpportunities: opportunities.filter(
      (item) => item.status === 'closed'
    ).length,

    totalApplications: applications.length,

    underReview: applications.filter(
      (item) => item.status === 'under_review'
    ).length,

    shortlisted: applications.filter(
      (item) => item.status === 'shortlisted'
    ).length,

    accepted: applications.filter(
      (item) => item.status === 'accepted'
    ).length,

    rejected: applications.filter(
      (item) => item.status === 'rejected'
    ).length,
  }
}

// ==========================================
// GET EMPLOYER DASHBOARD DATA
// ==========================================

export async function getEmployerDashboardData(
  employerId: string
): Promise<EmployerDashboardData> {

  const [opportunities, applications] =
    await Promise.all([
      getEmployerOpportunities(employerId),
      getEmployerApplications(employerId),
    ])

  const stats = calculateEmployerStats(
    opportunities,
    applications
  )

  return {
    opportunities,
    applications,
    stats,
  }
}