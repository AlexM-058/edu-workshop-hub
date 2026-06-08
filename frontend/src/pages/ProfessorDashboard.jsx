import { useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import Icon from '../components/Icon'
import { useAppAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { useAttenderRegistrations, useAttenderStats } from '../lib/attenderRegistrations'
import { downloadCertificate, withdrawRegistration } from '../lib/api'
import { createGoogleCalendarWorkshopUrl } from '../lib/calendar'
import { downloadBlob } from '../lib/downloadFile'
import WithdrawWarningModal from '../components/WithdrawWarningModal'
import WithdrawBlockedModal from '../components/WithdrawBlockedModal'

// Status config keyed by registration.status value
const STATUS_CONFIG = {
  enrolled:  { ro: 'Înscris',        de: 'Eingeschrieben', tone: 'bg-secondary-container text-on-secondary-container' },
  waitlist:  { ro: 'Listă așteptare', de: 'Warteliste',     tone: 'bg-amber-100 text-amber-800' },
  cancelled: { ro: 'Anulat',         de: 'Abgebrochen',    tone: 'bg-surface-container text-slate-500' },
}

export default function ProfessorDashboard() {
  const { t, locale } = useI18n()
  const { appUser, getToken } = useAppAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [actionError, setActionError] = useState(null)
  const [busyRegistrationId, setBusyRegistrationId] = useState(null)
  const [withdrawModalRegistration, setWithdrawModalRegistration] = useState(null)
  const [blockedModalRegistration, setBlockedModalRegistration] = useState(null)

  const { registrations, meta, isLoading, error } = useAttenderRegistrations({ perPage: 5, refreshKey })
  const { stats, isLoading: statsLoading } = useAttenderStats()

  async function handleCertificateDownload(registration) {
    setActionError(null)
    setBusyRegistrationId(registration.id)
    try {
      const token = await getToken()
      const blob = await downloadCertificate({ token, workshopId: registration.workshop.id })
      downloadBlob(blob, `certificate-${registration.id}.pdf`)
    } catch (error) {
      setActionError(error)
    } finally {
      setBusyRegistrationId(null)
    }
  }

  function handleWithdrawClick(reg) {
    if (!reg.workshop?.scheduled_at) {
      setWithdrawModalRegistration(reg)
      return
    }

    const startsAt = new Date(reg.workshop.scheduled_at)
    const now = new Date()
    // Calculate difference in hours
    const diffHours = (startsAt - now) / (1000 * 60 * 60)

    if (diffHours < 24) {
      setBlockedModalRegistration(reg)
    } else {
      setWithdrawModalRegistration(reg)
    }
  }

  async function confirmWithdraw() {
    if (!withdrawModalRegistration) return

    setActionError(null)
    setBusyRegistrationId(withdrawModalRegistration.id)
    try {
      const token = await getToken()
      await withdrawRegistration({ token, registrationId: withdrawModalRegistration.id })
      setRefreshKey((value) => value + 1)
      setWithdrawModalRegistration(null)
    } catch (error) {
      setActionError(error)
      setWithdrawModalRegistration(null)
    } finally {
      setBusyRegistrationId(null)
    }
  }

  const greeting = appUser?.first_name
    ? (locale === 'de' ? `Willkommen, ${appUser.first_name}!` : `Bine ai revenit, ${appUser.first_name}!`)
    : t('dashboard.welcome')

  return (
    <DashboardShell>
      <div className="mx-auto max-w-7xl px-10 py-12">

        {/* Welcome header */}
        <header className="mb-12">
          <h1 className="mb-2 font-h1 text-h1 text-primary">{greeting}</h1>
          <p className="max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
            {locale === 'de'
              ? 'Hier siehst du deine aktuellen Einschreibungen und Aktivitäten.'
              : 'Iată o privire de ansamblu asupra workshop-urilor și activității tale recente.'}
          </p>
        </header>

        <div className="grid grid-cols-12 gap-gutter">

          {/* Main content — registrations list */}
          <section className="col-span-12 space-y-md lg:col-span-8">
            <div className="mb-2 flex items-center justify-between gap-4">
              <h2 className="font-h3 text-h3 text-primary">{t('dashboard.active')}</h2>
              <Link
                className="inline-flex items-center gap-1 whitespace-nowrap font-label-md text-primary hover:underline"
                to="/catalog"
              >
                {t('common.viewAll')} <Icon className="h-4 w-4">arrow_forward</Icon>
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-error/30 bg-error-container px-6 py-4 text-on-error-container">
                <p className="font-label-md">
                  {locale === 'de'
                    ? 'Einschreibungen konnten nicht geladen werden.'
                    : 'Nu am putut încărca înregistrările.'}
                </p>
                <p className="mt-1 text-sm opacity-70">{error.message}</p>
              </div>
            )}

            {actionError && (
              <div className="rounded-lg border border-error/30 bg-error-container px-6 py-4 text-on-error-container">
                <p className="font-label-md">
                  {locale === 'de' ? 'Aktion konnte nicht abgeschlossen werden.' : 'Acțiunea nu a putut fi finalizată.'}
                </p>
                <p className="mt-1 text-sm opacity-70">{actionError.message}</p>
              </div>
            )}

            {/* Loading skeleton */}
            {isLoading && (
              <div className="space-y-md">
                {Array.from({ length: 2 }, (_, i) => (
                  <div key={i} className="animate-pulse flex gap-6 rounded-lg border border-outline-variant bg-white p-md">
                    <div className="h-32 w-48 shrink-0 rounded-lg bg-slate-100" />
                    <div className="flex-1 space-y-3 py-2">
                      <div className="h-4 w-3/4 rounded bg-slate-100" />
                      <div className="h-3 w-1/2 rounded bg-slate-100" />
                      <div className="h-2 w-full rounded-full bg-slate-100 mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && registrations?.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center">
                <Icon className="mb-4 text-5xl text-slate-300">school</Icon>
                <p className="mb-2 font-h3 text-h3 text-primary">
                  {locale === 'de' ? 'Noch keine Einschreibungen' : 'Nicio înscriere încă'}
                </p>
                <p className="mb-8 text-on-surface-variant">
                  {locale === 'de'
                    ? 'Entdecke Workshops und melde dich an.'
                    : 'Explorează catalogul și înscrie-te la un workshop.'}
                </p>
                <Link
                  to="/catalog"
                  className="rounded-lg bg-primary px-8 py-3 font-label-md text-white hover:opacity-90"
                >
                  {t('landing.explore')}
                </Link>
              </div>
            )}

            {/* Registrations list */}
            {!isLoading && registrations && registrations.length > 0 && (
              <div className="space-y-md">
                {registrations.map((reg) => {
                  const title    = reg.workshop?.title?.[locale] ?? reg.workshop?.title?.ro ?? '—'
                  const dateStr  = reg.workshop?.scheduled_at
                    ? new Date(reg.workshop.scheduled_at).toLocaleDateString(
                        locale === 'de' ? 'de-DE' : 'ro-RO',
                        { day: 'numeric', month: 'long', year: 'numeric' },
                      )
                    : '—'
                  const statusCfg = STATUS_CONFIG[reg.status] ?? STATUS_CONFIG.enrolled
                  const statusLabel = locale === 'de' ? statusCfg.de : statusCfg.ro
                  const isBusy = busyRegistrationId === reg.id
                  const calendarUrl = reg.status === 'enrolled'
                    ? createGoogleCalendarWorkshopUrl(reg.workshop, locale)
                    : null

                  return (
                    <article
                      key={reg.id}
                      className="flex flex-col gap-6 rounded-lg border border-outline-variant bg-white p-md transition-shadow hover:shadow-sm md:flex-row"
                    >
                      {/* Thumbnail placeholder */}
                      <div className="flex h-32 w-full shrink-0 items-center justify-center rounded-lg bg-slate-100 md:w-48">
                        <Icon className="text-4xl text-slate-300">image</Icon>
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <div className="mb-1 flex items-start justify-between gap-2">
                            <h3 className="font-h3 text-xl text-primary">{title}</h3>
                            <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${statusCfg.tone}`}>
                              {statusLabel}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            {reg.workshop?.referent && (
                              <p className="text-sm text-on-surface-variant">
                                <Icon className="inline-block text-sm mr-1">person</Icon>
                                {reg.workshop.referent.name}
                              </p>
                            )}
                            <p className="text-sm text-on-surface-variant">
                              <Icon className="inline-block text-sm mr-1">calendar_today</Icon>
                              {dateStr}
                            </p>
                            {reg.workshop?.location && (
                              <p className="text-sm text-on-surface-variant">
                                <Icon className="inline-block text-sm mr-1">location_on</Icon>
                                {reg.workshop.location}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Certificate CTA or attendance status */}
                        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          {reg.can_download_certificate ? (
                            <button
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-2 font-label-md text-white transition-colors hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
                              disabled={isBusy}
                              onClick={() => handleCertificateDownload(reg)}
                              type="button"
                            >
                              <Icon>workspace_premium</Icon>
                              {locale === 'de' ? 'Zertifikat herunterladen' : 'Descarcă certificatul'}
                            </button>
                          ) : reg.attended ? (
                            <span className="inline-flex items-center gap-2 rounded-lg border border-secondary/30 px-5 py-2 text-sm text-secondary">
                              <Icon>check_circle</Icon>
                              {locale === 'de' ? 'Anwesenheit bestätigt' : 'Prezență confirmată'}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">
                              {locale === 'de' ? 'Ausstehend' : 'În așteptare'}
                            </span>
                          )}
                          <div className="flex flex-wrap items-center gap-3">
                            {calendarUrl ? (
                              <a
                                className="inline-flex items-center gap-1 rounded border border-primary/30 px-4 py-2 text-sm font-label-md text-primary transition hover:bg-primary/5"
                                href={calendarUrl}
                                rel="noreferrer"
                                target="_blank"
                              >
                                <Icon className="text-base">event</Icon>
                                {t('dashboard.addGoogleCalendar')}
                              </a>
                            ) : reg.status === 'enrolled' ? (
                              <span className="text-sm text-slate-400">
                                {t('dashboard.calendarUnavailable')}
                              </span>
                            ) : null}
                            {reg.status !== 'cancelled' && (
                                <button
                                  className="rounded border border-error/40 px-4 py-2 text-sm font-label-md text-error transition hover:bg-error-container disabled:cursor-wait disabled:opacity-60"
                                  disabled={isBusy}
                                  onClick={() => handleWithdrawClick(reg)}
                                  type="button"
                                >
                                  {locale === 'de' ? 'Zurückziehen' : 'Retrage'}
                                </button>
                            )}
                            <Link
                              to={`/workshops/${reg.workshop?.id}`}
                              className="font-label-md text-primary hover:underline"
                            >
                              {locale === 'de' ? 'Details' : 'Detalii'}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

            {/* View all link if there are more */}
            {meta && meta.total > 5 && (
              <p className="mt-4 text-center text-sm text-on-surface-variant">
                {meta.total - 5}{' '}
                {locale === 'de' ? 'weitere Einschreibungen' : 'înregistrări suplimentare'} —{' '}
                <Link
                  className="font-label-md text-primary hover:underline"
                  to="/demo/history"
                >
                  {t('common.viewAll')}
                </Link>
              </p>
            )}
          </section>

          {/* Sidebar — stats + recommended */}
          <aside className="col-span-12 space-y-md lg:col-span-4">
            <div className="rounded-lg bg-primary p-lg text-white shadow-md">
              <h3 className="mb-6 font-h3 text-xl">{t('dashboard.learningVelocity')}</h3>
              <div className="space-y-6">
                <Stat
                  icon="workspace_premium"
                  value={statsLoading ? '—' : String(stats?.total_certificates ?? 0)}
                  label={t('dashboard.certificatesTotal')}
                  loading={statsLoading}
                />
                <Stat
                  icon="school"
                  value={statsLoading ? '—' : String(stats?.total_enrolled ?? 0)}
                  label={locale === 'de' ? 'Aktive Einschreibungen' : 'Înscrieri active'}
                  loading={statsLoading}
                />
                <Stat
                  icon="how_to_reg"
                  value={statsLoading ? '—' : String(stats?.total_attended ?? 0)}
                  label={locale === 'de' ? 'Abgeschlossene Workshops' : 'Workshops finalizate'}
                  loading={statsLoading}
                />
              </div>
              <button
                className="mt-8 w-full cursor-not-allowed rounded bg-secondary-container py-3 font-label-md text-on-secondary-container opacity-60"
                disabled
                title={t('common.demoUnavailable')}
                type="button"
              >
                {t('dashboard.downloadTranscript')}
              </button>
            </div>

            <div className="rounded-lg border border-outline-variant bg-white p-md">
              <h3 className="mb-4 font-h3 text-lg text-primary">{t('dashboard.recommended')}</h3>
              <p className="text-sm text-on-surface-variant">
                {locale === 'de'
                  ? 'Empfehlungen sind verfügbar, sobald die API verbunden ist.'
                  : 'Recomandările vor fi disponibile după conectarea API-ului.'}
              </p>
              <Link
                to="/catalog"
                className="mt-4 inline-flex items-center gap-1 font-label-md text-primary hover:underline"
              >
                {locale === 'de' ? 'Katalog durchsuchen' : 'Explorează catalogul'}
                <Icon className="h-4 w-4">arrow_forward</Icon>
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <WithdrawWarningModal 
        isOpen={!!withdrawModalRegistration} 
        onClose={() => setWithdrawModalRegistration(null)} 
        onConfirm={confirmWithdraw} 
        isBusy={!!busyRegistrationId}
      />

      <WithdrawBlockedModal
        isOpen={!!blockedModalRegistration}
        onClose={() => setBlockedModalRegistration(null)}
      />
    </DashboardShell>
  )
}

function Stat({ icon, value, label, loading }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10">
        <Icon className="h-6 w-6 text-secondary-fixed">{icon}</Icon>
      </div>
      <div className="min-w-0">
        <div className={`text-2xl font-bold leading-none ${loading ? 'animate-pulse' : ''}`}>{value}</div>
        <div className="mt-1 text-xs font-label-md text-on-primary-container">{label}</div>
      </div>
    </div>
  )
}
