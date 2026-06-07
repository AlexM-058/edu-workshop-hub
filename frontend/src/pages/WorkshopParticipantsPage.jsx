import { useCallback, useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Link, useParams } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import Icon from '../components/Icon'
import { useAppAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { createAttendanceQrToken, downloadAttendanceList, markRegistrationAttendance } from '../lib/api'
import { downloadBlob } from '../lib/downloadFile'
import { useTeacherParticipants } from '../lib/teacherWorkshops'
import { getAttendanceQrPanelState, getMillisecondsUntilRefresh } from './attendanceQrPanel'

export default function WorkshopParticipantsPage() {
  const { id } = useParams()
  const { getToken } = useAppAuth()
  const { locale, t } = useI18n()
  const [refreshKey, setRefreshKey] = useState(0)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState(null)
  const { participants, isLoading, error } = useTeacherParticipants({ workshopId: id, refreshKey })

  async function handleAttendance(registration, attended) {
    setActionError(null)
    setBusyId(registration.id)
    try {
      const token = await getToken()
      await markRegistrationAttendance({ token, registrationId: registration.id, attended })
      setRefreshKey((value) => value + 1)
    } catch (error) {
      setActionError(error)
    } finally {
      setBusyId(null)
    }
  }

  async function handleExport(format) {
    setActionError(null)
    setBusyId(`export-${format}`)
    try {
      const token = await getToken()
      const blob = await downloadAttendanceList({ token, workshopId: id, format })
      downloadBlob(blob, `attendance-${id}.${format}`)
    } catch (error) {
      setActionError(error)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardShell mode="teacher">
      <main className="mx-auto max-w-[1200px] p-8">
        <header className="mb-lg flex flex-col justify-between gap-4 border-b border-slate-200 pb-md md:flex-row md:items-end">
          <div>
            <Link className="mb-4 inline-flex items-center gap-1 text-sm font-label-md text-primary hover:underline" to="/demo/dashboard/teacher/workshops">
              <Icon className="h-4 w-4">arrow_back</Icon>
              {locale === 'de' ? 'Zurück zu Workshops' : 'Înapoi la workshopuri'}
            </Link>
            <h1 className="font-h1 text-h1 text-primary">
              {locale === 'de' ? 'Teilnehmende' : 'Participanți'}
            </h1>
            <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
              {locale === 'de'
                ? 'Bestätige Anwesenheit und exportiere die Teilnehmerliste.'
                : 'Confirmă prezența și exportă lista de participanți.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-2 rounded border border-primary px-4 py-2 font-label-md text-primary hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
              disabled={busyId === 'export-csv'}
              onClick={() => handleExport('csv')}
              type="button"
            >
              <Icon>table_view</Icon>
              CSV
            </button>
            <button
              className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 font-label-md text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              disabled={busyId === 'export-pdf'}
              onClick={() => handleExport('pdf')}
              type="button"
            >
              <Icon>picture_as_pdf</Icon>
              PDF
            </button>
          </div>
        </header>

        {error || actionError ? (
          <div className="mb-md rounded-lg border border-error/30 bg-error-container px-6 py-4 text-on-error-container">
            <p className="font-label-md">
              {locale === 'de' ? 'Die Aktion konnte nicht abgeschlossen werden.' : 'Acțiunea nu a putut fi finalizată.'}
            </p>
            <p className="mt-1 text-sm opacity-70">{(error || actionError).message}</p>
          </div>
        ) : null}

        <AttendanceQrPanel getToken={getToken} t={t} workshopId={id} />

        {isLoading ? (
          <LoadingRows />
        ) : participants?.length === 0 ? (
          <section className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white py-20 text-center">
            <Icon className="mb-4 text-5xl text-slate-300">group</Icon>
            <p className="font-h3 text-h3 text-primary">{locale === 'de' ? 'Keine Teilnehmenden' : 'Niciun participant'}</p>
          </section>
        ) : (
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-label-md uppercase text-slate-500">
              <span>{locale === 'de' ? 'Teilnehmer' : 'Participant'}</span>
              <span>{locale === 'de' ? 'Status' : 'Status'}</span>
              <span>{locale === 'de' ? 'Anwesenheit' : 'Prezență'}</span>
            </div>
            {participants.map((participant) => (
              <ParticipantRow
                isBusy={busyId === participant.id}
                key={participant.id}
                locale={locale}
                onAttendance={handleAttendance}
                participant={participant}
              />
            ))}
          </section>
        )}
      </main>
    </DashboardShell>
  )
}

function AttendanceQrPanel({ getToken, t, workshopId }) {
  const [qrPayload, setQrPayload] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [nowMs, setNowMs] = useState(() => Date.now())

  const panelState = getAttendanceQrPanelState({ isLoading, qrPayload, error, nowMs })

  const startQrSession = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = await getToken()
      const payload = await createAttendanceQrToken({ token, workshopId })
      setQrPayload(payload)
    } catch (error) {
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }, [getToken, workshopId])

  useEffect(() => {
    const intervalId = window.setInterval(() => setNowMs(Date.now()), 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (panelState.kind !== 'active' || !qrPayload?.expires_at) return undefined

    const delay = getMillisecondsUntilRefresh({ expiresAt: qrPayload.expires_at, nowMs: Date.now() })
    const timeoutId = window.setTimeout(() => {
      startQrSession()
    }, delay)

    return () => window.clearTimeout(timeoutId)
  }, [panelState.kind, qrPayload?.expires_at, startQrSession])

  const minutes = panelState.secondsRemaining ? Math.floor(panelState.secondsRemaining / 60) : 0
  const seconds = panelState.secondsRemaining ? panelState.secondsRemaining % 60 : 0
  const timeLabel = `${minutes}:${String(seconds).padStart(2, '0')}`

  return (
    <section className="mb-lg grid gap-6 rounded-lg border border-slate-200 bg-white p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-label-md text-secondary">
          <Icon>qr_code</Icon>
          {t('attendance.qr.title')}
        </div>
        <h2 className="font-h2 text-2xl text-primary">{t(panelState.labelKey)}</h2>
        <p className="mt-2 max-w-2xl font-body-md text-on-surface-variant">
          {panelState.kind === 'active'
            ? t('attendance.qr.activeText', { time: timeLabel })
            : panelState.kind === 'expired'
            ? t('attendance.qr.expiredText')
            : panelState.kind === 'error'
            ? `${t('attendance.qr.errorText')} ${error?.message ?? ''}`.trim()
            : t('attendance.qr.idleText')}
        </p>
        <button
          className="mt-5 inline-flex items-center gap-2 rounded bg-primary px-5 py-3 font-label-md text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          disabled={!panelState.canStart}
          onClick={startQrSession}
          type="button"
        >
          <Icon>{panelState.kind === 'loading' ? 'hourglass_top' : 'qr_code_scanner'}</Icon>
          {panelState.kind === 'expired'
            ? t('attendance.qr.restart')
            : panelState.kind === 'loading'
            ? t('attendance.qr.loadingButton')
            : t('attendance.qr.start')}
        </button>
      </div>
      <div className="flex min-h-64 w-full items-center justify-center rounded border border-slate-200 bg-slate-50 p-4 md:w-64">
        {panelState.kind === 'active' && qrPayload?.check_in_url ? (
          <QRCodeSVG
            bgColor="#ffffff"
            fgColor="#1f3b57"
            includeMargin
            level="M"
            size={224}
            value={qrPayload.check_in_url}
          />
        ) : (
          <div className="text-center text-on-surface-variant">
            <Icon className="mb-3 text-5xl text-slate-300">qr_code_2</Icon>
            <p className="font-label-md">QR</p>
          </div>
        )}
      </div>
    </section>
  )
}

function ParticipantRow({ participant, locale, isBusy, onAttendance }) {
  const statusLabel = participant.status === 'waitlist'
    ? (locale === 'de' ? 'Warteliste' : 'Listă așteptare')
    : participant.status === 'cancelled'
    ? (locale === 'de' ? 'Abgebrochen' : 'Anulat')
    : (locale === 'de' ? 'Eingeschrieben' : 'Înscris')

  return (
    <article className="grid grid-cols-1 gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0 md:grid-cols-[1fr_auto_auto] md:items-center">
      <div className="min-w-0">
        <h2 className="font-h3 text-lg text-primary">{participant.user?.name ?? '-'}</h2>
        <p className="text-sm text-on-surface-variant">{participant.user?.email}</p>
      </div>
      <span className="w-fit rounded-full bg-surface-container px-3 py-1 text-xs font-label-md text-slate-600">
        {statusLabel}
      </span>
      <div className="flex flex-wrap gap-2">
        <button
          className="inline-flex items-center gap-2 rounded bg-secondary px-4 py-2 text-sm font-label-md text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-50"
          disabled={isBusy || participant.status !== 'enrolled' || participant.attended}
          onClick={() => onAttendance(participant, true)}
          type="button"
        >
          <Icon>check_circle</Icon>
          {locale === 'de' ? 'Anwesend' : 'Prezent'}
        </button>
        <button
          className="inline-flex items-center gap-2 rounded border border-slate-300 px-4 py-2 text-sm font-label-md text-primary hover:bg-slate-50 disabled:cursor-wait disabled:opacity-50"
          disabled={isBusy || participant.status !== 'enrolled' || !participant.attended}
          onClick={() => onAttendance(participant, false)}
          type="button"
        >
          <Icon>cancel</Icon>
          {locale === 'de' ? 'Fehlt' : 'Absent'}
        </button>
      </div>
    </article>
  )
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="grid animate-pulse grid-cols-[1fr_auto_auto] gap-4 rounded-lg border border-slate-200 bg-white p-md">
          <div className="space-y-2">
            <div className="h-4 w-48 rounded bg-slate-100" />
            <div className="h-3 w-64 rounded bg-slate-100" />
          </div>
          <div className="h-7 w-24 rounded-full bg-slate-100" />
          <div className="h-9 w-44 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  )
}
