import { useAuth, useUser } from '@clerk/clerk-react'
import { useEffect, useMemo, useState } from 'react'
import { fetchCurrentUser } from '../lib/api'
import { AuthContext } from './AuthContext'

export function StaticAuthProvider({ children }) {
  const value = useMemo(() => ({
    appUser: null,
    clerkConfigured: false,
    getToken: async () => null,
    isLoaded: true,
    isSignedIn: false,
    isSyncing: false,
    role: null,
    signOut: async () => {},
    syncError: null,
  }), [])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function ClerkBackedAuthProvider({ children }) {
  const { getToken, isLoaded, isSignedIn, signOut } = useAuth()
  const { user } = useUser()
  const [appUser, setAppUser] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function syncUser() {
      if (!isLoaded || !isSignedIn) {
        setAppUser(null)
        setIsSyncing(false)
        setSyncError(null)
        return
      }

      try {
        setIsSyncing(true)
        const token = await getToken()
        const payload = await fetchCurrentUser(token)

        if (!cancelled) {
          setAppUser(payload.user)
          setIsSyncing(false)
          setSyncError(null)
        }
      } catch (error) {
        if (!cancelled) {
          setAppUser(null)
          setIsSyncing(false)
          setSyncError(error)
        }
      }
    }

    syncUser()

    return () => {
      cancelled = true
    }
  }, [getToken, isLoaded, isSignedIn])

  const value = useMemo(() => ({
    appUser,
    clerkConfigured: true,
    clerkUser: user,
    getToken,
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    isSyncing,
    role: appUser?.role ?? null,
    signOut,
    syncError,
  }), [appUser, getToken, isLoaded, isSignedIn, isSyncing, signOut, syncError, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
