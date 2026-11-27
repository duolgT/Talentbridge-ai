import type { Skill } from './skills'

export type OpportunityType =
  | 'employment'
  | 'freelance'
  | 'internship'
  | 'training'
  | 'volunteer'

export type WorkMode =
  | 'onsite'
  | 'remote'
  | 'hybrid'

export type OpportunityStatus =
  | 'draft'
  | 'published'
  | 'closed'

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'

export interface OpportunitySkill {
  id: string
  opportunity_id: string
  skill_id: string
  is_required: boolean
  skills: Skill
}

export interface Opportunity {
  id: string
  employer_id: string

  title: string
  organization: string
  description: string
  location: string | null

  opportunity_type: OpportunityType
  work_mode: WorkMode

  compensation: string | null
  deadline: string | null

  status: OpportunityStatus
  is_demo: boolean

  created_at: string
  updated_at: string

  opportunity_skills: OpportunitySkill[]
}

export interface SavedOpportunity {
  id: string
  candidate_id: string
  opportunity_id: string
  created_at: string
}

export interface Application {
  id: string
  candidate_id: string
  opportunity_id: string
  cover_letter: string | null
  status: ApplicationStatus
  created_at: string
  updated_at: string
}

export interface OpportunityMatch {
  opportunity: Opportunity

  matchPercentage: number | null
  requiredCoverage: number | null

  matchedSkills: OpportunitySkill[]
  verifiedMatches: OpportunitySkill[]
  selfReportedMatches: OpportunitySkill[]

  missingRequiredSkills: OpportunitySkill[]
  missingPreferredSkills: OpportunitySkill[]
}