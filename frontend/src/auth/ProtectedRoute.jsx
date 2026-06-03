import { Navigate, useLocation } from 'react-router-dom'
import { useAppAuth } from './AuthContext'
import { canAccessRole } from './permissions'
import { useI18n } from '../i18n/I18nContext'

export default function ProtectedRoute({ children, roles }) {
  const location = useLocation()
  const { isLoaded, isSignedIn, isSyncing, role, signOut, syncError } = useAppAuth()
  const { t } = useI18n()

  if (!isLoaded) {
    return <AuthStatusPage title={t('auth.loadingTitle')} text={t('auth.loadingText')} />
  }

  if (!isSignedIn) {
    return <Navigate replace to={`/sign-in?redirect_url=${encodeURIComponent(location.pathname + location.search)}`} />
  }

  if (syncError) {
    return (
      <AuthStatusPage
        actionLabel={t('auth.signOut')}
        onAction={() => signOut()}
        title={t('auth.syncFailedTitle')}
        text={t('auth.syncFailedText')}
      />
    )
  }

  if (isSyncing || !role) {
    return <AuthStatusPage title={t('auth.syncingTitle')} text={t('auth.syncingText')} />
  }

  if (!canAccessRole(role, roles)) {
    return <Navigate replace to="/demo/dashboard/professor" />
  }

  return children
}

function AuthStatusPage({ actionLabel, onAction, title, text }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-on-background">
      <section className="w-full max-w-[520px] rounded-xl border border-outline-variant bg-white p-8 shadow-sm">
        <p className="mb-3 text-xs font-label-md uppercase tracking-widest text-slate-500">EduCraft</p>
        <h1 className="mb-3 font-h2 text-3xl text-primary">{title}</h1>
        <p className="font-body-md leading-7 text-on-surface-variant">{text}</p>
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
