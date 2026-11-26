import { supabase } from '../lib/supabase'

import type {
  Review,
  ReviewDecision,
  ReviewQueueItem,
} from '../types/review'

export async function submitEvidence(
  evidenceId: string
) {
  const { error } = await supabase.rpc(
    'submit_evidence',
    {
      p_evidence_id: evidenceId,
    }
  )

  if (error) throw error
}

export async function getReviewQueue():
  Promise<ReviewQueueItem[]> {

  const { data, error } = await supabase.rpc(
    'get_review_queue'
  )

  if (error) throw error

  return data as ReviewQueueItem[]
}

export async function reviewEvidence(
  evidenceId: string,
  decision: ReviewDecision,
  feedback: string
) {

  const { error } = await supabase.rpc(
    'review_evidence',
    {
      p_evidence_id: evidenceId,
      p_decision: decision,
      p_feedback: feedback,
    }
  )

  if (error) throw error
}

export async function getMyReviews(
  reviewerId: string
): Promise<Review[]> {

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewer_id', reviewerId)
    .order('created_at', {
      ascending: false,
    })

  if (error) throw error

  return data as Review[]
}

export async function getEvidenceReviews():
  Promise<Review[]> {

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', {
      ascending: false,
    })

  if (error) throw error

  return data as Review[]
}