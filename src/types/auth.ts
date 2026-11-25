export type UserRole =
  | 'candidate'
  | 'reviewer'
  | 'employer'
  | 'admin'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  professional_title: string | null
  bio: string | null
  country: string | null
  location: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}