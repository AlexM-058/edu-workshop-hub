import { useState } from 'react'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import TopNav from '../components/TopNav'
import { CatalogWorkshopCard } from '../components/WorkshopCard'
import { useI18n } from '../i18n/I18nContext'
import { useWorkshops } from '../lib/workshops'

export default function CatalogPage() {
  const { t, locale } = useI18n()
  const [page, setPage] = useState(1)
  const perPage = 9

  const { workshops, meta, isLoading, error } = useWorkshops({ page, perPage })

  const pageCount = meta?.last_page ?? 1

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

        {/* Error state */}
        {error && (
          <div className="mb-8 rounded-lg border border-error/30 bg-error-container px-6 py-4 text-on-error-container">
            <p className="font-label-md">
              {locale === 'de'
                ? 'Workshops konnten nicht geladen werden.'
                : 'Nu am putut încărca workshop-urile.'}
            </p>
            <p className="mt-1 text-sm opacity-70">{error.message}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: perPage }, (_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-outline-variant bg-white">
                <div className="aspect-video bg-slate-100" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-1/3 rounded bg-slate-100" />
                  <div className="h-5 w-3/4 rounded bg-slate-100" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && workshops?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Icon className="mb-4 text-5xl text-slate-300">search_off</Icon>
            <p className="font-h3 text-h3 text-primary">
              {locale === 'de' ? 'Keine Workshops gefunden' : 'Niciun workshop găsit'}
            </p>
            <p className="mt-2 text-on-surface-variant">
              {locale === 'de'
                ? 'Aktuell sind keine aktiven Workshops verfügbar.'
                : 'Nu există workshop-uri active momentan.'}
            </p>
          </div>
        )}

        {/* Workshop grid */}
        {!isLoading && workshops && workshops.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 xl:grid-cols-3">
              {workshops.map((workshop) => (
                <CatalogWorkshopCard key={workshop.id} workshop={workshop} />
              ))}
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="mt-16 flex items-center justify-center gap-4">
                <button
                  className="border border-outline-variant p-2 text-primary transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  type="button"
                >
                  <Icon>chevron_left</Icon>
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    className={`h-10 w-10 border font-label-md ${
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
                  className="border border-outline-variant p-2 text-primary transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={page === pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  type="button"
                >
                  <Icon>chevron_right</Icon>
                </button>
              </div>
            )}

            {/* Result count */}
            {meta && (
              <p className="mt-6 text-center text-sm text-on-surface-variant">
                {meta.total}{' '}
                {locale === 'de' ? 'Workshops gefunden' : 'workshop-uri disponibile'}
              </p>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
