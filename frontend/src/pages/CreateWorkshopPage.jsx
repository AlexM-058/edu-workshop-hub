import { Link } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import Icon from '../components/Icon'
import { useI18n } from '../i18n/I18nContext'

export default function CreateWorkshopPage() {
  const { t } = useI18n()

  return (
    <DashboardShell mode="teacher">
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1000px] px-margin py-lg">
          <header className="mb-xl">
            <h1 className="mb-base font-h1 text-h1 text-primary">{t('create.title')}</h1>
            <p className="max-w-2xl font-body-lg text-body-lg text-on-surface-variant">{t('create.subtitle')}</p>
          </header>

          <div className="grid grid-cols-12 gap-gutter">
            <section className="col-span-12 space-y-md lg:col-span-8">
              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
                <div className="space-y-lg">
                  <Field label={t('create.titleLabel')} placeholder={t('create.titlePlaceholder')} />
                  <label className="space-y-xs block">
                    <span className="block font-label-md text-label-md uppercase text-primary">{t('create.category')}</span>
                    <select className="w-full rounded-lg border border-outline-variant bg-white p-4 font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20">
                      <option>Științe Sociale</option><option>Data Science</option><option>Umanioare Digitale</option><option>Fizică Teoretică</option>
                    </select>
                  </label>
                  <label className="space-y-xs block">
                    <span className="block font-label-md text-label-md uppercase text-primary">{t('create.description')}</span>
                    <textarea className="w-full resize-none rounded-lg border border-outline-variant bg-white p-4 font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder={t('create.descriptionPlaceholder')} rows="6" />
                  </label>

                  <section className="border-t border-slate-100 pt-lg">
                    <h3 className="mb-md font-label-md text-label-md uppercase text-primary">{t('create.coordinator')}</h3>
                    <div className="grid grid-cols-1 gap-md md:grid-cols-[120px_1fr]">
                      <div>
                        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-outline-variant bg-slate-100">
                          <Icon className="h-8 w-8 text-slate-400">upload</Icon>
                        </div>
                        <p className="mt-xs text-center font-caption text-[10px] uppercase text-on-surface-variant">{t('create.profileImage')}</p>
                      </div>
                      <div className="space-y-md">
                        <Field label={t('create.fullName')} placeholder={t('create.fullNamePlaceholder')} compact />
                        <label className="space-y-xs block">
                          <span className="block font-label-md text-label-md uppercase text-primary">{t('create.bio')}</span>
                          <textarea className="w-full resize-none rounded-lg border border-outline-variant p-3 font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder={t('create.bioPlaceholder')} rows="3" />
                        </label>
                        <Field label={t('create.links')} placeholder="https://linkedin.com/in/..." compact icon="link" />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-lg border-t border-slate-100 pt-lg">
                    <label className="space-y-xs block">
                      <span className="block font-label-md text-label-md uppercase text-primary">{t('create.period')}</span>
                      <div className="flex items-center gap-2">
                        <input className="w-full rounded-lg border border-outline-variant p-3 font-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" type="date" />
                        <span className="text-outline">-</span>
                        <input className="w-full rounded-lg border border-outline-variant p-3 font-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" type="date" />
                      </div>
                    </label>
                    <Field label={t('create.duration')} placeholder={t('create.durationPlaceholder')} compact />
                  </section>

                  <section className="border-t border-slate-100 pt-lg">
                    <div className="mb-md grid grid-cols-1 gap-md md:grid-cols-2">
                      <Field label={t('create.cost')} placeholder="0.00" compact prefix="RON" />
                      <Field label={t('create.participants')} placeholder={t('create.participantsPlaceholder')} compact />
                    </div>
                    <Field label={t('create.location')} placeholder={t('create.locationPlaceholder')} compact icon="location_on" />
                  </section>
                </div>
              </div>
            </section>

            <aside className="col-span-12 space-y-md lg:col-span-4">
              <section className="rounded-xl border border-outline-variant bg-surface-container-low p-md">
                <label className="mb-base block font-label-md text-label-md uppercase text-primary">{t('create.cover')}</label>
                <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-outline bg-white">
                  <Icon className="h-10 w-10 text-outline">image</Icon>
                </div>
                <p className="mt-sm font-caption text-caption text-on-surface-variant">{t('create.coverHelp')}</p>
              </section>
              <section className="rounded-xl border border-on-tertiary-fixed-variant/10 bg-tertiary-fixed p-md text-on-tertiary-fixed">
                <h4 className="mb-sm font-label-md text-label-md uppercase">{t('create.expertTip')}</h4>
                <p className="font-caption text-caption leading-relaxed">{t('create.expertTipText')}</p>
              </section>
            </aside>
          </div>

          <footer className="sticky bottom-0 z-40 mt-xl flex items-center justify-between border-t border-slate-200 bg-white/80 py-md backdrop-blur-sm">
            <button className="inline-flex cursor-not-allowed items-center gap-base rounded-lg border border-primary px-lg py-3 font-bold text-primary opacity-60" disabled title={t('common.demoUnavailable')} type="button"><Icon>close</Icon>{t('common.saveDraft')}</button>
            <Link className="inline-flex items-center gap-base rounded-lg bg-primary px-xl py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:brightness-110" to="/demo/dashboard/referent/workshops/preview">{t('create.continuePreview')} <Icon>arrow_forward</Icon></Link>
          </footer>
        </div>
      </main>
    </DashboardShell>
  )
}

function Field({ label, placeholder, compact = false, icon, prefix }) {
  return (
    <label className="space-y-xs block">
      <span className="block font-label-md text-label-md uppercase text-primary">{label}</span>
      <div className="relative">
        {icon ? <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-outline">{icon}</Icon> : null}
        {prefix ? <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">{prefix}</span> : null}
        <input className={`w-full rounded-lg border border-outline-variant font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${compact ? 'p-3' : 'p-4'} ${icon ? 'pl-10' : ''} ${prefix ? 'pl-16' : ''}`} placeholder={placeholder} type="text" />
      </div>
    </label>
  )
}
