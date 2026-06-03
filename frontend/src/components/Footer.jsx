import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'

export default function Footer({ offset = false }) {
  const { t } = useI18n()
  const links = [
    ['common.privacy', '/'],
    ['common.terms', '/'],
    ['common.accessibility', '/'],
    ['common.contact', '/'],
  ]

  return (
    <footer className={`${offset ? 'lg:ml-64' : ''} border-t border-slate-200 bg-white`}>
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-8 px-8 py-12 md:flex-row md:items-center">
        <div className="space-y-3">
          <h3 className="font-h3 text-lg font-semibold text-blue-900">EduCraft</h3>
          <p className="max-w-[320px] font-h3 text-sm text-slate-500">© 2024 Higher Education Professional Development. All rights reserved.</p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-4">
          {links.map(([labelKey, to]) => (
            <Link key={labelKey} to={to} className="font-h3 text-sm text-slate-500 underline decoration-slate-300 transition-opacity duration-300 hover:text-blue-900">
              {t(labelKey)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
