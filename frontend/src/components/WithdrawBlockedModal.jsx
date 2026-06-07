import { useI18n } from '../i18n/I18nContext'
import Icon from './Icon'

export default function WithdrawBlockedModal({ isOpen, onClose }) {
  const { t } = useI18n()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
        style={{ minWidth: '320px', maxWidth: '450px' }}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-error-container text-on-error-container">
            <Icon className="text-2xl text-error">block</Icon>
          </div>
          <div className="flex-1">
            <h3 className="mb-2 font-h3 text-xl text-primary">{t('withdraw.blockedTitle')}</h3>
            <p className="text-sm text-on-surface-variant">
              {t('withdraw.blockedText')}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 bg-surface-container-low px-6 py-4">
          <button
            type="button"
            className="rounded-lg bg-primary px-5 py-2 font-label-md text-white shadow-sm transition-colors hover:bg-primary/90"
            onClick={onClose}
          >
            {t('withdraw.blockedOk')}
          </button>
        </div>
      </div>
    </div>
  )
}
