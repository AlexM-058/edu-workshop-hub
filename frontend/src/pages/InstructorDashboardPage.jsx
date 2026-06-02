import { Link } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import Icon from '../components/Icon'
import { useI18n } from '../i18n/I18nContext'

const metrics = [
  ['group', 'instructorDashboard.studentsTotal', '2,482', '+8%', 'bg-blue-50 text-blue-700'],
  ['import_contacts', 'instructorDashboard.activeWorkshops', '12', 'instructorDashboard.active', 'bg-green-50 text-green-700'],
  ['payments', 'instructorDashboard.totalRevenue', '€14,250', '+12%', 'bg-amber-50 text-amber-700'],
  ['star', 'instructorDashboard.averageRating', '4.9 / 5', 'instructorDashboard.stable', 'bg-purple-50 text-purple-700'],
]

const shortcuts = [
  ['school', 'nav.myWorkshops', 'instructorDashboard.myWorkshopsText', 'instructorDashboard.viewWorkshops', '/demo/dashboard/teacher/workshops', 'bg-blue-50 text-blue-700'],
  ['add_circle', 'instructorDashboard.createWorkshop', 'instructorDashboard.createText', 'instructorDashboard.createNow', '/demo/dashboard/teacher/workshops/new', 'bg-green-50 text-green-700'],
  ['analytics', 'nav.analytics', 'instructorDashboard.analyticsText', 'instructorDashboard.viewReports', '/demo/dashboard/teacher/analytics', 'bg-amber-50 text-amber-700'],
]

const activeWorkshops = [
  ['architecture', 'Advanced Architectural Design Patterns', '842', 'instructorDashboard.endsIn12', '65%', 'bg-primary-fixed text-primary'],
  ['palette', 'Teoria Culorilor în Design Modern', '442', 'instructorDashboard.endsIn24', '40%', 'bg-secondary-container text-secondary'],
]

const activity = [
  ['avatar', 'Marius Popescu', 'instructorDashboard.activity1', 'instructorDashboard.now2m'],
  ['chat', 'Marcus Thorne', 'instructorDashboard.activity2', 'instructorDashboard.now1h'],
  ['task', 'Ana Ionescu', 'instructorDashboard.activity3', 'instructorDashboard.now3h'],
]

