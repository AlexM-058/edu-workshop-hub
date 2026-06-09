import { Link, useLocation } from 'react-router-dom'
import Icon from './Icon'
import TopNav from './TopNav'
import { useI18n } from '../i18n/I18nContext'

const professorLinks = [
  { labelKey: 'nav.dashboard', icon: 'dashboard', to: '/demo/dashboard/attender' },
  { labelKey: 'nav.activeCourses', icon: 'school', to: '/catalog' },
  { labelKey: 'nav.history', icon: 'history', to: '/demo/history' },
  { labelKey: 'nav.certificates', icon: 'workspace_premium', to: '/demo/certificates' },
  { labelKey: 'nav.resources', icon: 'menu_book', to: '/demo/resources' },
  { labelKey: 'nav.profile', icon: 'person', to: '/demo/profile' },
]

const instructorLinks = [
  { labelKey: 'nav.dashboard', icon: 'dashboard', to: '/demo/dashboard/teacher' },
  { labelKey: 'nav.myWorkshops', icon: 'school', to: '/demo/dashboard/teacher/workshops' },
  { labelKey: 'nav.createNew', icon: 'add_circle', to: '/demo/dashboard/teacher/workshops/new' },
  { labelKey: 'nav.analytics', icon: 'analytics', to: '/demo/dashboard/teacher/analytics' },
  { labelKey: 'nav.certificates', icon: 'workspace_premium', to: '/demo/certificates' },
  { labelKey: 'nav.resources', icon: 'menu_book', to: '/demo/resources' },
  { labelKey: 'nav.profile', icon: 'account_circle', to: '/demo/profile' },
]

export default function DashboardShell({
  children,
  mode = 'attender',
  searchValue = '',
  onSearchChange,
  searchDisabled = false,
  showSearch = true,
}) {
  const links = mode === 'teacher' ? instructorLinks : professorLinks
  const { t } = useI18n()
  const location = useLocation()
  const currentPath = `${location.pathname}${location.search}`

  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopNav
        instructor={mode === 'teacher'}
        onSearchChange={onSearchChange}
        searchDisabled={searchDisabled}
        searchKey={mode === 'teacher' ? 'nav.searchWorkshops' : 'nav.searchResources'}
        searchValue={searchValue}
        showSearch={mode === 'teacher' ? false : showSearch}
      />
      <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-64px)] w-64 flex-col border-r border-slate-200 bg-slate-50 p-4 lg:flex">
        <div className="mb-8 px-4 pt-4">
          <h2 className="font-h3 text-xl font-bold text-blue-900">{mode === 'teacher' ? 'EduCraft' : t('nav.dashboard')}</h2>
          <p className="text-caption font-label-md uppercase tracking-widest text-slate-500">
            {mode === 'teacher' ? 'Teacher Portal' : 'EduCraft'}
          </p>
        </div>
        <nav className="flex-1 space-y-1">
          {links.map((item) => {
            const isActive = currentPath === item.to

            return (
              <Link
                key={item.to + item.labelKey}
                to={item.to}
                className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all ${
                  isActive
                    ? 'bg-white font-bold text-blue-900 shadow-sm ring-1 ring-slate-200 lg:border-r-4 lg:border-blue-900'
                    : 'font-medium text-slate-500 hover:bg-white hover:text-blue-800 hover:shadow-sm'
                }`}
              >
                <Icon className="h-5 w-5 text-current">{item.icon}</Icon>
                <span className="truncate font-body-md">{t(item.labelKey)}</span>
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto pt-4">
          <Link
            to={mode === 'teacher' ? '/demo/dashboard/teacher/workshops/new' : '/catalog'}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-label-md font-label-md text-white transition-colors hover:bg-primary-container"
          >
            <Icon className="h-5 w-5">{mode === 'teacher' ? 'add' : 'school'}</Icon>
            {mode === 'teacher' ? t('nav.createNew') : t('landing.explore')}
          </Link>
        </div>
      </aside>
      <div className="pt-16 lg:ml-64">
        <div className="border-b border-primary-fixed bg-primary-fixed px-margin py-2 text-xs font-label-md text-primary">
          {t('common.demoRouteNotice')}
        </div>
        {children}
      </div>
    </div>
  )
}
