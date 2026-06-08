import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminShell from '../components/AdminShell'
import DashboardShell from '../components/DashboardShell'
import Icon from '../components/Icon'
import { useAppAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { useAttenderRegistrations, useAttenderStats } from '../lib/attenderRegistrations'
import { downloadCertificate } from '../lib/api'
import { downloadBlob } from '../lib/downloadFile'

export default function CertificatesPage() {
  const { appUser } = useAppAuth()
  const { locale, t } = useI18n()
  const role = appUser?.role
  const isAdmin = role === 'admin'
  const isTeacher = role === 'teacher' || role === 'referent' || role === 'admin'
  const content = isTeacher ? <TeacherCertificates locale={locale} t={t} /> : <AttenderCertificates locale={locale} t={t} />

  if (isAdmin) return <AdminShell searchKey="nav.certificates">{content}</AdminShell>

  return (
    <DashboardShell mode={isTeacher ? 'teacher' : 'attender'}>
      {content}
    </DashboardShell>
  )
}

function AttenderCertificates({ locale, t }) {
  const { getToken } = useAppAuth()
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState(null)
  const { registrations, isLoading, error } = useAttenderRegistrations({ perPage: 30 })
  const { stats, isLoading: statsLoading } = useAttenderStats()
  const certificates = registrations?.filter((reg) => reg.can_download_certificate || reg.attended) ?? []

  async function handleDownload(registration) {
    setActionError(null)
    setBusyId(registration.id)
    try {
      const token = await getToken()
      const blob = await downloadCertificate({ token, workshopId: registration.workshop.id })
      downloadBlob(blob, `certificate-${registration.id}.pdf`)
    } catch (error) {
      setActionError(error)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="mx-auto max-w-[1200px] p-8">
      <header className="mb-lg flex flex-col justify-between gap-4 border-b border-slate-200 pb-md md:flex-row md:items-end">
        <div>
          <h1 className="font-h1 text-h1 text-primary">
            {locale === 'de' ? 'Zertifikate' : 'Certificate'}
          </h1>
          <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
            {locale === 'de'
              ? 'Hier findest du Teilnahmezertifikate, sobald die Anwesenheit durch den Teacher bestätigt wurde.'
              : 'Aici găsești certificatele de participare după ce prezența este confirmată de teacher.'}
          </p>
        </div>
        <Metric
          icon="workspace_premium"
          label={t('dashboard.certificatesTotal')}
          value={statsLoading ? '-' : String(stats?.total_certificates ?? 0)}
        />
      </header>

      {error ? <ErrorBox locale={locale} /> : null}
      {actionError ? <ErrorBox locale={locale} message={actionError.message} /> : null}

      {isLoading ? (
        <LoadingRows />
      ) : certificates.length === 0 ? (
        <EmptyCertificates locale={locale} />
      ) : (
        <section className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {certificates.map((reg) => (
            <CertificateRow
              isBusy={busyId === reg.id}
              key={reg.id}
              locale={locale}
              onDownload={handleDownload}
              registration={reg}
            />
          ))}
        </section>
      )}
    </main>
  )
}

function TeacherCertificates({ locale, t }) {
  return (
    <main className="mx-auto max-w-[1200px] p-8">
      <header className="mb-lg border-b border-slate-200 pb-md">
        <h1 className="font-h1 text-h1 text-primary">{locale === 'de' ? 'Nachweise und Exporte' : 'Certificate și exporturi'}</h1>
        <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
          {locale === 'de'
            ? 'Teacher verwalten Zertifikate indirekt über Anwesenheit und Teilnehmerlisten pro Workshop.'
            : 'Teacherii gestionează certificatele indirect prin prezență și listele de participanți pentru fiecare workshop.'}
        </p>
      </header>

      <section className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        <ActionPanel
          icon="how_to_reg"
          title={locale === 'de' ? 'Anwesenheit bestätigen' : 'Confirmă prezența'}
          text={locale === 'de' ? 'Markiere Teilnehmende nach Abschluss des Workshops.' : 'Marchează participanții după finalizarea workshop-ului.'}
          to="/demo/dashboard/teacher/workshops"
        />
        <ActionPanel
          icon="file_download"
          title={locale === 'de' ? 'Teilnehmerlisten exportieren' : 'Exportă listele de prezență'}
          text={locale === 'de' ? 'PDF- und Excel-Exporte werden an Workshop-Verwaltung gekoppelt.' : 'Exporturile PDF și Excel sunt legate de administrarea workshop-ului.'}
          to="/demo/dashboard/teacher/workshops"
        />
        <ActionPanel
          icon="workspace_premium"
          title={t('nav.certificates')}
          text={locale === 'de' ? 'Zertifikate werden für Attender freigeschaltet, nachdem Anwesenheit bestätigt wurde.' : 'Certificatele devin disponibile pentru participanți după confirmarea prezenței.'}
          to="/demo/dashboard/teacher/workshops"
        />
      </section>
    </main>
  )
}

function CertificateRow({ registration, locale, isBusy, onDownload }) {
  const title = registration.workshop?.title?.[locale] ?? registration.workshop?.title?.ro ?? '-'
  const date = registration.workshop?.scheduled_at
    ? new Date(registration.workshop.scheduled_at).toLocaleDateString(locale === 'de' ? 'de-DE' : 'ro-RO', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '-'

  return (
    <article className="flex flex-col gap-4 p-md md:flex-row md:items-center">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
        <Icon>workspace_premium</Icon>
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="font-h3 text-xl text-primary">{title}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">{date}</p>
      </div>
      {registration.can_download_certificate ? (
        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2 font-label-md text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
          disabled={isBusy}
          onClick={() => onDownload(registration)}
          type="button"
        >
          <Icon>file_download</Icon>
          {locale === 'de' ? 'PDF herunterladen' : 'Descarcă PDF'}
        </button>
      ) : (
        <span className="inline-flex items-center justify-center gap-2 rounded-lg border border-secondary/30 px-5 py-2 text-sm text-secondary">
          <Icon>check_circle</Icon>
          {locale === 'de' ? 'Anwesenheit bestätigt' : 'Prezență confirmată'}
        </span>
      )}
    </article>
  )
}

function ActionPanel({ icon, title, text, to }) {
  return (
    <Link className="rounded-lg border border-slate-200 bg-white p-lg transition hover:border-primary hover:shadow-sm" to={to}>
      <span className="mb-md flex h-12 w-12 items-center justify-center rounded-lg bg-primary-fixed text-primary">
        <Icon>{icon}</Icon>
      </span>
      <h2 className="font-h3 text-h3 text-primary">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-on-surface-variant">{text}</p>
    </Link>
  )
}

function EmptyCertificates({ locale }) {
  return (
    <section className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white py-20 text-center">
      <Icon className="mb-4 text-5xl text-slate-300">workspace_premium</Icon>
      <p className="font-h3 text-h3 text-primary">{locale === 'de' ? 'Noch keine Zertifikate' : 'Nu există certificate încă'}</p>
      <p className="mt-2 max-w-md text-on-surface-variant">
        {locale === 'de'
          ? 'Zertifikate erscheinen hier nach bestätigter Anwesenheit.'
          : 'Certificatele apar aici după confirmarea prezenței de către teacher.'}
      </p>
      <Link className="mt-6 rounded-lg bg-primary px-6 py-3 font-label-md text-white" to="/catalog">
        {locale === 'de' ? 'Workshops entdecken' : 'Explorează catalogul'}
      </Link>
    </section>
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

function ErrorBox({ locale, message }) {
  return (
    <div className="mb-md rounded-lg border border-error/30 bg-error-container px-6 py-4 text-on-error-container">
      {locale === 'de' ? 'Zertifikate konnten nicht geladen werden.' : 'Certificatele nu au putut fi încărcate.'}
      {message ? <p className="mt-1 text-sm opacity-70">{message}</p> : null}
    </div>
  )
}

function Metric({ icon, label, value }) {
  return (
    <div className="flex min-w-56 items-center gap-4 rounded-lg border border-slate-200 bg-white p-md">
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-fixed text-primary">
        <Icon>{icon}</Icon>
      </span>
      <div>
        <p className="text-xs font-label-md uppercase text-slate-500">{label}</p>
        <p className="font-h2 text-h3 text-primary">{value}</p>
      </div>
    </div>
  )
}
