import { Navigate, useLocation } from 'react-router-dom'
import { useAppAuth } from './AuthContext'
import { canAccessRole } from './permissions'

export default function ProtectedRoute({ children, roles }) {
  const location = useLocation()
  const { isLoaded, isSignedIn, isSyncing, role, syncError } = useAppAuth()

  if (!isLoaded) {
    return <div className="min-h-screen bg-background p-margin pt-28 text-primary">Loading...</div>
  }

  if (!isSignedIn) {
    return <Navigate replace to={`/sign-in?redirect_url=${encodeURIComponent(location.pathname + location.search)}`} />
  }

  if (syncError) {
    return <div className="min-h-screen bg-background p-margin pt-28 text-primary">Authentication sync failed. Please sign out and try again.</div>
  }

  if (isSyncing || !role) {
    return <div className="min-h-screen bg-background p-margin pt-28 text-primary">Syncing account...</div>
  }

  if (!canAccessRole(role, roles)) {
    return <Navigate replace to="/demo/dashboard/professor" />
  }

  return children
}
