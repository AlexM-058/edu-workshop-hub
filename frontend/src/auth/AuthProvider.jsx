import { useAuth, useUser } from '@clerk/clerk-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Icon from '../components/Icon'
import { useI18n } from '../i18n/I18nContext'
import { fetchCurrentUser, markTeacherInviteNoticeSeen } from '../lib/api'
import { AuthContext } from './AuthContext'
import { shouldShowTeacherInviteNotice } from './teacherInviteNotice'

export function StaticAuthProvider({ children }) {
  const value = useMemo(() => ({
    appUser: null,
    clerkConfigured: false,
    getToken: async () => null,
    isLoaded: true,
    isSignedIn: false,
    isSyncing: false,
    role: null,
    signOut: async () => {},
    syncError: null,
  }), [])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function ClerkBackedAuthProvider({ children }) {
  const { getToken, isLoaded, isSignedIn, signOut } = useAuth()
  const { user } = useUser()
  const { t } = useI18n()
  const [appUser, setAppUser] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const [showTeacherInviteNotice, setShowTeacherInviteNotice] = useState(false)

  const syncUser = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setAppUser(null)
      setIsSyncing(false)
      setSyncError(null)
      setShowTeacherInviteNotice(false)
      return
    }

    try {
      setIsSyncing(true)
      const token = await getToken()
      const payload = await fetchCurrentUser(token)

      setAppUser(payload.user)
      if (shouldShowTeacherInviteNotice(payload)) {
        setShowTeacherInviteNotice(true)
      }
      setIsSyncing(false)
      setSyncError(null)
    } catch (error) {
      setAppUser(null)
      setIsSyncing(false)
      setSyncError(error)
    }
  }, [getToken, isLoaded, isSignedIn])

  // Sync on auth state change
  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!isLoaded || !isSignedIn) {
        setAppUser(null)
        setIsSyncing(false)
        setSyncError(null)
        setShowTeacherInviteNotice(false)
        return
      }

      try {
        setIsSyncing(true)
        const token = await getToken()
        const payload = await fetchCurrentUser(token)

        if (!cancelled) {
          setAppUser(payload.user)
          if (shouldShowTeacherInviteNotice(payload)) {
            setShowTeacherInviteNotice(true)
          }
          setIsSyncing(false)
          setSyncError(null)
        }
      } catch (error) {
        if (!cancelled) {
          setAppUser(null)
          setIsSyncing(false)
          setSyncError(error)
        }
      }
    }

    run()

    return () => { cancelled = true }
  }, [getToken, isLoaded, isSignedIn])

  // Re-sync when tab regains focus — catches role changes made by admin
  // while the user was already logged in (e.g. teacher invitation granted)
  useEffect(() => {
    if (!isSignedIn) return

    function handleFocus() {
      syncUser()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [isSignedIn, syncUser])

  const dismissTeacherInviteNotice = useCallback(async () => {
    try {
      const token = await getToken()
      await markTeacherInviteNoticeSeen(token)
    } finally {
      setShowTeacherInviteNotice(false)
    }
  }, [getToken])

  const value = useMemo(() => ({
    appUser,
    clerkConfigured: true,
    clerkUser: user,
    getToken,
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    isSyncing,
    refreshUser: syncUser,
    role: appUser?.role ?? null,
    signOut,
    syncError,
  }), [appUser, getToken, isLoaded, isSignedIn, isSyncing, signOut, syncError, syncUser, user])

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showTeacherInviteNotice ? (
        <TeacherInviteNotice onDismiss={dismissTeacherInviteNotice} t={t} />
      ) : null}
    </AuthContext.Provider>
  )
}

function TeacherInviteNotice({ onDismiss, t }) {
  return (
    <section
      aria-labelledby="teacher-invite-notice-title"
      className="fixed bottom-6 right-6 z-[80] w-[min(92vw,420px)] rounded-lg border border-primary/20 bg-white p-5 text-on-surface shadow-xl"
      role="status"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary">
          <Icon>school</Icon>
        </span>
        <div className="min-w-0 flex-1">
          <p id="teacher-invite-notice-title" className="font-label-md text-sm uppercase text-primary">
            {t('auth.teacherInviteNoticeTitle')}
          </p>
          <p className="mt-2 font-h3 text-xl text-on-surface">
            {t('auth.teacherInviteNoticeHeading')}
          </p>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            {t('auth.teacherInviteNoticeText')}
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-5 text-on-surface-variant">
            <li className="flex gap-2">
              <Icon className="mt-0.5 text-base text-primary">check_circle</Icon>
              <span>{t('auth.teacherInviteNoticePrivilegeCreate')}</span>
            </li>
            <li className="flex gap-2">
              <Icon className="mt-0.5 text-base text-primary">check_circle</Icon>
              <span>{t('auth.teacherInviteNoticePrivilegeManage')}</span>
            </li>
            <li className="flex gap-2">
              <Icon className="mt-0.5 text-base text-primary">check_circle</Icon>
              <span>{t('auth.teacherInviteNoticePrivilegeDashboard')}</span>
            </li>
          </ul>
        </div>
        <button
          aria-label={t('auth.teacherInviteNoticeDismiss')}
          className="rounded p-2 text-on-surface-variant transition hover:bg-slate-100 hover:text-on-surface"
          onClick={onDismiss}
          type="button"
        >
          <Icon>close</Icon>
        </button>
      </div>
    </section>
  )
}
