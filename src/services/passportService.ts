import { supabase } from '../lib/supabase'

import type {
  Passport,
  PassportData,
} from '../types/passport'

export async function getPassport(
  candidateId: string
): Promise<Passport | null> {

  const { data, error } = await supabase
    .from('passports')
    .select('*')
    .eq('candidate_id', candidateId)
    .maybeSingle()

  if (error) throw error

  return data as Passport | null
}

export async function generatePassport():
  Promise<Passport> {

  const { data, error } = await supabase.rpc(
    'generate_passport'
  )

  if (error) throw error

  return data as Passport
}

export async function getMyPassport():
  Promise<PassportData | null> {

  const { data, error } = await supabase.rpc(
    'get_my_passport'
  )

  if (error) throw error

  return data as PassportData | null
}

export async function setPassportVisibility(
  publish: boolean
): Promise<Passport> {

  const { data, error } = await supabase.rpc(
    'set_passport_visibility',
    {
      p_publish: publish,
    }
  )

  if (error) throw error

  return data as Passport
}

export async function verifyPassport(
  shareToken: string
): Promise<PassportData | null> {

  const { data, error } = await supabase.rpc(
    'verify_passport',
    {
      p_share_token: shareToken,
    }
  )

  if (error) throw error

  return data as PassportData | null
}

export function getPassportUrl(
  shareToken: string
): string {

  return new URL(
    `/verify/${shareToken}`,
    window.location.origin
  ).href
}