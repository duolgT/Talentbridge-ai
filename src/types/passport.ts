export interface Passport {
  id: string
  candidate_id: string
  share_token: string
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface PassportSkill {
  id: string
  name: string
  category: string
  evidence_count: number
}

export interface PassportData {
  passport_id: string

  full_name: string
  professional_title: string | null
  country: string | null

  published_at: string | null

  verified_skills: PassportSkill[]

  approved_evidence_count: number

  experience_count: number
  education_count: number
}