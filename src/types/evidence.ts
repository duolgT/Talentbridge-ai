export type EvidenceType =
  | 'certificate'
  | 'work_sample'
  | 'reference_letter'
  | 'qualification'
  | 'other'

export type EvidenceStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'

export interface Evidence {
  id: string
  candidate_id: string
  candidate_skill_id: string

  title: string
  evidence_type: EvidenceType
  description: string | null

  file_path: string
  file_name: string
  file_type: string
  file_size: number

  status: EvidenceStatus

  created_at: string
  updated_at: string
}

export interface EvidenceInput {
  title: string
  evidence_type: EvidenceType
  candidate_skill_id: string
  description: string
  file: File
}