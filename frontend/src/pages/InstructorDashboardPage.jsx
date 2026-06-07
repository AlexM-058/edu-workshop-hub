import { Link } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import Icon from '../components/Icon'
import { useAppAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { useTeacherStats, useTeacherWorkshops } from '../lib/teacherWorkshops'

const quickActions = [
  ['school', 'nav.myWorkshops', 'instructorDashboard.myWorkshopsText', 'instructorDashboard.viewWorkshops', '/demo/dashboard/teacher/workshops', 'bg-blue-50 text-blue-700'],
  ['add_circle', 'instructorDashboard.createWorkshop', 'instructorDashboard.createText', 'instructorDashboard.createNow', '/demo/dashboard/teacher/workshops/new', 'bg-green-50 text-green-700'],
  ['analytics', 'nav.analytics', 'instructorDashboard.analyticsText', 'instructorDashboard.viewReports', '/demo/dashboard/teacher/analytics', 'bg-amber-50 text-amber-700'],
]

export default function InstructorDashboardPage() {
  const { t, locale } = useI18n()
  const { appUser } = useAppAuth()
  const { stats, isLoading: statsLoading } = useTeacherStats()
  const { workshops: recentWorkshops, isLoading: workshopsLoading } = useTeacherWorkshops({ page: 1, perPage: 3 })

  const today = new Date().toLocaleDateString(locale === 'de' ? 'de-DE' : 'ro-RO', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const greeting = appUser?.first_name
    ? (locale === 'de' ? `Guten Morgen, ${appUser.first_name}!` : `Bună ziua, ${appUser.first_name}!`)
    : t('instructorDashboard.greeting')

  // Build real metrics from stats, keeping placeholders for out-of-scope fields
  const metrics = [
    {
      icon: 'import_contacts',
      label: t('instructorDashboard.activeWorkshops'),
      value: statsLoading ? '—' : String(stats?.active_workshops ?? 0),
      trend: t('instructorDashboard.active'),
      tone: 'bg-green-50 text-green-700',
    },
    {
      icon: 'group',
      label: t('instructorDashboard.studentsTotal'),
      value: statsLoading ? '—' : String(stats?.total_enrolled ?? 0),
      trend: `/ ${stats?.total_capacity ?? '—'}`,
      tone: 'bg-blue-50 text-blue-700',
    },
    {
      icon: 'folder_open',
      label: locale === 'de' ? 'Workshops gesamt' : 'Total workshops',
      value: statsLoading ? '—' : String(stats?.total_workshops ?? 0),
      trend: '',
      tone: 'bg-purple-50 text-purple-700',
    },
    {
      // Revenue is OUT OF SCOPE — kept as placeholder per product brief
      icon: 'payments',
      label: t('instructorDashboard.totalRevenue'),
      value: '—',
      trend: locale === 'de' ? 'Nicht verfügbar' : 'Indisponibil',
      tone: 'bg-amber-50 text-amber-700',
    },
  ]

  return (
    <DashboardShell mode="teacher">
      <main className="mx-auto max-w-[1400px] p-8">
        <header className="mb-xl flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="mb-xs font-h1 text-h2 text-primary">{greeting}</h1>
            <p className="font-body-lg text-on-surface-variant">{t('instructorDashboard.subtitle')}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="font-caption text-slate-500">{t('instructorDashboard.today')}</p>
            <p className="font-label-md text-primary">{today}</p>
          </div>
        </header>

        {/* Metric cards */}
        <section className="mb-xl grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ icon, label, value, trend, tone }) => (
            <article key={label} className="rounded-lg border border-slate-200 bg-white p-md shadow-sm">
              <div className="mb-sm flex items-start justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
                  <Icon className="h-5 w-5">{icon}</Icon>
                </span>
                <span className="text-xs font-label-md text-secondary">{trend}</span>
              </div>
              <p className="font-label-md text-slate-500">{label}</p>
              <h3 className={`font-h2 text-h3 text-primary ${statsLoading ? 'animate-pulse' : ''}`}>
                {value}
              </h3>
            </article>
          ))}
        </section>

        {/* Quick access */}
        <section className="mb-xl">
          <h2 className="mb-md font-h3 text-h3 text-primary">{t('instructorDashboard.quickAccess')}</h2>
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
            {quickActions.map(([icon, title, copy, action, to, tone]) => (
              <article key={title} className="flex min-h-56 flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div>
                  <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${tone}`}>
                    <Icon className="h-6 w-6">{icon}</Icon>
                  </span>
                  <h3 className="mb-2 text-lg font-label-md text-primary">{t(title)}</h3>
                  <p className="font-caption text-slate-500">{t(copy)}</p>
                </div>
                <Link
                  className="mt-md inline-flex w-full items-center justify-center rounded border border-primary px-4 py-2 text-sm font-label-md text-primary transition-colors hover:bg-primary hover:text-white"
                  to={to}
                >
                  {t(action)}
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Recent workshops + sidebar */}
        <div className="grid grid-cols-12 gap-gutter">
          <section className="col-span-12 lg:col-span-8">
            <div className="mb-md flex items-center justify-between">
              <h2 className="font-h3 text-h3 text-primary">{t('instructorDashboard.activeWorkshops')}</h2>
              <Link className="font-label-md text-primary hover:underline" to="/demo/dashboard/teacher/workshops">
                {t('common.viewAll')}
              </Link>
            </div>

            {workshopsLoading && (
              <div className="space-y-4">
                {Array.from({ length: 2 }, (_, i) => (
                  <div key={i} className="animate-pulse flex gap-md rounded-lg border border-slate-200 bg-white p-md">
                    <div className="h-16 w-16 shrink-0 rounded-lg bg-slate-100" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 w-3/4 rounded bg-slate-100" />
                      <div className="h-3 w-1/2 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!workshopsLoading && recentWorkshops?.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
                <Icon className="mb-2 text-4xl text-slate-300">library_books</Icon>
                <p className="text-on-surface-variant">
                  {locale === 'de' ? 'Noch keine Workshops erstellt.' : 'Niciun workshop creat încă.'}
                </p>
                <Link
                  to="/demo/dashboard/teacher/workshops/new"
                  className="mt-4 inline-block rounded bg-primary px-6 py-2 font-label-md text-white hover:opacity-90"
                >
                  {locale === 'de' ? 'Workshop erstellen' : 'Creează primul'}
                </Link>
              </div>
            )}

            {!workshopsLoading && recentWorkshops && recentWorkshops.length > 0 && (
              <div className="space-y-4">
                {recentWorkshops.map((workshop) => {
                  const title   = workshop.title?.[locale] ?? workshop.title?.ro ?? ''
                  const dateStr = new Date(workshop.scheduled_at).toLocaleDateString(
                    locale === 'de' ? 'de-DE' : 'ro-RO',
                    { day: 'numeric', month: 'short', year: 'numeric' },
                  )

                  return (
                    <article key={workshop.id} className="flex flex-col gap-md rounded-lg border border-slate-200 bg-white p-md md:flex-row md:items-center">
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-primary">
                        <Icon className="h-8 w-8">import_contacts</Icon>
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-lg font-label-md text-primary">{title}</h4>
                        <div className="mt-1 flex flex-wrap gap-4 font-caption text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Icon>person</Icon>
                            {workshop.occupied_slots} {t('instructorDashboard.students')}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Icon>calendar_today</Icon>
                            {dateStr}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Icon>location_on</Icon>
                            {workshop.location}
                          </span>
                        </div>
                        {/* Enrollment progress bar */}
                        <div className="mt-md">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="font-caption text-slate-400">{t('instructorDashboard.courseProgress')}</span>
                            <span className="font-caption font-bold text-primary">
                              {workshop.max_slots > 0
                                ? Math.round((workshop.occupied_slots / workshop.max_slots) * 100)
                                : 0}%
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{
                                width: `${workshop.max_slots > 0 ? Math.round((workshop.occupied_slots / workshop.max_slots) * 100) : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          className="rounded border border-slate-200 px-4 py-2 text-sm font-label-md hover:bg-slate-50"
                          to={`/demo/dashboard/teacher/workshops/new?id=${workshop.id}`}
                        >
                          {t('common.edit')}
                        </Link>
                        <Link
                          className="rounded bg-primary px-4 py-2 text-sm font-label-md text-white hover:bg-primary-container"
                          to="/demo/dashboard/teacher/analytics"
                        >
                          {t('nav.analytics')}
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="col-span-12 space-y-gutter lg:col-span-4">
            <section className="rounded-lg bg-primary p-lg text-white shadow-md">
              <h3 className="mb-md font-h3 text-h3">{t('instructorDashboard.quickActions')}</h3>
              {[
                ['add_box', 'instructorDashboard.createWorkshop', '/demo/dashboard/teacher/workshops/new'],
                ['support_agent', 'instructorDashboard.contactSupport', '/'],
              ].map(([icon, label, to]) => (
                <Link
                  key={label}
                  className="mb-3 flex w-full items-center gap-3 rounded-lg bg-white/10 p-3 text-left font-label-md transition-colors hover:bg-white/20"
                  to={to}
                >
                  <Icon>{icon}</Icon>{t(label)}
                </Link>
              ))}
            </section>
            <section className="rounded-lg border border-slate-200 bg-surface-container-low p-lg">
              <h4 className="mb-md font-label-md uppercase tracking-widest text-primary">{t('instructorDashboard.news')}</h4>
              <p className="font-label-md text-on-surface">{t('instructorDashboard.platformUpdate')}</p>
              <p className="mt-1 font-caption text-on-surface-variant">{t('instructorDashboard.platformUpdateText')}</p>
            </section>
          </aside>
        </div>
      </main>
    </DashboardShell>
  )
}
