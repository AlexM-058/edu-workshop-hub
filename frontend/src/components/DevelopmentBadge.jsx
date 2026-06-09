import Icon from './Icon'
import { useI18n } from '../i18n/I18nContext'

export default function DevelopmentBadge({ className = '' }) {
  const { t } = useI18n()

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-label-md uppercase tracking-wide text-amber-800 ${className}`}
      title={t('common.underDevelopmentText')}
    >
      <Icon className="text-sm">construction</Icon>
      {t('common.underDevelopment')}
    </span>
  )
}
