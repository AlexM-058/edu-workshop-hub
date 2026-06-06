import AdminShell from '../components/AdminShell'
import DashboardShell from '../components/DashboardShell'
import Icon from '../components/Icon'
import LanguageToggle from '../components/LanguageToggle'
import { useAppAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'

export default function ProfilePage() {
  const { appUser, clerkUser, role } = useAppAuth()
  const { locale, t } = useI18n()
  const isAdmin = role === 'admin'
  const isTeacher = role === 'teacher' || role === 'referent'

  const content = (
    <main className="mx-auto max-w-[1000px] p-8">
      <header className="mb-lg border-b border-slate-200 pb-md">
        <h1 className="font-h1 text-h1 text-primary">{t('nav.profile')}</h1>
        <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
          {locale === 'de'
            ? 'Kontodaten, Rolle und lokale Einstellungen für die EduCraft-Oberfläche.'
            : 'Date de cont, rol și preferințe locale pentru interfața EduCraft.'}
        </p>
      </header>

      <section className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-lg lg:col-span-2">
          <div className="flex items-start gap-md">
            <Avatar name={appUser?.name ?? clerkUser?.fullName ?? 'EduCraft'} />
            <div className="min-w-0">
              <h2 className="font-h2 text-h2 text-primary">{appUser?.name ?? clerkUser?.fullName ?? '-'}</h2>
              <p className="text-on-surface-variant">{appUser?.email ?? clerkUser?.primaryEmailAddress?.emailAddress ?? '-'}</p>
              <span className="mt-3 inline-flex rounded-full bg-primary-fixed px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                {role ?? 'sync'}
              </span>
            </div>
          </div>

          <dl className="mt-lg grid grid-cols-1 gap-md md:grid-cols-2">
            <ProfileField label={locale === 'de' ? 'Vorname' : 'Prenume'} value={appUser?.first_name ?? '-'} />
            <ProfileField label={locale === 'de' ? 'Nachname' : 'Nume'} value={appUser?.last_name ?? '-'} />
            <ProfileField label="Email" value={appUser?.email ?? '-'} />
            <ProfileField label={locale === 'de' ? 'Zugriffsrolle' : 'Rol acces'} value={role ?? '-'} />
          </dl>
        </div>

        <aside className="space-y-gutter">
          <section className="rounded-lg border border-slate-200 bg-white p-md">
            <h2 className="font-h3 text-h3 text-primary">{locale === 'de' ? 'Sprache' : 'Limbă'}</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              {locale === 'de'
                ? 'Die Auswahl wird lokal im Browser gespeichert.'
                : 'Selecția este salvată local în browser.'}
            </p>
            <div className="mt-md">
              <LanguageToggle />
            </div>
          </section>

          <section className="rounded-lg bg-primary p-md text-white">
            <h2 className="font-h3 text-h3">{locale === 'de' ? 'Aktiver Bereich' : 'Spațiu activ'}</h2>
            <p className="mt-2 text-sm leading-6 text-white/75">
              {isAdmin
                ? (locale === 'de' ? 'Admin-Portal' : 'Portal admin')
                : isTeacher
                ? (locale === 'de' ? 'Teacher-Dashboard' : 'Dashboard teacher')
                : (locale === 'de' ? 'Attender-Dashboard' : 'Dashboard participant')}
            </p>
          </section>
        </aside>
      </section>
    </main>
  )

  if (isAdmin) return <AdminShell searchKey="nav.profile">{content}</AdminShell>
  return <DashboardShell mode={isTeacher ? 'teacher' : 'attender'}>{content}</DashboardShell>
}

function Avatar({ name }) {
  const initials = name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-fixed font-h3 text-2xl text-primary">
      {initials || 'EC'}
    </div>
  )
}

function ProfileField({ label, value }) {
  return (
    <div className="rounded-lg bg-surface-container-low p-md">
      <dt className="text-xs font-label-md uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="mt-2 flex items-center gap-2 font-body-md text-primary">
        <Icon className="h-4 w-4 text-slate-400">check_circle</Icon>
        {value}
      </dd>
    </div>
  )
}
