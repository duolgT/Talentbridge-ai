import { supabase } from '../lib/supabase'

import type {
  HistoryKind,
  HistoryRecord,
  ExperienceInput,
  EducationInput,
} from '../types/professional'

type HistoryInput =
  | ExperienceInput
  | EducationInput

// READ

export async function getHistory(
  kind: HistoryKind,
  candidateId: string
): Promise<HistoryRecord[]> {

  const { data, error } = await supabase
    .from(kind)
    .select('*')
    .eq('candidate_id', candidateId)
    .order('created_at', {
      ascending: false,
    })

  if (error) throw error

  return data as HistoryRecord[]
}

// CREATE

export async function createHistory(
  kind: HistoryKind,
  candidateId: string,
  input: HistoryInput
): Promise<HistoryRecord> {

  const { data, error } = await supabase
    .from(kind)
    .insert({
      ...input,
      candidate_id: candidateId,
    })
    .select()
    .single()

  if (error) throw error

  return data as HistoryRecord
}

// UPDATE

export async function updateHistory(
  kind: HistoryKind,
  candidateId: string,
  id: string,
  input: HistoryInput
): Promise<HistoryRecord> {

  const { data, error } = await supabase
    .from(kind)
    .update(input)
    .eq('id', id)
    .eq('candidate_id', candidateId)
    .select()
    .single()

  if (error) throw error

  return data as HistoryRecord
}

// DELETE

export async function deleteHistory(
  kind: HistoryKind,
  candidateId: string,
  id: string
) {

  const { error } = await supabase
    .from(kind)
    .delete()
    .eq('id', id)
    .eq('candidate_id', candidateId)
    .select('id')
    .single()

  if (error) throw error
}