import { Link } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import Icon from '../components/Icon'
import { useI18n } from '../i18n/I18nContext'

const workshopImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDJ2XONKtzp6gLblvG0zw9_c-JB34Ep6OSggwpFwG9CWuFY0eDty0-Y4KSwqL13a2JvdQKOV7ZeQuGtM03psiB9ZXGmorXKs0oz6lK7CGpEVyWx3ruNAuecHIEISoRUUC4lhDO9MFB2vWfuIZje_UZVkuog7UaVnIpeZWfahXfYpW5RAF5fDKUCiKtTdV8g87kJMGiZkzXK25riGL4v5C1cUhFDqjwNUKd6oKYDVmRQd9eniuLkPqWpaGj6s-KRRehlW8-RWaNc0qE',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA1hscFPzm0ZZRb1VfkwvwFvuVlwhHXsBqHkvIrsRfm1WW9Sphszz6ezBKDGs9objOgOYukB68D6T2EN6CVgQSDM-HxZ0iAsn1fIRa8BnB5jEmE64WSEJAqFRxWlR0gaWl5prjGbpAWbgEQ0NDIPUiOi0gdU2U5eAme7CDGY-NgiBB9rc0vy3peeS4fj0CuPcRvLEabFct3Hl-2yp-ohs6aiwV4YqDtsWifD9590xymKDgkskWiOeq5NeBB0GofnvRovY-Z815wov8',
]

const workshops = [
  {
    title: 'Design Thinking: De la Concept la Prototip',
    status: 'workshops.activeStatus',
    tone: 'bg-secondary-container text-on-secondary-container',
    image: workshopImages[0],
    details: [['group', 'workshops.enrolledStudents', '452/500'], ['calendar_today', 'workshops.date', '15 Oct 2026'], ['location_on', 'workshops.location', 'Amfiteatrul A1'], ['hourglass_empty', 'workshops.waitlist', '12']],
    action: 'common.edit',
    to: '/demo/dashboard/referent/workshops/new',
  },
  {
    title: 'Etica în Inteligența Artificială',
    status: 'workshops.completedStatus',
    tone: 'bg-surface-container text-slate-500',
    image: workshopImages[1],
    muted: true,
    details: [['group', 'workshops.enrolledStudents', '832/850'], ['calendar_today', 'workshops.date', '22 Iul 2026'], ['location_on', 'workshops.location', 'Online (Zoom)']],
    action: 'workshops.analyzeData',
    to: '/demo/dashboard/referent/analytics',
  },
  {
    title: 'Workshop fără titlu',
    status: 'workshops.draftStatus',
    tone: 'bg-tertiary-fixed text-on-tertiary-fixed',
    draft: true,
    details: [['calendar_today', 'workshops.date', 'common.unspecified'], ['location_on', 'workshops.location', 'common.unspecified'], ['edit', 'workshops.lastChanges', 'instructorDashboard.now3h']],
    action: 'common.continueEditing',
    to: '/demo/dashboard/referent/workshops/new',
  },
]

export default function InstructorWorkshopsPage() {
  const { t } = useI18n()

  return (
    <DashboardShell mode="instructor">
      <main className="mx-auto max-w-[1200px] p-margin">
        <header className="mb-lg">
          <h1 className="mb-2 font-h1 text-h1 text-primary">{t('workshops.title')}</h1>
          <p className="max-w-2xl font-body-lg text-body-lg text-slate-600">{t('workshops.subtitle')}</p>
        </header>

        <div className="mb-md flex flex-col justify-between gap-md border-b border-slate-200 lg:flex-row lg:items-end">
          <div className="flex flex-wrap gap-gutter">
            {['workshops.all', 'workshops.activeTab', 'workshops.completedTab', 'workshops.draftTab'].map((tab, index) => (
              <button key={tab} className={`pb-4 font-label-md text-label-md transition-colors ${index === 0 ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-primary'}`} type="button">{t(tab)}</button>
            ))}
          </div>
          <button className="mb-sm inline-flex cursor-not-allowed items-center justify-center gap-2 rounded border border-outline-variant bg-white px-4 py-2 text-label-md font-label-md text-on-surface opacity-60" disabled title={t('common.demoUnavailable')} type="button">
            <Icon>filter_list</Icon>{t('workshops.sortFilter')}<Icon>expand_more</Icon>
          </button>
        </div>

        <div className="space-y-md">
          {workshops.map((workshop) => (
            <article key={workshop.title} className={`flex flex-col overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-[0_4px_12px_rgba(26,54,93,0.05)] md:flex-row ${workshop.draft ? 'border-dashed border-slate-300' : 'border-outline-variant'}`}>
              <div className={`flex h-48 w-full shrink-0 items-center justify-center overflow-hidden bg-slate-100 md:h-auto md:w-64 ${workshop.muted ? 'grayscale-[20%] opacity-90' : ''}`}>
                {workshop.draft ? <Icon className="h-10 w-10 text-slate-300">image</Icon> : <img className="h-full w-full object-cover" src={workshop.image} alt="" />}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between p-md">
                <div>
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h3 className={`font-h3 text-h3 ${workshop.draft ? 'italic text-slate-400' : 'text-primary'}`}>{workshop.title}</h3>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${workshop.tone}`}>{t(workshop.status)}</span>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {workshop.details.map(([icon, label, value]) => (
                      <p key={label} className={`flex items-center gap-2 font-caption text-sm ${workshop.draft ? 'italic text-slate-400' : 'text-slate-600'}`}>
                        <Icon className="h-4 w-4">{icon}</Icon>{t(label)}: <span className="font-bold text-primary">{value.startsWith?.('common.') || value.startsWith?.('instructorDashboard.') ? t(value) : value}</span>
                      </p>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                  <Link className={`rounded px-6 py-2 text-label-md font-label-md transition-colors ${workshop.action === 'workshops.analyzeData' ? 'bg-primary text-white hover:bg-primary-container' : 'border border-primary text-primary hover:bg-slate-50'}`} to={workshop.to}>{t(workshop.action)}</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </DashboardShell>
  )
}
