import { supabase } from '../lib/supabase'

import type {
  Evidence,
  EvidenceInput,
} from '../types/evidence'

const BUCKET = 'evidence-documents'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const FILE_EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
}

export function validateEvidenceFile(file: File) {
  if (!FILE_EXTENSIONS[file.type]) {
    throw new Error(
      'Only PDF, PNG and JPEG files are allowed.'
    )
  }

  if (file.size === 0) {
    throw new Error('The selected file is empty.')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      'File size must not exceed 5 MB.'
    )
  }
}

export async function getEvidence(
  candidateId: string
): Promise<Evidence[]> {

  const { data, error } = await supabase
    .from('evidence')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('created_at', {
      ascending: false,
    })

  if (error) throw error

  return data as Evidence[]
}

export async function uploadEvidence(
  candidateId: string,
  input: EvidenceInput
): Promise<Evidence> {

  validateEvidenceFile(input.file)

  if (!input.title.trim()) {
    throw new Error('Evidence title is required.')
  }

  const extension =
    FILE_EXTENSIONS[input.file.type]

  const filePath =
    `${candidateId}/${crypto.randomUUID()}.${extension}`

  // Upload the actual file

  const { error: uploadError } =
    await supabase.storage
      .from(BUCKET)
      .upload(filePath, input.file, {
        contentType: input.file.type,
        cacheControl: '0',
        upsert: false,
      })

  if (uploadError) throw uploadError

  // Save document metadata

  const { data, error } = await supabase
    .from('evidence')
    .insert({
      candidate_id: candidateId,

      candidate_skill_id:
        input.candidate_skill_id,

      title: input.title.trim(),

      evidence_type: input.evidence_type,

      description:
        input.description.trim() || null,

      file_path: filePath,

      file_name: input.file.name,

      file_type: input.file.type,

      file_size: input.file.size,
    })
    .select()
    .single()

  if (error) {

    // Check whether the insert actually committed
    // before attempting to clean up the file.

    const {
      data: existing,
      error: lookupError,
    } = await supabase
      .from('evidence')
      .select('*')
      .eq('file_path', filePath)
      .maybeSingle()

    if (existing) {
      return existing as Evidence
    }

    if (!lookupError) {
      const { error: cleanupError } =
        await supabase.storage
          .from(BUCKET)
          .remove([filePath])

      if (cleanupError) {
        console.error(
          'File cleanup failed:',
          cleanupError
        )
      }
    }

    throw error
  }

  return data as Evidence
}

export async function getEvidenceUrl(
  filePath: string
): Promise<string> {

  const { data, error } =
    await supabase.storage
      .from(BUCKET)
      .createSignedUrl(filePath, 60)

  if (error) throw error

  return data.signedUrl
}

export async function deleteEvidence(
  candidateId: string,
  record: Evidence
) {

  if (record.status !== 'draft') {
    throw new Error(
      'Only draft evidence can be deleted.'
    )
  }

  const { error } = await supabase
    .from('evidence')
    .delete()
    .eq('id', record.id)
    .eq('candidate_id', candidateId)
    .eq('status', 'draft')
    .select('id')
    .single()

  if (error) throw error

  const { error: storageError } =
    await supabase.storage
      .from(BUCKET)
      .remove([record.file_path])

  if (storageError) {
    console.error(
      'Storage cleanup failed:',
      storageError
    )
  }

  return {
    cleanupFailed: Boolean(storageError),
  }
}