import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import { useAppAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { checkInAttendance } from '../lib/api'
import { submitAttendanceCheckIn } from './attendanceCheckIn'

export default function AttendanceCheckInPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const { getToken } = useAppAuth()
  const { t } = useI18n()
  const [state, setState] = useState({
    kind: 'loading',
    message: t('attendance.checkIn.loading'),
  })

  useEffect(() => {
    let cancelled = false

    submitAttendanceCheckIn({
      token,
      getToken,
      checkIn: checkInAttendance,
      t,
    }).then((result) => {
      if (!cancelled) setState(result)
    })

    return () => {
      cancelled = true
    }
  }, [getToken, t, token])

  const isSuccess = state.kind === 'success'
  const icon = state.kind === 'loading' ? 'hourglass_top' : isSuccess ? 'check_circle' : 'error'

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-on-background">
      <section className="w-full max-w-[560px] rounded-lg border border-outline-variant bg-white p-8 shadow-sm">
        <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-full ${
          isSuccess ? 'bg-secondary/10 text-secondary' : state.kind === 'loading' ? 'bg-surface-container text-primary' : 'bg-error-container text-on-error-container'
        }`}>
          <Icon className="text-3xl">{icon}</Icon>
        </div>
        <p className="mb-3 text-xs font-label-md uppercase text-slate-500">EduCraft</p>
        <h1 className="mb-3 font-h2 text-3xl text-primary">{t('attendance.checkIn.title')}</h1>
        <p className="font-body-md leading-7 text-on-surface-variant">{state.message}</p>
        <Link
          className="mt-8 inline-flex items-center gap-2 rounded bg-primary px-5 py-3 font-label-md text-white hover:opacity-90"
          to="/demo/dashboard/attender"
        >
          <Icon>arrow_back</Icon>
          {t('attendance.checkIn.backToDashboard')}
        </Link>
      </section>
    </main>
  )
}
