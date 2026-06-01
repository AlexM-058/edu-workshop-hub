import Icon from './Icon'
import { useI18n } from '../i18n/I18nContext'

export default function MetricCard({ icon, label, value, meta, tone = 'blue' }) {
  const { t } = useI18n()
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-md shadow-sm">
      <div className="mb-sm flex items-start justify-between">
        <Icon className={`rounded-lg p-2 ${tones[tone]}`}>{icon}</Icon>
        {meta && <span className="text-xs font-label-md text-secondary">{meta}</span>}
      </div>
      <p className="font-label-md text-slate-500">{label}</p>
      <h3 className="font-h2 text-h3 text-primary">{value}</h3>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">{t('common.demo')}</p>
    </article>
  )
}
