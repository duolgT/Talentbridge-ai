export type ManualTaskKey =
  | 'cv_prepared'
  | 'interview_prepared'
  | 'employment_information_reviewed'
  | 'career_goals_defined'
  | 'opportunity_preferences_defined'
  | 'references_prepared'

export type AutomaticTaskKey =
  | 'profile_completed'
  | 'history_documented'
  | 'skills_identified'
  | 'evidence_uploaded'
  | 'skills_verified'
  | 'passport_generated'

export type ReadinessTaskKey =
  | ManualTaskKey
  | AutomaticTaskKey

export type ReadinessCategory =
  | 'profile'
  | 'history'
  | 'credentials'
  | 'career'

export interface ReadinessProgress {
  id: string
  candidate_id: string
  task_key: ManualTaskKey
  completed_at: string
}

export interface ReadinessTask {
  key: ReadinessTaskKey
  title: string
  description: string
  points: number
  category: ReadinessCategory
  type: 'automatic' | 'manual'
  completed: boolean
  actionLabel?: string
  actionPath?: string
}

export interface ReadinessSnapshot {
  profileCompleted: boolean
  experienceCount: number
  educationCount: number
  skillCount: number
  evidenceCount: number
  verifiedSkillCount: number
  passportGenerated: boolean
  completedManualTasks: ManualTaskKey[]
}

export interface ReadinessResult {
  score: number
  completedCount: number
  totalTasks: number
  tasks: ReadinessTask[]
  recommendations: ReadinessTask[]
}