import { useI18n } from '../i18n/I18nContext'

export default function LanguageToggle({ className = '' }) {
  const { locale, setLocale, t } = useI18n()

  return (
    <button
      className={`rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold uppercase text-primary transition-colors hover:bg-slate-50 ${className}`}
      onClick={() => setLocale(locale === 'ro' ? 'de' : 'ro')}
      type="button"
      aria-label={t('common.switchLanguage')}
    >
      {locale === 'ro' ? 'DE' : 'RO'}
    </button>
  )
}
