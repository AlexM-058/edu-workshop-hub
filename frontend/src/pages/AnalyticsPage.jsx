import DashboardShell from '../components/DashboardShell'
import DevelopmentBadge from '../components/DevelopmentBadge'
import Icon from '../components/Icon'
import MetricCard from '../components/MetricCard'
import { useI18n } from '../i18n/I18nContext'

const bars = ['40%', '55%', '75%', '60%', '85%', '95%']

export default function AnalyticsPage() {
  const { t } = useI18n()

  return (
    <DashboardShell mode="teacher">
      <div className="mx-auto max-w-[1200px] p-8">
        <div className="mb-lg rounded-lg border border-primary-fixed bg-primary-fixed px-4 py-3 text-sm font-label-md text-primary">
          {t('analytics.demo')}
        </div>
        <div className="mb-xl flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h2 className="font-h2 text-h2 text-primary">{t('analytics.title')}</h2>
              <DevelopmentBadge />
            </div>
            <p className="font-body-lg text-body-lg text-slate-500">{t('analytics.subtitle')}</p>
          </div>
          <div className="flex gap-4">
            <button className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-outline bg-slate-100 px-4 py-2 text-label-md text-primary opacity-60" disabled title={t('common.demoUnavailable')} type="button"><Icon>date_range</Icon>{t('analytics.customDate')}</button>
            <button className="flex cursor-not-allowed items-center gap-2 rounded-lg bg-primary px-4 py-2 text-label-md text-on-primary opacity-60" disabled title={t('common.demoUnavailable')} type="button"><Icon>download</Icon>{t('analytics.export')}</button>
          </div>
        </div>

        <div className="mb-xl grid grid-cols-1 gap-gutter md:grid-cols-4">
          <MetricCard icon="payments" label={t('analytics.revenue')} value="42.850,00 $" meta="+12%" tone="amber" />
          <MetricCard icon="group_add" label={t('analytics.enrollments')} value="1.284" meta="+15%" tone="green" />
          <MetricCard icon="horizontal_rule" label={t('analytics.completion')} value="74.2%" meta="Stabil" tone="blue" />
          <MetricCard icon="star" label={t('analytics.rating')} value="4.92" meta="Top 5%" tone="green" />
        </div>

        <div className="mb-xl grid grid-cols-1 gap-gutter md:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-md">
            <div className="mb-lg flex items-center justify-between"><h4 className="text-label-md uppercase tracking-widest text-primary">{t('analytics.revenueGrowth')}</h4><div className="flex gap-2"><span className="h-3 w-3 rounded-full bg-primary" /><span className="text-caption text-slate-400">Current</span></div></div>
            <div className="flex h-64 items-end justify-between gap-2 px-2">
              {bars.map((height, index) => <div key={height + index} className={`relative w-full cursor-pointer rounded-t transition-colors hover:bg-primary/20 ${index === 2 ? 'bg-primary' : 'bg-slate-50'}`} style={{ height }} />)}
            </div>
            <div className="mt-4 flex justify-between px-2 text-caption font-medium text-slate-400"><span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span></div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-md">
            <div className="mb-lg flex items-center justify-between"><h4 className="text-label-md uppercase tracking-widest text-primary">{t('analytics.enrollmentTrends')}</h4><select className="rounded bg-slate-50 px-2 py-1 text-caption outline-none"><option>Lunar</option></select></div>
            <div className="relative h-64 overflow-hidden">
              <svg className="h-full w-full" viewBox="0 0 400 150">
                <path d="M0,130 Q50,110 100,120 T200,80 T300,50 T400,20" fill="none" stroke="#002045" strokeLinecap="round" strokeWidth="3" />
                <path d="M0,130 Q50,110 100,120 T200,80 T300,50 T400,20 L400,150 L0,150 Z" fill="#002045" opacity="0.08" />
                <circle cx="300" cy="50" fill="#002045" r="4" />
              </svg>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
          <section className="rounded-xl border border-slate-200 bg-white p-md lg:col-span-2">
            <h4 className="mb-lg text-label-md uppercase tracking-widest text-primary">{t('analytics.topWorkshops')}</h4>
            {['Advanced Pedagogy 202', 'Cognitive Science in UX', 'History of Modern Art'].map((item, index) => (
              <div key={item} className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-white p-4 transition-colors hover:bg-slate-50">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-primary">
                    <Icon className="h-6 w-6">{index === 0 ? 'architecture' : index === 1 ? 'psychology' : 'history_edu'}</Icon>
                  </div>
                  <div className="min-w-0">
                    <h5 className="truncate text-label-md text-primary">{item}</h5>
                    <p className="text-caption text-slate-500">{index === 0 ? '428' : index === 1 ? '312' : '204'} Enrolled • Demo Revenue</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-label-md text-secondary">{98 - index * 3}% Satisfied</span>
                  <p className="text-caption text-slate-400">Trending #{index + 1}</p>
                </div>
              </div>
            ))}
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-md">
            <h4 className="mb-lg text-label-md uppercase tracking-widest text-primary">{t('analytics.completionPerspective')}</h4>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative flex h-40 w-40 items-center justify-center"><svg className="h-full w-full -rotate-90"><circle className="text-slate-100" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12" /><circle className="text-secondary" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset="114" strokeWidth="12" /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-h3 text-h3 text-primary">74.2%</span><span className="text-caption text-slate-500">Media Globală</span></div></div>
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
