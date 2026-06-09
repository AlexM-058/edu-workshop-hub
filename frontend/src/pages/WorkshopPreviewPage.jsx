import { Link } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import DevelopmentBadge from '../components/DevelopmentBadge'
import Icon from '../components/Icon'
import { useI18n } from '../i18n/I18nContext'

const cover = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2jshd81XqNd2L3vwTrIIdwsorLOHrG2otNcfhZetBrvoBahhXGySzn3I3Ebtttq1OfwJsc9jEjIIQmZ0EsOgGZ1gMHSKGArA7Fbl6wBwMGp4j3nB8_VQkWWX-GcMpx9bmWO7to6ZvF5ylBlWOIYtTEktDC8POD4uyoTE4o82oT_jpzFcmpkP3M4zj65muhre0kTrqqpcRYvd8DdBaTGdCWL4JdpzvY7vanPp2ODehWAvblG4BKUE3J1gtsnAnQ7G3j-3_G2Akf_E'

export default function WorkshopPreviewPage() {
  const { t } = useI18n()

  return (
    <DashboardShell mode="teacher">
      <main className="min-h-screen">
        <div className="flex items-center justify-between bg-primary-container px-margin py-4 text-on-primary-container">
          <div className="flex items-center gap-3"><Icon>verified</Icon><span className="font-label-md uppercase">{t('preview.mode')}</span></div>
          <div className="flex items-center gap-3">
            <DevelopmentBadge />
            <p className="font-caption italic opacity-80">{t('preview.modeText')}</p>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] px-margin py-xl">
          <header className="mb-lg border-b border-outline-variant pb-md">
            <div className="mb-sm flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-surface-container-high px-3 py-1 font-caption text-caption font-bold uppercase tracking-wider text-primary">{t('preview.category')}</span>
              <span className="rounded-full bg-secondary-container px-3 py-1 font-caption text-caption font-bold uppercase tracking-wider text-on-secondary-container">{t('preview.open')}</span>
            </div>
            <h1 className="mb-xs font-h1 text-h1 leading-tight text-primary">{t('preview.title')}</h1>
            <p className="max-w-3xl font-body-lg text-on-surface-variant">{t('preview.subtitle')}</p>
          </header>

          <div className="grid grid-cols-12 gap-gutter">
            <section className="col-span-12 space-y-lg lg:col-span-8">
              <div className="aspect-video overflow-hidden rounded-xl border border-outline-variant"><img className="h-full w-full object-cover" src={cover} alt="" /></div>
              <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md">
                <h2 className="mb-md border-b border-outline-variant pb-2 font-h3 text-h3 text-primary">{t('preview.about')}</h2>
                <div className="space-y-4 font-body-md leading-relaxed text-on-surface">
                  <p>{t('preview.aboutText')}</p>
                  <h3 className="mt-6 font-label-md text-primary">{t('preview.objectives')}</h3>
                  <ul className="list-disc space-y-2 pl-5 text-on-surface-variant">
                    {['preview.objective1', 'preview.objective2', 'preview.objective3', 'preview.objective4'].map((key) => <li key={key}>{t(key)}</li>)}
                  </ul>
                </div>
              </section>
            </section>

            <aside className="col-span-12 space-y-md lg:col-span-4">
              <section className="rounded-xl border border-outline-variant bg-white p-md shadow-sm">
                <h3 className="mb-md border-b border-slate-100 pb-2 font-label-md text-primary">{t('preview.logistics')}</h3>
                {[
                  ['calendar_today', 'preview.period', 'preview.periodValue'],
                  ['schedule', 'preview.duration', 'preview.durationValue'],
                  ['group', 'preview.participants', 'preview.participantsValue'],
                  ['location_on', 'workshops.location', 'preview.locationValue'],
                ].map(([icon, label, value]) => (
                  <div key={label} className="mb-sm flex items-start gap-3">
                    <Icon className="mt-1 h-5 w-5 text-primary-container">{icon}</Icon>
                    <div><p className="font-caption text-caption font-bold uppercase text-on-surface-variant">{t(label)}</p><p className="font-body-md text-on-surface">{t(value)}</p></div>
                  </div>
                ))}
              </section>
              <section className="rounded-xl border border-outline-variant bg-surface-container-low p-md">
                <h3 className="mb-sm font-label-md text-primary">{t('preview.investment')}</h3>
                <div className="mb-md flex items-baseline gap-2"><span className="font-h2 text-h2 text-primary">1.250</span><span className="font-h3 text-h3 text-primary-container">RON</span></div>
                <div className="space-y-2 font-caption text-caption text-on-surface-variant">
                  <p className="flex items-center gap-2"><Icon className="text-secondary">check_circle</Icon>{t('preview.materials')}</p>
                  <p className="flex items-center gap-2"><Icon className="text-secondary">check_circle</Icon>{t('preview.platformAccess')}</p>
                </div>
                <div className="mt-lg space-y-3">
                  <button className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 font-label-md text-white opacity-60" disabled title={t('common.demoUnavailable')} type="button"><Icon>upload</Icon>{t('common.publish')}</button>
                  <Link className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-primary px-6 py-4 font-label-md text-primary transition-colors hover:bg-surface-container-high" to="/demo/dashboard/teacher/workshops/new"><Icon>edit</Icon>{t('preview.backToEdit')}</Link>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </DashboardShell>
  )
}
