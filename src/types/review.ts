export type ReviewDecision =
  | 'approved'
  | 'rejected'

export interface Review {
  id: string
  evidence_id: string
  reviewer_id: string
  decision: ReviewDecision
  feedback: string
  created_at: string
}

export interface ReviewQueueItem {
  id: string
  title: string
  evidence_type: string
  description: string | null
  file_path: string
  file_name: string
  skill_name: string
  created_at: string
}