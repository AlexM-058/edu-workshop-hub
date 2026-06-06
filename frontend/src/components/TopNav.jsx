import { UserButton } from '@clerk/clerk-react'
import { Link, NavLink } from 'react-router-dom'
import Icon from './Icon'
import { useAppAuth } from '../auth/AuthContext'
import LanguageToggle from './LanguageToggle'
import { useI18n } from '../i18n/I18nContext'

const professorLinks = [
  { labelKey: 'nav.catalog', to: '/catalog' },
  { labelKey: 'nav.myWorkshops', to: '/demo/dashboard/attender' },
  { labelKey: 'nav.certificates', to: '/demo/certificates' },
  { labelKey: 'nav.resources', to: '/demo/resources' },
]

const instructorLinks = [
  { labelKey: 'nav.catalog', to: '/catalog' },
  { labelKey: 'nav.myWorkshops', to: '/demo/dashboard/teacher/workshops' },
  { labelKey: 'nav.certificates', to: '/demo/certificates' },
  { labelKey: 'nav.resources', to: '/demo/resources' },
]

export default function TopNav({ searchKey = 'nav.searchCourses', instructor = false }) {
  const { t } = useI18n()
  const { appUser, clerkConfigured, isSignedIn, signOut } = useAppAuth()
  const links = [
    ...(instructor ? instructorLinks : professorLinks),
    ...(appUser?.role === 'admin' ? [{ labelKey: 'admin.portal', to: '/demo/admin/dashboard' }] : []),
  ]

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-tight text-blue-900">
            EduCraft
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-h3 text-base tracking-tight transition-colors duration-200 ${
                    isActive
                      ? 'border-b-2 border-blue-900 pb-1 font-bold text-blue-900'
                      : 'font-medium text-slate-600 hover:text-blue-900'
                  }`
                }
              >
                {t(link.labelKey)}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">search</Icon>
            <input
              className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder={t(searchKey)}
              type="text"
            />
          </div>
          <button className="cursor-not-allowed rounded-lg p-2 text-slate-600 opacity-60 transition-colors duration-200 hover:bg-slate-50" aria-label="Notifications" disabled title={t('common.demoUnavailable')} type="button">
            <Icon>notifications</Icon>
          </button>
          <button className="cursor-not-allowed rounded-lg p-2 text-slate-600 opacity-60 transition-colors duration-200 hover:bg-slate-50" aria-label="Help" disabled title={t('common.demoUnavailable')} type="button">
            <Icon>help_outline</Icon>
          </button>
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right md:block">
                <p className="text-xs font-label-md text-primary">{appUser?.name ?? 'EduCraft'}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{appUser?.role ?? 'sync'}</p>
              </div>
              {clerkConfigured ? (
                <UserButton afterSignOutUrl="/sign-in" />
              ) : (
                <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-primary transition-colors hover:bg-slate-50" onClick={() => signOut()} type="button">
                  {t('auth.signOut')}
                </button>
              )}
            </div>
          ) : (
            <Link to="/sign-in" className="rounded-lg bg-primary px-6 py-2 text-label-md font-label-md text-white transition-all hover:bg-primary-container">
              {t('auth.signIn')}
            </Link>
          )}
          <LanguageToggle />
        </div>
      </div>
    </header>
  )
}