export default function InstructorDashboardPage() {
  const { t } = useI18n()

  return (
    <DashboardShell mode="teacher">
      <main className="mx-auto max-w-[1400px] p-8">
        <header className="mb-xl flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="mb-xs font-h1 text-h2 text-primary">{t('instructorDashboard.greeting')}</h1>
            <p className="font-body-lg text-on-surface-variant">{t('instructorDashboard.subtitle')}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="font-caption text-slate-500">{t('instructorDashboard.today')}</p>
            <p className="font-label-md text-primary">26 Mai, 2026</p>
          </div>
        </header>

        <section className="mb-xl grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([icon, label, value, trend, tone]) => (
            <article key={label} className="rounded-lg border border-slate-200 bg-white p-md shadow-sm">
              <div className="mb-sm flex items-start justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}><Icon className="h-5 w-5">{icon}</Icon></span>
                <span className="text-xs font-label-md text-secondary">{trend.startsWith('instructorDashboard.') ? t(trend) : trend}</span>
              </div>
              <p className="font-label-md text-slate-500">{t(label)}</p>
              <h3 className="font-h2 text-h3 text-primary">{value}</h3>
            </article>
          ))}
        </section>

        <section className="mb-xl">
          <h2 className="mb-md font-h3 text-h3 text-primary">{t('instructorDashboard.quickAccess')}</h2>
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
            {shortcuts.map(([icon, title, copy, action, to, tone]) => (
              <article key={title} className="flex min-h-56 flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div>
                  <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${tone}`}><Icon className="h-6 w-6">{icon}</Icon></span>
                  <h3 className="mb-2 text-lg font-label-md text-primary">{t(title)}</h3>
                  <p className="font-caption text-slate-500">{t(copy)}</p>
                </div>
                <Link className="mt-md inline-flex w-full items-center justify-center rounded border border-primary px-4 py-2 text-sm font-label-md text-primary transition-colors hover:bg-primary hover:text-white" to={to}>{t(action)}</Link>
              </article>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-12 gap-gutter">
          <section className="col-span-12 space-y-xl lg:col-span-8">
            <div>
              <div className="mb-md flex items-center justify-between">
                <h2 className="font-h3 text-h3 text-primary">{t('instructorDashboard.activeWorkshops')}</h2>
                <Link className="font-label-md text-primary hover:underline" to="/demo/dashboard/teacher/workshops">{t('common.viewAll')}</Link>
              </div>
              <div className="space-y-4">
                {activeWorkshops.map(([icon, title, students, date, progress, tone]) => (
                  <article key={title} className="flex flex-col gap-md rounded-lg border border-slate-200 bg-white p-md md:flex-row md:items-center">
                    <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon className="h-8 w-8">{icon}</Icon></span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-lg font-label-md text-primary">{title}</h4>
                      <div className="mt-1 flex flex-wrap gap-4 font-caption text-slate-500">
                        <span className="inline-flex items-center gap-1"><Icon>person</Icon>{students} {t('instructorDashboard.students')}</span>
                        <span className="inline-flex items-center gap-1"><Icon>calendar_today</Icon>{t(date)}</span>
                      </div>
                      <div className="mt-md">
                        <div className="mb-1 flex items-center justify-between"><span className="font-caption text-slate-400">{t('instructorDashboard.courseProgress')}</span><span className="font-caption font-bold text-primary">{progress}</span></div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-surface-container"><div className="h-full bg-primary" style={{ width: progress }} /></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link className="rounded border border-slate-200 px-4 py-2 text-sm font-label-md hover:bg-slate-50" to="/demo/dashboard/teacher/workshops/new">{t('common.edit')}</Link>
                      <Link className="rounded bg-primary px-4 py-2 text-sm font-label-md text-white hover:bg-primary-container" to="/demo/dashboard/teacher/analytics">{t('nav.analytics')}</Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <section>
              <h2 className="mb-md font-h3 text-h3 text-primary">{t('instructorDashboard.recentActivity')}</h2>
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                {activity.map(([icon, actor, copy, time]) => (
                  <div key={actor + time} className="flex gap-md p-md">
                    {icon === 'avatar' ? <div className="h-10 w-10 shrink-0 rounded-full bg-primary-fixed" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-secondary"><Icon>{icon}</Icon></span>}
                    <div className="min-w-0 flex-1">
                      <p className="font-body-md text-on-surface"><strong>{actor}</strong> {t(copy)}</p>
                      <span className="text-xs font-caption text-slate-400">{t(time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <aside className="col-span-12 space-y-gutter lg:col-span-4">
            <section className="rounded-lg bg-primary p-lg text-white shadow-md">
              <h3 className="mb-md font-h3 text-h3">{t('instructorDashboard.quickActions')}</h3>
              {[
                ['add_box', 'instructorDashboard.createWorkshop', '/demo/dashboard/teacher/workshops/new'],
                ['card_membership', 'instructorDashboard.viewCertificates', '/demo/dashboard/attender?panel=certificates'],
                ['support_agent', 'instructorDashboard.contactSupport', '/'],
              ].map(([icon, label, to]) => <Link key={label} className="mb-3 flex w-full items-center gap-3 rounded-lg bg-white/10 p-3 text-left font-label-md transition-colors hover:bg-white/20" to={to}><Icon>{icon}</Icon>{t(label)}</Link>)}
            </section>
            <section className="rounded-lg border border-slate-200 bg-surface-container-low p-lg">
              <h4 className="mb-md font-label-md uppercase tracking-widest text-primary">{t('instructorDashboard.news')}</h4>
              <p className="font-label-md text-on-surface">{t('instructorDashboard.platformUpdate')}</p>
              <p className="mt-1 font-caption text-on-surface-variant">{t('instructorDashboard.platformUpdateText')}</p>
              <hr className="my-4 border-slate-200" />
              <p className="font-label-md text-on-surface">{t('instructorDashboard.webinar')}</p>
              <p className="mt-1 font-caption text-on-surface-variant">{t('instructorDashboard.webinarText')}</p>
            </section>
          </aside>
        </div>
      </main>
    </DashboardShell>
  )
}
