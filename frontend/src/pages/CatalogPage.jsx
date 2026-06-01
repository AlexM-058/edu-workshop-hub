import { useMemo, useState } from 'react'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import TopNav from '../components/TopNav'
import { CatalogWorkshopCard } from '../components/WorkshopCard'
import { catalogWorkshops } from '../data/stitchData'
import { useI18n } from '../i18n/I18nContext'

const pageSize = 3
const subjectOptions = ['Digital Humanities', 'Data Science', 'Pedagogy', 'Leadership']

export default function CatalogPage() {
  const { t } = useI18n()
  const [subject, setSubject] = useState('all')
  const [page, setPage] = useState(1)
  const workshops = useMemo(() => [
    ...catalogWorkshops,
    ...catalogWorkshops.slice(0, 2).map((workshop) => ({ ...workshop, title: `${workshop.title} II`, open: false })),
  ], [])
  const filteredWorkshops = subject === 'all' ? workshops : workshops.filter((workshop) => workshop.category === subject)
  const pageCount = Math.max(1, Math.ceil(filteredWorkshops.length / pageSize))
  const visibleWorkshops = filteredWorkshops.slice((page - 1) * pageSize, page * pageSize)
  const setSubjectFilter = (value) => {
    setSubject(value)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopNav />
      <main className="mx-auto max-w-6xl px-8 py-12 pt-28">
        <section className="mb-12">
          <h1 className="mb-2 font-h1 text-h1 text-primary">{t('catalog.title')}</h1>
          <p className="max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
            {t('catalog.subtitle')}
          </p>
        </section>
        <section className="mb-10 flex flex-wrap items-end gap-6 border border-outline-variant bg-white p-6 shadow-sm">
          {[
            ['catalog.subject', 'catalog.allSubjects'],
            ['catalog.level', 'catalog.anyLevel'],
            ['catalog.format', 'catalog.allFormats'],
          ].map(([labelKey, optionKey]) => (
            <label key={labelKey} className="min-w-[200px] flex-1">
              <span className="mb-2 block text-label-md font-label-md text-primary">{t(labelKey)}</span>
              <select
                className="w-full rounded-lg border-outline-variant bg-surface-container-lowest py-2 font-body-md text-body-md transition-all focus:border-primary-container focus:ring-1 focus:ring-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                disabled={labelKey !== 'catalog.subject'}
                onChange={(event) => setSubjectFilter(event.target.value)}
                title={labelKey === 'catalog.subject' ? undefined : t('common.demoUnavailable')}
                value={labelKey === 'catalog.subject' ? subject : 'all'}
              >
                <option value="all">{t(optionKey)}</option>
                {labelKey === 'catalog.subject' ? subjectOptions.map((option) => <option key={option} value={option}>{option}</option>) : null}
              </select>
            </label>
          ))}
          <button className="flex cursor-not-allowed items-center gap-2 rounded bg-primary-container px-6 py-2.5 font-label-md text-on-primary-container opacity-60" disabled title={t('common.demoUnavailable')} type="button">
            <Icon className="text-sm">filter_list</Icon>{t('common.applyFilters')}
          </button>
        </section>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 xl:grid-cols-3">
          {visibleWorkshops.map((workshop) => <CatalogWorkshopCard key={workshop.title} workshop={workshop} />)}
        </div>
        <div className="mt-16 flex items-center justify-center gap-4">
          <button className="border border-outline-variant p-2 text-primary transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button"><Icon>chevron_left</Icon></button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button key={pageNumber} className={`h-10 w-10 border font-label-md ${pageNumber === page ? 'border-primary bg-primary text-white' : 'border-outline-variant text-primary hover:bg-slate-50'}`} onClick={() => setPage(pageNumber)} type="button">{pageNumber}</button>)}
          <button className="border border-outline-variant p-2 text-primary transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} type="button"><Icon>chevron_right</Icon></button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
