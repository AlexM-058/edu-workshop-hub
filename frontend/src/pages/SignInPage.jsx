import { SignIn } from '@clerk/clerk-react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAppAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'

export default function SignInPage() {
  const { clerkConfigured, isSignedIn } = useAppAuth()
  const { t } = useI18n()
  const [searchParams] = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || '/demo/dashboard/professor'

  if (isSignedIn) {
    return <Navigate replace to={redirectUrl} />
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-margin py-xl text-on-background">
      <section className="w-full max-w-md rounded-xl border border-outline-variant bg-white p-lg shadow-sm">
        <h1 className="mb-sm font-h2 text-h2 text-primary">{t('auth.signInTitle')}</h1>
        <p className="mb-lg font-body-md text-on-surface-variant">{t('auth.signInText')}</p>
        {clerkConfigured ? (
          <SignIn
            appearance={{ elements: { rootBox: 'w-full', card: 'shadow-none border-0 p-0' } }}
            fallbackRedirectUrl={redirectUrl}
            signUpUrl="/sign-in"
          />
        ) : (
          <div className="rounded-lg border border-error-container bg-error-container p-md text-sm text-on-error-container">
            {t('auth.missingClerkKey')}
          </div>
        )}
      </section>
    </main>
  )
}
