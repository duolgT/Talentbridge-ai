import { supabase } from '../lib/supabase'

interface RegisterUserData {
  fullName: string
  email: string
  password: string
}

export async function registerUser({
  fullName,
  email,
  password,
}: RegisterUserData) {

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,

    options: {
      data: {
        full_name: fullName.trim(),
      },

      emailRedirectTo: `${window.location.origin}/login`,
    },
  })

  if (error) {
    throw error
  }

  return data
}


export async function loginUser(
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth
    .signInWithPassword({
      email: email.trim(),
      password,
    })

  if (error) throw error

  return data
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut({
    scope: 'local',
  })

  if (error) throw error
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error

  return data
}