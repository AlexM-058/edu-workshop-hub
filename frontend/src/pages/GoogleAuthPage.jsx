import { useSignIn } from '@clerk/clerk-react'
import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAppAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'

export default function GoogleAuthPage() {
  const { clerkConfigured, isSignedIn } = useAppAuth()
  const { t } = useI18n()
  const [searchParams] = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || '/demo/dashboard/attender'

  if (isSignedIn) {
    return <Navigate replace to={redirectUrl} />
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-on-background">
      <section className="w-full max-w-[480px] rounded-xl border border-outline-variant bg-white p-8 shadow-sm">
        <p className="mb-3 text-xs font-label-md uppercase tracking-widest text-slate-500">EduCraft</p>
        <h1 className="mb-3 font-h2 text-3xl text-primary">{t('auth.signInTitle')}</h1>
        <p className="mb-8 max-w-prose font-body-md leading-7 text-on-surface-variant">
          {t('auth.signInText')}
        </p>

        {clerkConfigured ? (
          <GoogleOAuthControls redirectUrl={redirectUrl} />
        ) : (
          <div className="rounded-lg border border-error-container bg-error-container p-md text-sm text-on-error-container">
            {t('auth.missingClerkKey')}
          </div>
        )}
      </section>
    </main>
  )
}

function GoogleOAuthControls({ redirectUrl }) {
  const { t } = useI18n()
  const { signIn, isLoaded: signInLoaded } = useSignIn()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const isLoaded = signInLoaded

  async function continueWithGoogle() {
    if (!isLoaded) return

    try {
      setError(null)
      setIsSubmitting(true)

      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: redirectUrl,
      })
    } catch (authError) {
      setIsSubmitting(false)
      setError(authError?.errors?.[0]?.longMessage || authError?.message || t('auth.googleError'))
    }
  }

  return (
    <div className="space-y-4">
      <button
        className="group flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-5 py-3 font-label-md text-primary shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary hover:bg-slate-50 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:border-slate-300 disabled:hover:shadow-sm"
        disabled={!isLoaded || isSubmitting}
        onClick={continueWithGoogle}
        type="button"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full border border-slate-200 font-bold text-blue-600 transition-transform duration-200 ease-out group-hover:scale-110 group-hover:rotate-3 group-disabled:scale-100 group-disabled:rotate-0">G</span>
        {isSubmitting ? t('auth.googleLoading') : t('auth.googleContinue')}
      </button>
      {error ? (
        <p className="rounded-lg border border-error-container bg-error-container p-3 text-sm text-on-error-container">{error}</p>
      ) : null}
      <div id="clerk-captcha" />
    </div>
  )
}
