import { supabase } from '../lib/supabase'

import type {
  Opportunity,
  SavedOpportunity,
  Application,
} from '../types/opportunity'

// Retrieve published opportunities

export async function getOpportunities():
  Promise<Opportunity[]> {

  const { data, error } = await supabase
    .from('opportunities')
    .select(`
      *,
      opportunity_skills (
        *,
        skills (*)
      )
    `)
    .eq('status', 'published')
    .order('created_at', {
      ascending: false,
    })

  if (error) throw error

  return data as Opportunity[]
}

// Retrieve saved opportunities

export async function getSavedOpportunities(
  candidateId: string
): Promise<SavedOpportunity[]> {

  const { data, error } = await supabase
    .from('saved_opportunities')
    .select('*')
    .eq('candidate_id', candidateId)

  if (error) throw error

  return data as SavedOpportunity[]
}

// Save opportunity

export async function saveOpportunity(
  candidateId: string,
  opportunityId: string
) {

  const { error } = await supabase
    .from('saved_opportunities')
    .insert({
      candidate_id: candidateId,
      opportunity_id: opportunityId,
    })

  if (error && error.code !== '23505') {
    throw error
  }
}

// Remove saved opportunity

export async function unsaveOpportunity(
  candidateId: string,
  opportunityId: string
) {

  const { error } = await supabase
    .from('saved_opportunities')
    .delete()
    .eq('candidate_id', candidateId)
    .eq('opportunity_id', opportunityId)

  if (error) throw error
}

// Retrieve candidate applications

export async function getApplications(
  candidateId: string
): Promise<Application[]> {

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('created_at', {
      ascending: false,
    })

  if (error) throw error

  return data as Application[]
}

// Submit application

export async function applyForOpportunity(
  candidateId: string,
  opportunityId: string,
  coverLetter: string
): Promise<Application> {

  const { data, error } = await supabase
    .from('applications')
    .insert({
      candidate_id: candidateId,
      opportunity_id: opportunityId,
      cover_letter: coverLetter.trim() || null,
    })
    .select()
    .single()

  if (error) throw error

  return data as Application
}