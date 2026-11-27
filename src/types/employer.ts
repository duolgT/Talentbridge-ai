import type {
  OpportunityType,
  WorkMode,
  ApplicationStatus,
  Application,
  Opportunity,
} from './opportunity'

export interface OpportunityInput {
  title: string
  organization: string
  description: string
  location: string | null
  opportunity_type: OpportunityType
  work_mode: WorkMode
  compensation: string | null
  deadline: string | null
}

export interface OpportunitySkillInput {
  skill_id: string
  is_required: boolean
}

export interface EmployerApplication extends Application {
  opportunities: {
    id: string
    title: string
    organization: string
  }
}

export type EmployerApplicationDecision =
  | 'under_review'
  | 'shortlisted'
  | 'accepted'
  | 'rejected'

export interface EmployerDashboardStats {
  totalOpportunities: number
  publishedOpportunities: number
  draftOpportunities: number
  closedOpportunities: number

  totalApplications: number
  underReview: number
  shortlisted: number
  accepted: number
  rejected: number
}

export interface EmployerDashboardData {
  opportunities: Opportunity[]
  applications: EmployerApplication[]
  stats: EmployerDashboardStats
}

export type ApplicationTransitionMap = Record<
  ApplicationStatus,
  EmployerApplicationDecision[]
>