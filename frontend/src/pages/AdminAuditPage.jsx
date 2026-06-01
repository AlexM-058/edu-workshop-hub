import AdminShell from '../components/AdminShell'
import Icon from '../components/Icon'
import { useI18n } from '../i18n/I18nContext'

const logs = [
  ['upload_file', 'bg-surface-container text-primary', 'admin.audit.log1Actor', 'admin.audit.log1Text', 'admin.audit.log1Badge', 'admin.audit.time5'],
  ['person_add', 'bg-secondary-container text-on-secondary-container', 'admin.audit.log2Actor', 'admin.audit.log2Text', 'admin.audit.log2Badge', 'admin.audit.time12'],
  ['payments', 'bg-tertiary-fixed text-on-tertiary-fixed', 'admin.audit.log3Actor', 'admin.audit.log3Text', 'admin.audit.log3Badge', 'admin.audit.time24'],
  ['report', 'bg-error-container text-error', 'admin.audit.log4Actor', 'admin.audit.log4Text', 'admin.audit.log4Badge', 'admin.audit.time45'],
]

export default function AdminAuditPage() {
  const { t } = useI18n()

  return (
    <AdminShell searchKey="admin.searchAudit">
      <div className="mx-auto max-w-[1200px] p-8">
        <header className="mb-12">
          <h1 className="mb-2 font-h1 text-h1 text-primary">{t('admin.audit.title')}</h1>
          <p className="max-w-2xl font-body-lg text-on-surface-variant">{t('admin.audit.subtitle')}</p>
        </header>
        <div className="mb-12 grid grid-cols-12 gap-gutter">
          <AuditMetric label={t('admin.audit.totalEnrollments')} value="12,840" trend={t('admin.audit.enrollmentTrend')} tone="primary" />
          <AuditMetric label={t('admin.audit.revenueGenerated')} value="€42,150" progress tone="secondary" />
          <AuditMetric label={t('admin.audit.activeWorkshops')} value="312" note={t('admin.audit.publishedWeek')} tone="tertiary" />
        </div>
        <div className="grid grid-cols-12 gap-gutter">
          <section className="col-span-12 lg:col-span-8">
            <div className="border border-slate-200 bg-white p-8">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="font-h3 text-h3 text-primary">{t('admin.audit.recentActivity')}</h2>
                <button className="border border-primary px-4 py-2 text-sm font-label-md text-primary transition-all hover:bg-slate-50" type="button">{t('admin.audit.viewAll')}</button>
              </div>
              <div className="space-y-6">
                {logs.map(([icon, tone, actorKey, textKey, badgeKey, timeKey], index) => (
                  <div key={actorKey} className={`group flex gap-6 pb-6 ${index === logs.length - 1 ? '' : 'border-b border-slate-100'}`}>
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${tone}`}><Icon>{icon}</Icon></div>
                    <div className="flex-1">
                      <div className="mb-1 flex justify-between gap-4">
                        <p className="font-body-md"><span className="font-bold text-primary">{t(actorKey)}</span> {t(textKey)}</p>
                        <span className="shrink-0 font-caption text-slate-400">{t(timeKey)}</span>
                      </div>
                      <span className="inline-block rounded bg-surface-container-high px-2 py-1 text-[10px] font-bold uppercase text-primary">{t(badgeKey)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <aside className="col-span-12 space-y-gutter lg:col-span-4">
            <div className="border border-slate-200 bg-white p-6">
              <h3 className="mb-6 font-label-md text-slate-500">{t('admin.audit.trendTitle')}</h3>
              <div className="relative flex h-48 w-full items-end justify-between bg-slate-50 px-4 pb-2">
                {[12, 24, 20, 32, 28, 40, 36].map((height, index) => <div key={index} className="w-4 bg-primary" style={{ height }} />)}
              </div>
              <div className="mt-2 flex justify-between font-caption text-slate-400">{['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
            </div>
            <div className="bg-primary p-6 text-white shadow-xl">
              <div className="mb-8 flex items-center justify-between">
                <span className="font-label-md opacity-80">{t('admin.audit.systemState')}</span>
                <span className="h-3 w-3 rounded-full bg-secondary shadow-[0_0_8px_#85f6ad]" />
              </div>
              <div className="space-y-4">
                <Health label={t('admin.audit.apiResponse')} value="124ms" />
                <Health label={t('admin.audit.uptime')} value="99.98%" />
                <Health label={t('admin.audit.dbLoad')} value="22%" />
              </div>
            </div>
            <div className="overflow-hidden border border-slate-200 bg-white">
              <div className="p-6 pb-2"><h3 className="font-label-md text-slate-500">{t('admin.audit.geoTitle')}</h3></div>
              <div className="flex h-48 items-center justify-center bg-surface-container-highest">
                <span className="rounded bg-primary/90 px-3 py-1 font-caption text-[10px] text-white">{t('admin.audit.viewMap')}</span>
              </div>
              <ul className="space-y-2 p-6">
                {['București 45%', 'Cluj-Napoca 22%', 'Iași 15%'].map((item) => {
                  const [city, value] = item.split(' ')
                  return <li key={item} className="flex justify-between text-sm font-body-md"><span>{city}</span><span className="font-bold text-primary">{value}</span></li>
                })}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </AdminShell>
  )
}

function AuditMetric({ label, value, trend, note, progress, tone }) {
  const border = tone === 'secondary' ? 'border-l-secondary' : tone === 'tertiary' ? 'border-l-on-tertiary-container' : 'border-l-primary'
  return (
    <div className={`col-span-12 flex flex-col justify-between border border-slate-200 border-l-4 bg-white p-md shadow-[0_4px_12px_rgba(26,54,93,0.05)] md:col-span-4 ${border}`}>
      <div><span className="font-label-md text-slate-500">{label}</span><h2 className="mt-2 font-h2 text-h2 text-primary">{value}</h2></div>
      {trend && <div className="mt-4 flex items-center gap-2 text-secondary"><Icon>trending_up</Icon><span className="text-sm font-label-md">{trend}</span></div>}
      {progress && <div className="mt-4 h-1 w-full bg-slate-100"><div className="h-full w-3/4 bg-secondary" /></div>}
      {note && <p className="mt-2 font-caption text-slate-500">{note}</p>}
    </div>
  )
}

function Health({ label, value }) {
  return <div className="flex items-center justify-between"><span className="text-sm font-body-md">{label}</span><span className="font-bold">{value}</span></div>
}
