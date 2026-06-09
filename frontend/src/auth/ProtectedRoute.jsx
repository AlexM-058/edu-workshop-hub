import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAppAuth } from './AuthContext'
import { canAccessRole, dashboardPathForRole } from './permissions'
import { useI18n } from '../i18n/I18nContext'

const CLERK_LOAD_TIMEOUT_MS = 3000

export default function ProtectedRoute({ children, roles }) {
  const location = useLocation()
  const { isLoaded, isSignedIn, isSyncing, role, signOut, syncError } = useAppAuth()
  const { t } = useI18n()
  const [loadTimedOut, setLoadTimedOut] = useState(false)

  useEffect(() => {
    if (isLoaded) {
      setLoadTimedOut(false)
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setLoadTimedOut(true)
    }, CLERK_LOAD_TIMEOUT_MS)

    return () => window.clearTimeout(timeoutId)
  }, [isLoaded])

  if (!isLoaded) {
    if (loadTimedOut) {
      const params = new URLSearchParams({
        redirect_url: `${location.pathname}${location.search}`,
        auth_fallback: 'clerk_load_timeout',
      })

      return <Navigate replace to={`/sign-in?${params.toString()}`} />
    }

    return <AuthStatusPage title={t('auth.loadingTitle')} text={t('auth.loadingText')} />
  }

  if (!isSignedIn) {
    return <Navigate replace to={`/sign-in?redirect_url=${encodeURIComponent(location.pathname + location.search)}`} />
  }

  if (syncError) {
    return (
      <AuthStatusPage
        actionLabel={t('auth.signOut')}
        detail={syncError.message}
        onAction={() => signOut()}
        title={t('auth.syncFailedTitle')}
        text={t('auth.syncFailedText')}
      />
    )
  }

  // Only show the syncing page if we don't have a role yet (initial load).
  // If we already have a role, allow the children to remain mounted during background re-syncs
  // so we don't destroy their local state (e.g. form inputs) when the window regains focus.
  if (!role) {
    return <AuthStatusPage title={t('auth.syncingTitle')} text={t('auth.syncingText')} />
  }

  if (!canAccessRole(role, roles)) {
    return <Navigate replace to={dashboardPathForRole(role)} />
  }

  return children
}

function AuthStatusPage({ actionLabel, detail, onAction, title, text }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-on-background">
      <section className="w-full max-w-[520px] rounded-xl border border-outline-variant bg-white p-8 shadow-sm">
        <p className="mb-3 text-xs font-label-md uppercase tracking-widest text-slate-500">EduCraft</p>
        <h1 className="mb-3 font-h2 text-3xl text-primary">{title}</h1>
        <p className="font-body-md leading-7 text-on-surface-variant">{text}</p>
        {detail ? (
          <p className="mt-4 rounded-lg border border-outline-variant bg-surface-container p-3 font-body-sm text-sm text-on-surface-variant">
            {detail}
          </p>
        ) : null}
        {actionLabel ? (
          <button
            className="mt-8 rounded-lg bg-primary px-6 py-3 text-label-md font-label-md text-white transition-colors hover:bg-primary-container"
            onClick={onAction}
            type="button"
          >
            {actionLabel}
          </button>
        ) : null}
      </section>
    </main>
  )
}
