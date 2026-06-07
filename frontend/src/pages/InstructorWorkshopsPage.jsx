import { useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import Icon from '../components/Icon'
import { useI18n } from '../i18n/I18nContext'
import { useTeacherWorkshops } from '../lib/teacherWorkshops'

// Status badge config driven by API fields
function statusBadge(workshop, locale) {
  if (!workshop.is_active) {
    return {
      label: locale === 'de' ? 'Inaktiv' : 'Inactiv',
      tone: 'bg-surface-container text-slate-500',
    }
  }
  const isPast = new Date(workshop.scheduled_at) < new Date()
  if (isPast) {
    return {
      label: locale === 'de' ? 'Abgeschlossen' : 'Terminat',
      tone: 'bg-surface-container text-slate-500',
    }
  }
  return {
    label: locale === 'de' ? 'Aktiv' : 'Activ',
    tone: 'bg-secondary-container text-on-secondary-container',
  }
}

export default function InstructorWorkshopsPage() {
  const { t, locale } = useI18n()
  const [page, setPage] = useState(1)
  const { workshops, meta, isLoading, error } = useTeacherWorkshops({ page, perPage: 10 })

  const pageCount = meta?.last_page ?? 1

  return (
    <DashboardShell mode="teacher">
      <main className="mx-auto max-w-[1200px] p-8">
        <header className="mb-lg">
          <h1 className="mb-2 font-h1 text-h1 text-primary">{t('workshops.title')}</h1>
          <p className="max-w-2xl font-body-lg text-body-lg text-slate-600">{t('workshops.subtitle')}</p>
        </header>

        <div className="mb-md flex items-center justify-between border-b border-slate-200 pb-4">
          <p className="font-caption text-slate-500">
            {isLoading
              ? (locale === 'de' ? 'Lädt...' : 'Se încarcă...')
              : meta
              ? `${meta.total} ${locale === 'de' ? 'Workshops' : 'workshop-uri'}`
              : ''}
          </p>
          <Link
            to="/demo/dashboard/referent/workshops/new"
            className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-label-md font-label-md text-white transition-colors hover:bg-primary-container"
          >
            <Icon>add</Icon>
            {locale === 'de' ? 'Neuer Workshop' : 'Workshop nou'}
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-error/30 bg-error-container px-6 py-4 text-on-error-container">
            <p className="font-label-md">
              {locale === 'de'
                ? 'Workshops konnten nicht geladen werden.'
                : 'Nu am putut încărca workshop-urile.'}
            </p>
            <p className="mt-1 text-sm opacity-70">{error.message}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-md">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="animate-pulse flex gap-4 rounded-lg border border-outline-variant bg-white p-md">
                <div className="h-32 w-48 shrink-0 rounded bg-slate-100" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-4 w-3/4 rounded bg-slate-100" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                  <div className="h-3 w-1/3 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && workshops?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Icon className="mb-4 text-5xl text-slate-300">library_books</Icon>
            <p className="font-h3 text-h3 text-primary">
              {locale === 'de' ? 'Noch keine Workshops' : 'Niciun workshop creat'}
            </p>
            <p className="mt-2 mb-8 text-on-surface-variant">
              {locale === 'de'
                ? 'Erstelle deinen ersten Workshop.'
                : 'Creează primul tău workshop.'}
            </p>
            <Link
              to="/demo/dashboard/referent/workshops/new"
              className="rounded-lg bg-primary px-8 py-3 font-label-md text-white hover:opacity-90"
            >
              {locale === 'de' ? 'Workshop erstellen' : 'Creează workshop'}
            </Link>
          </div>
        )}

        {/* Workshop list */}
        {!isLoading && workshops && workshops.length > 0 && (
          <div className="space-y-md">
            {workshops.map((workshop) => {
              const { label: statusLabel, tone: statusTone } = statusBadge(workshop, locale)
              const title    = workshop.title?.[locale] ?? workshop.title?.ro ?? ''
              const dateStr  = new Date(workshop.scheduled_at).toLocaleDateString(
                locale === 'de' ? 'de-DE' : 'ro-RO',
                { day: 'numeric', month: 'long', year: 'numeric' },
              )

              return (
                <article
                  key={workshop.id}
                  className="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-white transition-shadow hover:shadow-[0_4px_12px_rgba(26,54,93,0.05)] md:flex-row"
                >
                  {/* Thumbnail placeholder */}
                  <div className="flex h-48 w-full shrink-0 items-center justify-center overflow-hidden bg-slate-100 md:h-auto md:w-64">
                    {workshop.cover_image_base64 ? (
                      <img className="h-full w-full object-cover" src={workshop.cover_image_base64} alt="" />
                    ) : (
                      <Icon className="text-4xl text-slate-300">image</Icon>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between p-md">
                    <div>
                      <div className="mb-2 flex items-start justify-between gap-4">
                        <h3 className="font-h3 text-h3 text-primary">{title}</h3>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${statusTone}`}>
                          {statusLabel}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2">
                        <Detail icon="group">
                          {workshop.occupied_slots}/{workshop.max_slots}{' '}
                          {t('workshops.enrolledStudents')}
                        </Detail>
                        <Detail icon="calendar_today">
                          {t('workshops.date')}: <strong>{dateStr}</strong>
                        </Detail>
                        <Detail icon="location_on">
                          {t('workshops.location')}: <strong>{workshop.location}</strong>
                        </Detail>
                        {workshop.available_slots === 0 && (
                          <Detail icon="hourglass_empty">
                            {locale === 'de' ? 'Ausgebucht' : 'Locuri epuizate'}
                          </Detail>
                        )}
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
                      <Link
                        to={`/demo/dashboard/teacher/workshops/${workshop.id}/participants`}
                        className="rounded bg-secondary px-6 py-2 text-label-md font-label-md text-white transition-colors hover:opacity-90"
                      >
                        {locale === 'de' ? 'Teilnehmende' : 'Participanți'}
                      </Link>
                      <Link
                        to={`/demo/dashboard/teacher/workshops/edit/${workshop.id}`}
                        className="rounded border border-primary px-6 py-2 text-label-md font-label-md text-primary transition-colors hover:bg-slate-50"
                      >
                        {t('common.edit')}
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && pageCount > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              className="border border-outline-variant p-2 text-primary transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              type="button"
            >
              <Icon>chevron_left</Icon>
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`h-10 w-10 border font-label-md ${
                  n === page
                    ? 'border-primary bg-primary text-white'
                    : 'border-outline-variant text-primary hover:bg-slate-50'
                }`}
                onClick={() => setPage(n)}
                type="button"
              >
                {n}
              </button>
            ))}
            <button
              className="border border-outline-variant p-2 text-primary transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page === pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              type="button"
            >
              <Icon>chevron_right</Icon>
            </button>
          </div>
        )}
      </main>
    </DashboardShell>
  )
}

function Detail({ icon, children }) {
  return (
    <p className="flex items-center gap-2 text-sm text-slate-600">
      <Icon className="h-4 w-4 text-slate-400">{icon}</Icon>
      {children}
    </p>
  )
}
