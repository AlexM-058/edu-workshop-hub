import { useState } from 'react'
import AdminShell from '../components/AdminShell'
import Icon from '../components/Icon'
import { useAppAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { createTeacherInvitation } from '../lib/api'
import {
  getTeacherInvitationFormControlState,
  getTeacherInvitationSuccessMessage,
  submitTeacherInvitationForm,
} from './adminTeacherInvitationForm'

const users = [
  ['ED', 'Elena Dumitrescu', 'elena.d@educraft.ro', 'admin.roleAttender', 'admin.active', '14 Oct 2023', true],
  ['AM', 'Andrei Marinescu', 'a.marinescu@educraft.ro', 'admin.roleTeacher', 'admin.active', '22 Nov 2023', true],
  ['IC', 'Ioana Constantinescu', 'ioana.c@educraft.ro', 'admin.roleAttender', 'admin.inactive', '05 Ian 2024', false],
  ['VP', 'Vlad Popescu', 'vlad.popescu@educraft.ro', 'admin.roleTeacher', 'admin.active', '12 Feb 2024', true],
]

export default function AdminUsersPage() {
  const { t } = useI18n()
  const { getToken } = useAppAuth()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [invitedEmail, setInvitedEmail] = useState('')
  const [inviteStatus, setInviteStatus] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const inviteControls = getTeacherInvitationFormControlState(isInviting)

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
    setIsInviting(false)
  }

  return (
    <AdminShell searchKey="admin.searchUsers">
      <div className="mx-auto max-w-[1200px] space-y-lg p-8">
        <header className="flex items-end justify-between border-b border-outline-variant pb-md">
          <div>
            <h1 className="font-h1 text-h1 text-primary">{t('admin.users.title')}</h1>
            <p className="mt-xs font-body-lg text-on-surface-variant">{t('admin.users.subtitle')}</p>
          </div>
          <button className="flex cursor-not-allowed items-center gap-2 rounded border border-primary px-md py-2 font-label-md text-primary opacity-60" disabled title={t('common.demoUnavailable')} type="button">
            <Icon>file_download</Icon>{t('admin.exportCsv')}
          </button>
        </header>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
          <div className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-low p-md md:col-span-8">
            <div>
              <span className="font-caption uppercase tracking-wider text-on-surface-variant">{t('admin.users.totalUsers')}</span>
              <h2 className="font-h2 text-h2 text-primary">1,284</h2>
              <p className="mt-2 flex items-center gap-1 font-label-md text-secondary"><Icon className="text-[18px]">trending_up</Icon>{t('admin.users.monthGrowth')}</p>
            </div>
            <div className="hidden gap-4 sm:flex">
              <SmallCount value="452" label={t('admin.roleAttenderPlural')} />
              <SmallCount value="832" label={t('admin.roleTeacherPlural')} last />
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
        <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_4px_12px_rgba(26,54,93,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-md bg-surface-container-low/50 p-md">
            <div className="flex min-w-[300px] flex-1 gap-md">
              <FilterSelect icon="filter_list" options={['admin.users.allRoles', 'admin.roleAttender', 'admin.roleTeacher', 'admin.roleAdmin']} />
              <FilterSelect icon="bolt" options={['admin.users.allStatuses', 'admin.active', 'admin.inactive', 'admin.suspended']} />
            </div>
            <p className="font-caption text-on-surface-variant">{t('admin.users.showing')}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container">
                  {['admin.users.name', 'admin.users.role', 'common.status', 'admin.users.registeredAt', 'common.actions'].map((key, index) => (
                    <th key={key} className={`px-md py-4 font-label-md text-primary ${index === 4 ? 'text-right' : ''}`}>{t(key)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {users.map(([initials, name, email, roleKey, statusKey, date, active]) => (
                  <tr key={email} className="transition-colors hover:bg-surface-container-low">
                    <td className="px-md py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed font-bold text-primary">{initials}</div>
                        <div>
                          <div className="font-label-md text-primary">{name}</div>
                          <div className="text-caption text-on-surface-variant">{email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-md py-4"><span className="inline-flex rounded bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">{t(roleKey)}</span></td>
                    <td className="px-md py-4"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${active ? 'bg-secondary' : 'bg-outline'}`} /><span className="text-body-md">{t(statusKey)}</span></div></td>
                    <td className="px-md py-4 font-body-md text-on-surface-variant">{date}</td>
                    <td className="px-md py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="rounded p-2 text-primary transition-colors hover:bg-primary-fixed" aria-label={t('common.edit')} type="button"><Icon>edit</Icon></button>
                        <button className={`rounded p-2 transition-colors ${active ? 'text-error hover:bg-error-container' : 'bg-secondary-container/30 text-on-secondary-container hover:bg-secondary-container'}`} aria-label={active ? t('admin.deactivate') : t('admin.activate')} type="button"><Icon>{active ? 'block' : 'check_circle'}</Icon></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  )
}

function SmallCount({ value, label, last = false }) {
  return <div className={`px-4 text-center ${last ? '' : 'border-r border-outline-variant'}`}><span className="block font-h3 text-h3 text-primary">{value}</span><span className="text-caption text-on-surface-variant">{label}</span></div>
}

function FilterSelect({ icon, options }) {
  const { t } = useI18n()
  return (
    <div className="relative flex-1">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">{icon}</Icon>
      <select className="w-full rounded border border-outline bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-primary">
        {options.map((key) => <option key={key}>{t(key)}</option>)}
      </select>
    </div>
  )
}
