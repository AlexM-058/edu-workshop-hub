import { Link } from 'react-router-dom'
import AdminShell from '../components/AdminShell'
import Icon from '../components/Icon'
import { useI18n } from '../i18n/I18nContext'
import { useAdminStats } from '../lib/admin'

export default function AdminDashboardPage() {
  const { locale, t } = useI18n()
  const { stats, isLoading, error } = useAdminStats()

  return (
    <AdminShell searchKey="admin.searchUsers" showSearch={false}>
      <main className="mx-auto max-w-[1200px] p-8">
        <header className="mb-lg border-b border-slate-200 pb-md">
          <h1 className="font-h1 text-h1 text-primary">{locale === 'de' ? 'Admin-Dashboard' : 'Dashboard admin'}</h1>
          <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
            {locale === 'de'
              ? 'Operativer Überblick über Nutzer, Workshops und Plattformstatus.'
              : 'Privire operațională asupra utilizatorilor, workshop-urilor și stării platformei.'}
          </p>
        </header>

        {error ? (
          <div className="mb-md rounded-lg border border-error/30 bg-error-container px-6 py-4 text-on-error-container">
            {locale === 'de' ? 'Admin-Statistiken konnten nicht geladen werden.' : 'Statisticile admin nu au putut fi încărcate.'}
          </div>
        ) : null}

        <section className="mb-lg grid grid-cols-1 gap-gutter md:grid-cols-3">
          <Metric icon="group" label={t('admin.users.totalUsers')} value={isLoading ? '-' : String(stats?.total_users ?? 0)} />
          <Metric icon="school" label={t('admin.audit.activeWorkshops')} value={isLoading ? '-' : String(stats?.active_workshops ?? 0)} />
          <Metric icon="how_to_reg" label={t('admin.audit.totalEnrollments')} value={isLoading ? '-' : String(stats?.total_enrolled ?? 0)} />
        </section>

        <section className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
          <AdminLink icon="group" title={t('admin.users.title')} text={t('admin.users.subtitle')} to="/demo/admin/users" />
          <AdminLink
            icon="school"
            title={locale === 'de' ? 'Workshop-Verwaltung' : 'Administrare workshop-uri'}
            text={locale === 'de' ? 'Prüfe den veröffentlichten Katalog und Workshop-Kapazitäten.' : 'Verifică publicarea în catalog și capacitățile workshop-urilor.'}
            to="/demo/admin/workshops"
          />
          <AdminLink icon="settings" title={t('admin.settings.title')} text={t('admin.settings.subtitle')} to="/demo/admin/settings" />
          <AdminLink icon="security" title={t('admin.audit.title')} text={t('admin.audit.subtitle')} to="/demo/admin/audit" />
        </section>
      </main>
    </AdminShell>
  )
}

function Metric({ icon, label, value }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-md">
      <span className="mb-md flex h-10 w-10 items-center justify-center rounded-lg bg-primary-fixed text-primary">
        <Icon>{icon}</Icon>
      </span>
      <p className="font-label-md text-slate-500">{label}</p>
      <p className="mt-1 font-h2 text-h2 text-primary">{value}</p>
    </article>
  )
}

function AdminLink({ icon, title, text, to }) {
  return (
    <Link className="rounded-lg border border-slate-200 bg-white p-lg transition hover:border-primary hover:shadow-sm" to={to}>
      <span className="mb-md flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container text-primary">
        <Icon>{icon}</Icon>
      </span>
      <h2 className="font-h3 text-h3 text-primary">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-on-surface-variant">{text}</p>
    </Link>
  )
}
