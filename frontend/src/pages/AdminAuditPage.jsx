import AdminShell from '../components/AdminShell'
import Icon from '../components/Icon'
import { useI18n } from '../i18n/I18nContext'
import { useAdminStats } from '../lib/admin'

export default function AdminAuditPage() {
  const { t, locale } = useI18n()
  const { stats, isLoading, error } = useAdminStats()

  return (
    <AdminShell searchKey="admin.searchAudit">
      <div className="mx-auto max-w-[1200px] p-8">
        <header className="mb-12">
          <h1 className="mb-2 font-h1 text-h1 text-primary">{t('admin.audit.title')}</h1>
          <p className="max-w-2xl font-body-lg text-on-surface-variant">{t('admin.audit.subtitle')}</p>
        </header>

        {/* Error */}
        {error && (
          <div className="mb-8 rounded-lg border border-error/30 bg-error-container px-6 py-4 text-on-error-container">
            <p className="font-label-md">{locale === 'de' ? 'Statistiken konnten nicht geladen werden.' : 'Statisticile nu au putut fi încărcate.'}</p>
          </div>
        )}

        {/* Real metric cards */}
        <div className="mb-12 grid grid-cols-12 gap-gutter">
          <AuditMetric
            label={t('admin.audit.totalEnrollments')}
            value={isLoading ? '—' : String(stats?.total_enrolled ?? 0)}
            note={`${stats?.total_attended ?? '—'} ${locale === 'de' ? 'bestätigt' : 'confirmate'}`}
            tone="primary"
            loading={isLoading}
          />
          <AuditMetric
            label={locale === 'de' ? 'Benutzer gesamt' : 'Utilizatori totali'}
            value={isLoading ? '—' : String(stats?.total_users ?? 0)}
            note={`${stats?.total_professors ?? '—'} ${locale === 'de' ? 'Teilnehmer' : 'participanți'} / ${stats?.total_referents ?? '—'} referenți`}
            tone="secondary"
            loading={isLoading}
          />
          <AuditMetric
            label={t('admin.audit.activeWorkshops')}
            value={isLoading ? '—' : String(stats?.active_workshops ?? 0)}
            note={`${stats?.total_workshops ?? '—'} ${locale === 'de' ? 'gesamt' : 'total'}`}
            tone="tertiary"
            loading={isLoading}
          />
        </div>

        <div className="grid grid-cols-12 gap-gutter">
          {/* Recent activity — stays placeholder until AuditLog entity is built */}
          <section className="col-span-12 lg:col-span-8">
            <div className="border border-slate-200 bg-white p-8">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="font-h3 text-h3 text-primary">{t('admin.audit.recentActivity')}</h2>
                <span className="rounded bg-surface-container px-3 py-1 text-xs text-on-surface-variant">
                  {locale === 'de' ? 'AuditLog in Entwicklung' : 'AuditLog în dezvoltare'}
                </span>
              </div>

              {/* Quick stats summary using real data */}
              <div className="space-y-4">
                <StatRow
                  icon="school"
                  tone="bg-primary-fixed text-primary"
                  label={locale === 'de' ? 'Aktive Einschreibungen' : 'Înscrieri active'}
                  value={isLoading ? '—' : String(stats?.total_enrolled ?? 0)}
                  loading={isLoading}
                />
                <StatRow
                  icon="how_to_reg"
                  tone="bg-secondary-container text-on-secondary-container"
                  label={locale === 'de' ? 'Bestätigte Anwesenheiten' : 'Prezențe confirmate'}
                  value={isLoading ? '—' : String(stats?.total_attended ?? 0)}
                  loading={isLoading}
                />
                <StatRow
                  icon="group"
                  tone="bg-surface-container text-primary"
                  label={locale === 'de' ? 'Teilnehmer auf der Plattform' : 'Participanți pe platformă'}
                  value={isLoading ? '—' : String(stats?.total_professors ?? 0)}
                  loading={isLoading}
                />
                <StatRow
                  icon="import_contacts"
                  tone="bg-tertiary-fixed text-on-tertiary-fixed"
                  label={locale === 'de' ? 'Workshops insgesamt' : 'Workshop-uri totale'}
                  value={isLoading ? '—' : String(stats?.total_workshops ?? 0)}
                  loading={isLoading}
                />
              </div>

              <p className="mt-8 rounded border border-dashed border-slate-300 px-4 py-3 text-sm text-on-surface-variant">
                {locale === 'de'
                  ? 'Detaillierte Aktivitätsprotokolle werden in einem späteren Release über die AuditLog-Entität verfügbar sein.'
                  : 'Jurnalele detaliate de activitate vor fi disponibile într-o versiune viitoare prin entitatea AuditLog.'}
              </p>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="col-span-12 space-y-gutter lg:col-span-4">
            {/* Enrollment bar chart — static visual, real data will replace when analytics API lands */}
            <div className="border border-slate-200 bg-white p-6">
              <h3 className="mb-6 font-label-md text-slate-500">{t('admin.audit.trendTitle')}</h3>
              <div className="relative flex h-48 w-full items-end justify-between bg-slate-50 px-4 pb-2">
                {[12, 24, 20, 32, 28, 40, 36].map((height, index) => (
                  <div key={index} className="w-4 bg-primary" style={{ height }} />
                ))}
              </div>
              <div className="mt-2 flex justify-between font-caption text-slate-400">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                  <span key={`${day}-${index}`}>{day}</span>
                ))}
              </div>
              <p className="mt-2 text-center text-xs text-slate-400">
                {locale === 'de' ? '(Demo-Daten)' : '(date demo)'}
              </p>
            </div>

            {/* System status */}
            <div className="bg-primary p-6 text-white shadow-xl">
              <div className="mb-8 flex items-center justify-between">
                <span className="font-label-md opacity-80">{t('admin.audit.systemState')}</span>
                <span className="h-3 w-3 rounded-full bg-secondary shadow-[0_0_8px_#85f6ad]" />
              </div>
              <div className="space-y-4">
                <Health label={t('admin.audit.apiResponse')} value="—" />
                <Health label={t('admin.audit.uptime')} value="—" />
                <Health label={t('admin.audit.dbLoad')} value="—" />
              </div>
              <p className="mt-4 text-xs opacity-60">
                {locale === 'de'
                  ? 'Systemmetriken werden in einer späteren Version verfügbar sein.'
                  : 'Metricile de sistem vor fi disponibile într-o versiune viitoare.'}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AdminShell>
  )
}

function AuditMetric({ label, value, note, tone, loading }) {
  const border = tone === 'secondary'
    ? 'border-l-secondary'
    : tone === 'tertiary'
    ? 'border-l-on-tertiary-container'
    : 'border-l-primary'

  return (
    <div className={`col-span-12 flex flex-col justify-between border border-slate-200 border-l-4 bg-white p-md shadow-[0_4px_12px_rgba(26,54,93,0.05)] md:col-span-4 ${border}`}>
      <div>
        <span className="font-label-md text-slate-500">{label}</span>
        <h2 className={`mt-2 font-h2 text-h2 text-primary ${loading ? 'animate-pulse' : ''}`}>{value}</h2>
      </div>
      {note && <p className="mt-2 font-caption text-slate-500">{note}</p>}
    </div>
  )
}

function StatRow({ icon, tone, label, value, loading }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-100 p-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="h-5 w-5">{icon}</Icon>
      </span>
      <span className="flex-1 font-body-md text-on-surface">{label}</span>
      <span className={`font-h3 text-h3 text-primary ${loading ? 'animate-pulse' : ''}`}>{value}</span>
    </div>
  )
}

function Health({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-body-md">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  )
}
