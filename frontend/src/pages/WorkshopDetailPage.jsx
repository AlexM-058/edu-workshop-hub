import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAppAuth } from '../auth/AuthContext'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import TopNav from '../components/TopNav'
import { useI18n } from '../i18n/I18nContext'
import { enrollInWorkshop, fetchRegistrationStatus, deleteWorkshopByAdmin, downloadCertificate } from '../lib/api'
import { createGoogleCalendarWorkshopUrl } from '../lib/calendar'
import { useWorkshop } from '../lib/workshops'
import { submitWorkshopEnrollment } from './workshopEnrollment'
import AdminDeleteWorkshopModal from '../components/AdminDeleteWorkshopModal'

const FALLBACK_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDecgUTSAa8efi825vgclrR5eXRLD1K7Z6VU2zd0_0MZ7xDmEXe_E7MFXSSDEfuAkQEWol_G2pfO0KhMOU9SMyy2qDQgPh7TjIBzTavQYO1QgAT-KMEwimICVDw7m72LQP0yJtPHUxJkJL1lPBkMviigLqWtoBfxkuMTtITDhlit9pURAqctEW79uy_jp13ftcO1V6HsT37n2g9fdmx3IzHXgNFS2hpoZlIp3PES-sI1kaD15H1CeZcLtkBXdGfDl5ioSp7NolKgDQ'

