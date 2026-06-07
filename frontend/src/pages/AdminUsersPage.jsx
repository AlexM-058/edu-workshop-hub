import { useState } from 'react'
import AdminShell from '../components/AdminShell'
import Icon from '../components/Icon'
import { useAppAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { createTeacherInvitation, updateUserRoleByAdmin, deleteUserByAdmin } from '../lib/api'
import { useAdminStats, useAdminUsers } from '../lib/admin'
import {
  getTeacherInvitationFormControlState,
  getTeacherInvitationSuccessMessage,
  submitTeacherInvitationForm,
} from './adminTeacherInvitationForm'

const ROLE_FILTER_OPTIONS = [
  { value: '',          labelKey: 'admin.users.allRoles' },
  { value: 'attender', labelKey: 'admin.roleAttender' },
  { value: 'teacher',  labelKey: 'admin.roleTeacher' },
  { value: 'admin',     labelKey: 'admin.roleAdmin' },
]

const ROLE_BADGES = {
  attender: 'bg-primary-fixed text-primary',
  professor: 'bg-primary-fixed text-primary',
  teacher:  'bg-secondary-container text-on-secondary-container',
  referent:  'bg-secondary-container text-on-secondary-container',
  admin:     'bg-error-container text-error',
}

export default function AdminUsersPage() {
  const { t, locale } = useI18n()
  const { getToken, appUser } = useAppAuth()
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [invitedEmail, setInvitedEmail] = useState('')
  const [inviteStatus, setInviteStatus] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingRoleUserId, setEditingRoleUserId] = useState(null)
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)
  const inviteControls = getTeacherInvitationFormControlState(isInviting)

  const { users, meta, isLoading, error } = useAdminUsers({ page, perPage: 20, role: roleFilter || undefined, refreshKey })
  const { stats, isLoading: statsLoading } = useAdminStats({ refreshKey })

  const pageCount = meta?.last_page ?? 1

  async function handleInviteTeacher(event) {
    event.preventDefault()
    setInviteError('')
    setInvitedEmail('')
    setInviteStatus('')

    setIsInviting(true)
    const result = await submitTeacherInvitationForm({
      email: inviteEmail,
      getToken,
      createInvitation: createTeacherInvitation,
      t,
    })

    if (result.inviteEmail !== undefined) {
      setInviteEmail(result.inviteEmail)
    }

    setInviteError(result.inviteError)
    setInvitedEmail(result.invitedEmail)
    setInviteStatus(result.inviteStatus)
    if (result.didInvite) {
      setRefreshKey((key) => key + 1)
    }
    setIsInviting(false)
  }

  function initials(name) {
    return name?.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() ?? '??'
  }

  function roleName(role) {
    if (role === 'attender' || role === 'professor') return locale === 'de' ? 'Teilnehmer' : 'Participant'
    if (role === 'teacher' || role === 'referent') return locale === 'de' ? 'Referent' : 'Referent'
    return 'Admin'
  }

  async function handleRoleChange(user, newRole) {
    setEditingRoleUserId(null)
    if (user.role === newRole) return
    
    setIsUpdatingRole(true)
    try {
      const token = await getToken()
      await updateUserRoleByAdmin({ token, userId: user.id, role: newRole })
      setRefreshKey((k) => k + 1)
    } catch (e) {
      console.error('Failed to update role', e)
      // Optionally show a toast error here
    } finally {
      setIsUpdatingRole(false)
    }
  }

  async function handleDeleteUser(user) {
    if (user.id === appUser?.id) return
    
    const confirmMessage = locale === 'de' 
      ? `Möchten Sie den Benutzer ${user.name} und alle seine Einschreibungen wirklich löschen?` 
      : `Ești sigur că vrei să ștergi utilizatorul ${user.name} și toate înscrierile lui?`
      
    if (!window.confirm(confirmMessage)) return
    
    setIsUpdatingRole(true) // Reuse this flag to disable UI during deletion
    try {
      const token = await getToken()
      await deleteUserByAdmin({ token, userId: user.id })
      setRefreshKey((k) => k + 1)
    } catch (e) {
      console.error('Failed to delete user', e)
      alert(locale === 'de' ? 'Löschen fehlgeschlagen.' : 'Ștergerea a eșuat.')
    } finally {
      setIsUpdatingRole(false)
    }
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(locale === 'de' ? 'de-DE' : 'ro-RO', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  return (
    <AdminShell searchKey="admin.searchUsers">
      <div className="mx-auto max-w-[1200px] space-y-lg p-8">

        <header className="flex items-end justify-between border-b border-outline-variant pb-md">
          <div>
            <h1 className="font-h1 text-h1 text-primary">{t('admin.users.title')}</h1>
            <p className="mt-xs font-body-lg text-on-surface-variant">{t('admin.users.subtitle')}</p>
          </div>
          <button
            className="flex cursor-not-allowed items-center gap-2 rounded border border-primary px-md py-2 font-label-md text-primary opacity-60"
            disabled
            title={t('common.demoUnavailable')}
            type="button"
          >
            <Icon>file_download</Icon>{t('admin.exportCsv')}
          </button>
        </header>

        {/* Stats bar */}
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
          <div className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-low p-md md:col-span-8">
            <div>
              <span className="font-caption uppercase tracking-wider text-on-surface-variant">
                {t('admin.users.totalUsers')}
              </span>
              <h2 className={`font-h2 text-h2 text-primary ${statsLoading ? 'animate-pulse' : ''}`}>
                {statsLoading ? '—' : (stats?.total_users ?? 0)}
              </h2>
            </div>
            <div className="hidden gap-4 sm:flex">
              <SmallCount
                value={statsLoading ? '—' : (stats?.total_professors ?? 0)}
                label={t('admin.roleAttenderPlural')}
              />
              <SmallCount
                value={statsLoading ? '—' : (stats?.total_referents ?? 0)}
                label={t('admin.roleTeacherPlural')}
                last
              />
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-xl bg-primary p-md text-white md:col-span-4">
            <div>
              <span className="font-label-md uppercase opacity-80">{t('admin.users.inviteTeacher')}</span>
              <p className="mt-2 text-sm leading-6 text-white/80">{t('admin.users.inviteTeacherText')}</p>
            </div>
            <form className="mt-md space-y-sm" onSubmit={handleInviteTeacher}>
              <label className="block text-sm font-label-md" htmlFor="teacher-invite-email">{t('admin.users.inviteEmail')}</label>
              <input
                className="w-full rounded border border-white/30 bg-white px-3 py-2 text-sm text-primary outline-none transition focus:border-white focus:ring-2 focus:ring-white/50 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={inviteControls.inputDisabled}
                id="teacher-invite-email"
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder={t('admin.users.inviteEmailPlaceholder')}
                required
                type="email"
                value={inviteEmail}
              />
              {inviteError ? <p className="rounded border border-error-container bg-error-container px-3 py-2 text-sm text-on-error-container">{inviteError}</p> : null}
              {invitedEmail ? <p className="rounded border border-secondary-container bg-secondary-container px-3 py-2 text-sm text-on-secondary-container">{getTeacherInvitationSuccessMessage(inviteStatus, invitedEmail, t)}</p> : null}
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded bg-white px-4 py-2 text-label-md font-label-md text-primary transition hover:bg-primary-fixed disabled:cursor-not-allowed disabled:opacity-70"
                disabled={inviteControls.submitDisabled}
                type="submit"
              >
                <Icon>{inviteControls.buttonIcon}</Icon>
                {t(inviteControls.buttonLabelKey)}
              </button>
            </form>
          </div>
        </div>

        {/* Table */}
        <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_4px_12px_rgba(26,54,93,0.05)]">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-md bg-surface-container-low/50 p-md">
            <div className="flex min-w-[200px] flex-1 gap-md">
              <div className="relative flex-1">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">filter_list</Icon>
                <select
                  className="w-full rounded border border-outline bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-primary"
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
                >
                  {ROLE_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="font-caption text-on-surface-variant">
              {isLoading
                ? (locale === 'de' ? 'Lädt...' : 'Se încarcă...')
                : meta
                ? `${meta.total} ${locale === 'de' ? 'Benutzer' : 'utilizatori'}`
                : ''}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="px-md py-4 text-on-error-container bg-error-container">
              <p className="font-label-md">{locale === 'de' ? 'Fehler beim Laden der Benutzer.' : 'Eroare la încărcarea utilizatorilor.'}</p>
            </div>
          )}

          {/* Skeleton */}
          {isLoading && (
            <div className="divide-y divide-outline-variant">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-4 px-md py-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                    <div className="h-2 w-1/2 rounded bg-slate-100" />
                  </div>
                  <div className="h-5 w-16 rounded bg-slate-100" />
                  <div className="h-5 w-20 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && users?.length === 0 && (
            <div className="py-16 text-center text-on-surface-variant">
              <Icon className="mb-2 text-4xl text-slate-300">person_off</Icon>
              <p>{locale === 'de' ? 'Keine Benutzer gefunden.' : 'Niciun utilizator găsit.'}</p>
            </div>
          )}

          {/* Table data */}
          {!isLoading && users && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container">
                    {['admin.users.name', 'admin.users.role', 'admin.users.registeredAt', 'common.actions'].map((key, i) => (
                      <th key={key} className={`px-md py-4 font-label-md text-primary ${i === 3 ? 'text-right' : ''}`}>
                        {t(key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {users.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-surface-container-low">
                      <td className="px-md py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed font-bold text-primary">
                            {initials(user.name)}
                          </div>
                          <div>
                            <div className="font-label-md text-primary">{user.name}</div>
                            <div className="text-caption text-on-surface-variant">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-md py-4">
                        {editingRoleUserId === user.id ? (
                          <select
                            className="rounded border border-primary bg-white py-1 px-2 text-[11px] font-bold uppercase tracking-wider text-primary outline-none focus:ring-2 focus:ring-primary/20"
                            defaultValue={['teacher', 'professor'].includes(user.role) ? (user.role === 'teacher' ? 'referent' : 'attender') : user.role}
                            onChange={(e) => handleRoleChange(user, e.target.value)}
                            onBlur={() => setEditingRoleUserId(null)}
                            autoFocus
                            disabled={isUpdatingRole}
                          >
                            <option value="admin">Admin</option>
                            <option value="referent">{locale === 'de' ? 'Referent' : 'Referent'}</option>
                            <option value="attender">{locale === 'de' ? 'Teilnehmer' : 'Participant'}</option>
                          </select>
                        ) : (
                          <span className={`inline-flex rounded px-2 py-1 text-[11px] font-bold uppercase tracking-wider ${ROLE_BADGES[user.role] ?? 'bg-slate-100 text-primary'}`}>
                            {roleName(user.role)}
                          </span>
                        )}
                      </td>
                      <td className="px-md py-4 font-body-md text-on-surface-variant">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-md py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {editingRoleUserId === user.id ? (
                            <button
                              className="rounded p-2 text-primary hover:bg-surface-container"
                              onClick={() => setEditingRoleUserId(null)}
                              title={locale === 'de' ? 'Abbrechen' : 'Anulează'}
                              type="button"
                            >
                              <Icon>close</Icon>
                            </button>
                          ) : (
                            <button
                              className="rounded p-2 text-primary hover:bg-surface-container disabled:opacity-50"
                              onClick={() => setEditingRoleUserId(user.id)}
                              title={locale === 'de' ? 'Rolle bearbeiten' : 'Editează rolul'}
                              type="button"
                              disabled={isUpdatingRole}
                            >
                              <Icon>edit</Icon>
                            </button>
                          )}
                          <button
                            className="rounded p-2 text-error hover:bg-error-container hover:text-on-error-container disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={() => handleDeleteUser(user)}
                            title={locale === 'de' ? 'Benutzer löschen' : 'Șterge utilizatorul'}
                            type="button"
                            disabled={isUpdatingRole || user.id === appUser?.id}
                          >
                            <Icon>delete</Icon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && pageCount > 1 && (
            <div className="flex items-center justify-center gap-3 border-t border-outline-variant p-4">
              <button
                className="border border-outline-variant p-2 text-primary hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                type="button"
              >
                <Icon>chevron_left</Icon>
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`h-9 w-9 border font-label-md ${
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
                className="border border-outline-variant p-2 text-primary hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={page === pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                type="button"
              >
                <Icon>chevron_right</Icon>
              </button>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  )
}

function SmallCount({ value, label, last = false }) {
  return (
    <div className={`px-4 text-center ${last ? '' : 'border-r border-outline-variant'}`}>
      <span className="block font-h3 text-h3 text-primary">{value}</span>
      <span className="text-caption text-on-surface-variant">{label}</span>
    </div>
  )
}
