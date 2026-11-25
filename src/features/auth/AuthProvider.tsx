import { useEffect, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { getUserProfile } from '../../services/authService'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({
  children,
}: AuthProviderProps) {

  useEffect(() => {
    let active = true
    let requestId = 0

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {

        if (!active) return

        const currentRequest = ++requestId
        const store = useAuthStore.getState()

        if (!session) {
          store.reset()
          return
        }

        const sameUser =
          store.profile?.id === session.user.id

        store.setSession(session)

        if (sameUser && !store.error) return

        store.setProfile(null)
        store.setLoading(true)
        store.setError(null)

        setTimeout(async () => {
          if (!active || currentRequest !== requestId) {
            return
          }

          try {
            const profile = await getUserProfile(
              session.user.id
            )

            if (!active || currentRequest !== requestId) {
              return
            }

            store.setProfile(profile)

          } catch (error) {
            if (!active || currentRequest !== requestId) {
              return
            }

            store.setError(
              error instanceof Error
                ? error.message
                : 'Unable to load your profile.'
            )

          } finally {
            if (active && currentRequest === requestId) {
              store.setLoading(false)
            }
          }
        }, 0)
      }
    )

    return () => {
      active = false
      requestId++
      subscription.unsubscribe()
    }

  }, [])

  return <>{children}</>
}