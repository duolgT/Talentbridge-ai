export type SkillStatus =
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'rejected'

export type SkillSource =
  | 'manual'
  | 'rule_based'
  | 'ai_generated'

export interface Skill {
  id: string
  name: string
  category: string
  keywords: string[]
  description: string | null
  created_at: string
}

export interface CandidateSkill {
  id: string
  candidate_id: string
  skill_id: string
  source: SkillSource
  status: SkillStatus
  created_at: string
  skills: Skill
}

export interface SkillSuggestion {
  skill: Skill
  matchedKeywords: string[]
  matchedSources: string[]
}