import { Link } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import Icon from '../components/Icon'
import { useI18n } from '../i18n/I18nContext'
import { useAttenderRegistrations } from '../lib/attenderRegistrations'

export default function HistoryPage() {
  const { locale } = useI18n()
  const { registrations, isLoading, error } = useAttenderRegistrations({ perPage: 30 })
  const completed = registrations?.filter((reg) => reg.attended || reg.status === 'cancelled') ?? []

  return (
    <DashboardShell>
      <main className="mx-auto max-w-[1100px] p-8">
        <header className="mb-lg border-b border-slate-200 pb-md">
          <h1 className="font-h1 text-h1 text-primary">{locale === 'de' ? 'Verlauf' : 'Istoric'}</h1>
          <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
            {locale === 'de'
              ? 'Abgeschlossene, besuchte oder abgebrochene Workshop-Einschreibungen.'
              : 'Înscrieri finalizate, frecventate sau anulate.'}
          </p>
        </header>

        {error ? (
          <div className="mb-md rounded-lg border border-error/30 bg-error-container px-6 py-4 text-on-error-container">
            {locale === 'de' ? 'Verlauf konnte nicht geladen werden.' : 'Istoricul nu a putut fi încărcat.'}
          </div>
        ) : null}

        {isLoading ? (
          <LoadingRows />
        ) : completed.length === 0 ? (
          <section className="rounded-lg border border-dashed border-slate-300 bg-white py-20 text-center">
            <Icon className="mb-3 text-5xl text-slate-300">history</Icon>
            <p className="font-h3 text-h3 text-primary">{locale === 'de' ? 'Noch kein Verlauf' : 'Nu există istoric încă'}</p>
            <p className="mt-2 text-on-surface-variant">
              {locale === 'de' ? 'Besuchte Workshops erscheinen hier.' : 'Workshop-urile frecventate vor apărea aici.'}
            </p>
            <Link className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 font-label-md text-white" to="/catalog">
              {locale === 'de' ? 'Katalog öffnen' : 'Deschide catalogul'}
            </Link>
          </section>
        ) : (
          <section className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {completed.map((reg) => (
              <HistoryRow key={reg.id} locale={locale} registration={reg} />
            ))}
          </section>
        )}
      </main>
    </DashboardShell>
  )
}

function HistoryRow({ registration, locale }) {
  const title = registration.workshop?.title?.[locale] ?? registration.workshop?.title?.ro ?? '-'
  const date = registration.workshop?.scheduled_at
    ? new Date(registration.workshop.scheduled_at).toLocaleDateString(locale === 'de' ? 'de-DE' : 'ro-RO', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '-'
  const isCancelled = registration.status === 'cancelled'

  return (
    <article className="flex flex-col gap-4 p-md md:flex-row md:items-center">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${isCancelled ? 'bg-surface-container text-slate-500' : 'bg-secondary-container text-on-secondary-container'}`}>
        <Icon>{isCancelled ? 'cancel' : 'check_circle'}</Icon>
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="font-h3 text-xl text-primary">{title}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">{date}</p>
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${isCancelled ? 'bg-surface-container text-slate-500' : 'bg-secondary-container text-on-secondary-container'}`}>
        {isCancelled
          ? (locale === 'de' ? 'Abgebrochen' : 'Anulat')
          : (locale === 'de' ? 'Abgeschlossen' : 'Finalizat')}
      </span>
    </article>
  )
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-4 rounded-lg border border-slate-200 bg-white p-md">
          <div className="h-12 w-12 rounded-lg bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 rounded bg-slate-100" />
            <div className="h-3 w-1/4 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}
