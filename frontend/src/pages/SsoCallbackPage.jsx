import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import { useI18n } from '../i18n/I18nContext'

export default function SsoCallbackPage() {
  const { t } = useI18n()

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-on-background">
      <section className="w-full max-w-[420px] rounded-xl border border-outline-variant bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
        <h1 className="mb-2 font-h2 text-2xl text-primary">{t('auth.callbackTitle')}</h1>
        <p className="font-body-md text-on-surface-variant">{t('auth.callbackText')}</p>
        <AuthenticateWithRedirectCallback
          signInFallbackRedirectUrl="/demo/dashboard/professor"
          signUpFallbackRedirectUrl="/demo/dashboard/professor"
        />
      </section>
    </main>
  )
}
