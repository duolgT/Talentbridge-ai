export interface Experience {
  id: string
  candidate_id: string
  job_title: string
  organization: string
  location: string | null
  employment_type: string
  start_date: string
  end_date: string | null
  is_current: boolean
  description: string | null
  created_at: string
  updated_at: string
}

export interface Education {
  id: string
  candidate_id: string
  institution: string
  qualification: string
  field_of_study: string | null
  country: string | null
  start_year: number | null
  graduation_year: number | null
  is_current: boolean
  description: string | null
  created_at: string
  updated_at: string
}

type ManagedFields =
  | 'id'
  | 'candidate_id'
  | 'created_at'
  | 'updated_at'

export type ExperienceInput = Omit<
  Experience,
  ManagedFields
>

export type EducationInput = Omit<
  Education,
  ManagedFields
>

export type HistoryKind =
  | 'experiences'
  | 'education'

export type HistoryRecord =
  | Experience
  | Education