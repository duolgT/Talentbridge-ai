import { supabase } from '../lib/supabase'

import type {
  Skill,
  CandidateSkill,
} from '../types/skills'

export async function getSkills(): Promise<Skill[]> {

  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('name')

  if (error) throw error

  return data as Skill[]
}

export async function getCandidateSkills(
  candidateId: string
): Promise<CandidateSkill[]> {

  const { data, error } = await supabase
    .from('candidate_skills')
    .select('*, skills(*)')
    .eq('candidate_id', candidateId)
    .order('created_at', {
      ascending: false,
    })

  if (error) throw error

  return data as CandidateSkill[]
}

export async function addCandidateSkill(
  candidateId: string,
  skillId: string,
  source: 'manual' | 'rule_based'
): Promise<CandidateSkill> {

  const { data, error } = await supabase
    .from('candidate_skills')
    .insert({
      candidate_id: candidateId,
      skill_id: skillId,
      source,
    })
    .select('*, skills(*)')
    .single()

  if (error) throw error

  return data as CandidateSkill
}

export async function removeCandidateSkill(
  candidateId: string,
  recordId: string
) {

  const { error } = await supabase
    .from('candidate_skills')
    .delete()
    .eq('candidate_id', candidateId)
    .eq('id', recordId)
    .eq('status', 'unverified')
    .select('id')
    .single()

  if (error) throw error
}