import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from '../types/auth'

interface AuthState {
  session: Session | null
  profile: Profile | null
  loading: boolean
  error: string | null

  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  loading: true,
  error: null,

  setSession: (session) => set({ session }),

  setProfile: (profile) => set({ profile }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      session: null,
      profile: null,
      loading: false,
      error: null,
    }),
}))