export default function WorkshopDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, locale } = useI18n()
  const { getToken, isSignedIn, isSyncing, role } = useAppAuth()
  const { workshop, isLoading, error } = useWorkshop(id)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [enrollmentError, setEnrollmentError] = useState('')
  const [enrollmentSuccess, setEnrollmentSuccess] = useState('')
  const [registrationStatus, setRegistrationStatus] = useState(null)
  const [attended, setAttended] = useState(false)
  const [isStatusLoading, setIsStatusLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (isSignedIn && role === 'attender' && id) {
      setIsStatusLoading(true)
      getToken()
        .then(token => fetchRegistrationStatus({ token, workshopId: id }))
        .then(res => {
          setRegistrationStatus(res?.status || null)
          setAttended(res?.attended || false)
        })
        .catch(console.error)
        .finally(() => setIsStatusLoading(false))
    }
  }, [id, isSignedIn, role, getToken])

  const title = workshop?.title?.[locale] ?? workshop?.title?.ro ?? ''
  const description = workshop?.description?.[locale] ?? workshop?.description?.ro ?? ''
  const dateStr = workshop?.scheduled_at
    ? new Date(workshop.scheduled_at).toLocaleDateString(
      locale === 'de' ? 'de-DE' : 'ro-RO',
      { day: 'numeric', month: 'long', year: 'numeric' },
    ) + (workshop.ends_at ? ' - ' + new Date(workshop.ends_at).toLocaleDateString(
      locale === 'de' ? 'de-DE' : 'ro-RO',
      { day: 'numeric', month: 'long', year: 'numeric' },
    ) : '')
    : '-'

  async function handleEnrollment() {
    if (!isSignedIn) {
      setEnrollmentSuccess('')
      setEnrollmentError(t('detail.enrollErrorSignIn'))
      return
    }

    if (role && role !== 'attender') {
      setEnrollmentSuccess('')
      setEnrollmentError(t('detail.enrollErrorForbidden'))
      return
    }

    setIsEnrolling(true)
    setEnrollmentError('')
    setEnrollmentSuccess('')

    const result = await submitWorkshopEnrollment({
      workshopId: id,
      getToken,
      enrollInWorkshop,
      t,
    })

    setEnrollmentError(result.errorMessage)
    setEnrollmentSuccess(result.successMessage)
    setIsEnrolling(false)

    if (result.successMessage) {
      // Re-fetch status if successful
      getToken().then(token => fetchRegistrationStatus({ token, workshopId: id }))
        .then(res => {
          setRegistrationStatus(res?.status || null)
          setAttended(res?.attended || false)
        })
    }
  }

  // Determine button state
  const hasAvailableSlots = workshop?.available_slots > 0
  let buttonDisabled = isEnrolling || isSyncing || isStatusLoading
  let buttonLabel = t('detail.enrollNow')

  if (registrationStatus === 'enrolled') {
    buttonDisabled = true
    buttonLabel = t('detail.alreadyEnrolled')
  } else if (registrationStatus === 'waitlist') {
    buttonDisabled = true
    buttonLabel = t('detail.onWaitlist')
  } else if (registrationStatus === 'cancelled') {
    buttonDisabled = true
    buttonLabel = t('detail.withdrawn')
  } else if (!hasAvailableSlots) {
    buttonLabel = t('detail.joinWaitlist')
  }

  if (isEnrolling) {
    buttonLabel = t('detail.enrolling')
  }

  const hasEnded = workshop?.ends_at ? new Date(workshop.ends_at) < new Date() : false;
  const canDownloadCertificate = registrationStatus === 'enrolled' && attended && hasEnded;
  const calendarUrl = registrationStatus === 'enrolled'
    ? createGoogleCalendarWorkshopUrl(workshop, locale)
    : null

  async function handleDownloadCertificate() {
    setIsDownloading(true)
    setEnrollmentError('')
    
    try {
      const token = await getToken()
      const blob = await downloadCertificate({ token, workshopId: id })
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificat_participare_${id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setEnrollmentError(err.message || 'Eroare la descărcarea certificatului')
    } finally {
      setIsDownloading(false)
    }
  }

  async function handleDeleteConfirm() {
    setIsDeleting(true)
    setEnrollmentError('')
    try {
      const token = await getToken()
      await deleteWorkshopByAdmin({ token, workshopId: id })
      navigate('/catalog', { replace: true })
    } catch (err) {
      setEnrollmentError(err.message || 'Error deleting workshop')
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
    }
  }

  return (
    <div className="bg-surface text-on-surface">
      <TopNav showSearch={false} />
      <main className="mx-auto max-w-7xl px-8 py-xl pt-28">
        {isLoading && (
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-2/3 rounded bg-slate-100" />
            <div className="h-5 w-full max-w-2xl rounded bg-slate-100" />
            <div className="h-5 w-1/2 rounded bg-slate-100" />
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Icon className="mb-4 text-6xl text-slate-300">search_off</Icon>
            <h1 className="mb-2 font-h2 text-h2 text-primary">
              {error.status === 404
                ? (locale === 'de' ? 'Workshop nicht gefunden' : 'Workshop negăsit')
                : (locale === 'de' ? 'Fehler beim Laden' : 'Eroare la încărcare')}
            </h1>
            <p className="mb-8 text-on-surface-variant">{error.message}</p>
            <Link to="/catalog" className="rounded-lg bg-primary px-8 py-3 font-label-md text-white hover:opacity-90">
              {locale === 'de' ? 'Zurück zum Katalog' : 'Înapoi la catalog'}
            </Link>
          </div>
        )}

        {!isLoading && workshop && (
          <>
            <section className="mb-xl grid grid-cols-1 items-center gap-xl lg:grid-cols-12">
              <div className="lg:col-span-7">
                <nav className="mb-6 flex gap-2 text-xs font-label-md uppercase tracking-widest text-on-surface-variant">
                  <Link to="/catalog" className="hover:text-primary">
                    {locale === 'de' ? 'Katalog' : 'Catalog'}
                  </Link>
                  <Icon className="text-sm">chevron_right</Icon>
                  <span className="font-bold text-primary">{title}</span>
                </nav>

                <h1 className="mb-6 font-h1 text-h1 leading-tight text-primary">{title}</h1>

                {description ? (
                  <p className="mb-8 max-w-2xl font-body-lg text-body-lg text-on-surface-variant">{description}</p>
                ) : null}

                <div className="mb-10 flex flex-wrap gap-6">
                  <Info icon="calendar_today">{dateStr}</Info>
                  <Info icon="group">
                    {workshop.occupied_slots}/{workshop.max_slots} {locale === 'de' ? 'Teilnehmende' : 'participanti'}
                  </Info>
                  <Info icon="location_on">{workshop.location}</Info>
                </div>

                <div className="flex flex-wrap gap-4">
                  {role === 'admin' ? (
                    <button
                      className="rounded-xl bg-error px-10 py-4 font-label-md text-white shadow-lg shadow-error/10 transition-all hover:bg-error/90 disabled:cursor-wait disabled:opacity-70"
                      onClick={() => setIsDeleteModalOpen(true)}
                      type="button"
                    >
                      {t('admin.deleteWorkshop')}
                    </button>
                  ) : (
                    <button
                      className="rounded-xl bg-primary px-10 py-4 font-label-md text-on-primary shadow-lg shadow-primary/10 transition-all hover:opacity-95 disabled:cursor-wait disabled:opacity-70"
                      disabled={buttonDisabled}
                      onClick={handleEnrollment}
                      type="button"
                    >
                      {buttonLabel}
                    </button>
                  )}
                  {role === 'attender' && canDownloadCertificate ? (
                    <button
                      className="rounded-xl border-2 border-primary px-8 py-4 font-label-md text-primary transition-all hover:bg-primary/5 disabled:cursor-wait disabled:opacity-70 flex items-center gap-2"
                      onClick={handleDownloadCertificate}
                      disabled={isDownloading}
                      type="button"
                    >
                      <Icon className="text-lg">workspace_premium</Icon>
                      {locale === 'de' ? 'Zertifikat herunterladen' : 'Descarcă certificatul de participare'}
                    </button>
                  ) : (
                    <button className="cursor-not-allowed rounded-xl border-2 border-outline-variant px-8 py-4 font-label-md text-primary opacity-60" disabled title={t('common.demoUnavailable')} type="button">
                      {t('detail.download')}
                    </button>
                  )}
                  {role === 'attender' && registrationStatus === 'enrolled' && calendarUrl ? (
                    <a
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-primary px-8 py-4 font-label-md text-primary transition-all hover:bg-primary/5"
                      href={calendarUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Icon className="text-lg">event</Icon>
                      {t('dashboard.addGoogleCalendar')}
                    </a>
                  ) : role === 'attender' && registrationStatus === 'enrolled' ? (
                    <span className="inline-flex items-center rounded-xl border border-outline-variant px-5 py-3 text-sm text-slate-400">
                      {t('dashboard.calendarUnavailable')}
                    </span>
                  ) : null}
                </div>

                {enrollmentSuccess ? (
                  <p className="mt-4 rounded-lg border border-secondary/30 bg-secondary-container px-4 py-3 font-body-md text-on-secondary-container" role="status">
                    {enrollmentSuccess}
                  </p>
                ) : null}
                {enrollmentError ? (
                  <p className="mt-4 rounded-lg border border-error/30 bg-error-container px-4 py-3 font-body-md text-on-error-container" role="alert">
                    {enrollmentError}
                  </p>
                ) : null}
              </div>

              <div className="relative lg:col-span-5">
                <div className="aspect-[4/5] overflow-hidden rounded-xl border border-outline-variant/30 shadow-2xl">
                  <img className="h-full w-full object-cover" src={workshop.cover_image_base64 || FALLBACK_IMAGE} alt="" />
                </div>
                {workshop.referent ? (
                  <div className="absolute -bottom-6 -left-6 rounded-xl border border-secondary/20 bg-secondary-container p-6 text-on-secondary-container shadow-xl">
                    <div className="flex items-center gap-3">
                      {workshop.professor_image_base64 ? (
                        <img src={workshop.professor_image_base64} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                      ) : (
                        <Icon className="text-3xl">person</Icon>
                      )}
                      <div>
                        <p className="font-label-md">{workshop.coordinator_name || workshop.referent?.name || '-'}</p>
                        <p className="text-xs opacity-80">{locale === 'de' ? 'Leitende Person' : 'Teacher'}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <div className="mb-xl grid grid-cols-1 gap-gutter md:grid-cols-3">
              <article className="rounded-xl border border-outline-variant bg-white p-8 shadow-sm md:col-span-2">
                <h2 className="mb-6 font-h2 text-h2 text-primary">{t('detail.overview')}</h2>
                <div className="space-y-4 font-body-md leading-relaxed text-on-surface-variant">
                  {description ? (
                    <p>{description}</p>
                  ) : (
                    <p className="italic opacity-60">{locale === 'de' ? 'Keine Beschreibung verfügbar.' : 'Nicio descriere disponibilă.'}</p>
                  )}
                  {workshop.coordinator_bio && (
                    <div className="mt-8 border-t border-slate-100 pt-6">
                      <h3 className="mb-4 font-label-lg text-primary">{locale === 'de' ? 'Über die leitende Person' : 'Despre coordonator'}</h3>
                      <p className="whitespace-pre-wrap">{workshop.coordinator_bio}</p>
                    </div>
                  )}
                </div>
              </article>

              <article className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-low p-8">
                {workshop.category && <Stat icon="category" label={locale === 'de' ? 'Kategorie' : 'Categorie'} value={workshop.category.name} />}
                <Stat icon="event" label={locale === 'de' ? 'Datum' : 'Data'} value={dateStr} />
                {workshop.duration && <Stat icon="schedule" label={locale === 'de' ? 'Dauer' : 'Durata'} value={workshop.duration} />}
                <Stat icon="location_on" label={locale === 'de' ? 'Ort' : 'Locatie'} value={workshop.location} />
                <Stat icon="group" label={locale === 'de' ? 'Plätze' : 'Locuri'} value={`${workshop.available_slots} ${locale === 'de' ? 'frei' : 'libere'} / ${workshop.max_slots}`} />
                {workshop.cost && <Stat icon="payments" label={locale === 'de' ? 'Kosten' : 'Cost'} value={`${workshop.cost} RON`} />}
                <Stat
                  icon="circle"
                  label="Status"
                  value={workshop.is_open ? (locale === 'de' ? 'Einschreibung offen' : 'Inscrieri deschise') : (locale === 'de' ? 'Ausgebucht' : 'Complet')}
                  tone={workshop.is_open ? 'text-secondary' : 'text-error'}
                />
              </article>
            </div>
          </>
        )}
      </main>
      <Footer />

      <AdminDeleteWorkshopModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isBusy={isDeleting}
      />
    </div>
  )
}

function Info({ icon, children }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="text-secondary">{icon}</Icon>
      <span className="font-label-md">{children}</span>
    </div>
  )
}

function Stat({ icon, label, value, tone = 'text-primary' }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className={`mt-0.5 shrink-0 ${tone}`}>{icon}</Icon>
      <div>
        <p className="text-xs font-label-md uppercase tracking-wider text-on-surface-variant">{label}</p>
        <p className={`font-label-md ${tone}`}>{value}</p>
      </div>
    </div>
  )
}
