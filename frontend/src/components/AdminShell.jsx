import { Link, NavLink } from 'react-router-dom'
import Icon from './Icon'
import LanguageToggle from './LanguageToggle'
import { images } from '../data/stitchData'
import { useI18n } from '../i18n/I18nContext'

const adminLinks = [
  { labelKey: 'admin.nav.users', icon: 'group', to: '/demo/admin/users' },
  { labelKey: 'admin.nav.settings', icon: 'settings', to: '/demo/admin/settings' },
  { labelKey: 'admin.nav.audit', icon: 'security', to: '/demo/admin/audit' },
]

export default function AdminShell({ children, searchKey = 'admin.searchSettings' }) {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-background text-on-background">
      <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-8 backdrop-blur-md">
        <Link to="/" className="font-h2 text-2xl font-bold tracking-tight text-blue-900">EduCraft</Link>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">search</Icon>
            <input className="w-64 rounded border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder={t(searchKey)} type="text" />
          </div>
          <button className="rounded p-2 text-slate-600 transition-colors hover:bg-slate-50" aria-label={t('admin.notifications')} type="button"><Icon>notifications</Icon></button>
          <button className="rounded p-2 text-slate-600 transition-colors hover:bg-slate-50" aria-label={t('common.needHelp')} type="button"><Icon>help</Icon></button>
          <LanguageToggle />
          <img className="h-8 w-8 rounded-full border border-slate-200 object-cover" src={images.profile} alt="" />
        </div>
      </header>
      <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-64px)] w-64 flex-col border-r border-slate-200 bg-slate-50 p-4 md:flex">
        <div className="mb-8 px-2">
          <h2 className="font-h3 text-xl font-bold text-blue-900">EduCraft</h2>
          <p className="text-caption text-slate-500">{t('admin.portal')}</p>
        </div>
        <nav className="flex-1 space-y-1">
          {adminLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all ${
                  isActive
                    ? 'bg-white font-bold text-blue-900 shadow-sm ring-1 ring-slate-200 md:border-r-4 md:border-blue-900'
                    : 'font-medium text-slate-500 hover:bg-white hover:text-blue-800 hover:shadow-sm'
                }`
              }
            >
              <Icon className="h-5 w-5">{item.icon}</Icon>
              <span className="truncate font-body-md">{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 pt-4">
          <Link className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-label-md font-label-md text-white transition-colors hover:bg-primary-container" to="/demo/dashboard/teacher/workshops/new">
            <Icon>add_circle</Icon>
            {t('admin.newWorkshop')}
          </Link>
        </div>
      </aside>
      <main className="pt-16 md:ml-64">
        <div className="border-b border-primary-fixed bg-primary-fixed px-margin py-2 text-xs font-label-md text-primary">{t('admin.demoNotice')}</div>
        {children}
      </main>
    </div>
  )
}
