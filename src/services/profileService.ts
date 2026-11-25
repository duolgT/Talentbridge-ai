import { supabase } from '../lib/supabase'
import type { Profile } from '../types/auth'

export type UpdateProfileData = Pick<
  Profile,
  | 'full_name'
  | 'professional_title'
  | 'bio'
  | 'country'
  | 'location'
>

export async function updateProfile(
  userId: string,
  updates: UpdateProfileData
): Promise<Profile> {

  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: updates.full_name.trim(),
      professional_title: updates.professional_title,
      bio: updates.bio,
      country: updates.country,
      location: updates.location,
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Profile
}