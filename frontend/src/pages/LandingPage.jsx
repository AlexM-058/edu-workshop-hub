import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import TopNav from '../components/TopNav';
import { MarketingWorkshopCard } from '../components/WorkshopCard';
import { images } from '../data/stitchData';
import { useI18n } from '../i18n/I18nContext';
import { useWorkshops } from '../lib/workshops';

export default function LandingPage() {
  const { t } = useI18n();
  const { workshops: featuredWorkshops, isLoading: loadingFeatured } = useWorkshops({ page: 1, perPage: 3 });

  return (
    <div className="bg-background text-on-background">
      <TopNav />
      <main className="pt-16">
        <section className="relative overflow-hidden bg-surface">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-lg px-margin py-xl md:flex-row">
            <div className="z-10 flex-1 space-y-md">
              <span className="inline-block rounded-full bg-secondary-container px-3 py-1 text-label-md font-label-md text-on-secondary-container">
                {t('landing.badge')}
              </span>
              <h1 className="font-h1 text-h1 leading-tight text-primary">{t('landing.title')}</h1>
              <p className="max-w-[560px] font-body-lg text-body-lg text-on-surface-variant">
                {t('landing.summary')}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/catalog" className="flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-label-md font-label-md text-white shadow-md transition-all hover:opacity-90">
                  {t('landing.explore')}
                  <Icon>arrow_forward</Icon>
                </Link>
                <Link to="/demo/dashboard/attender" className="rounded-lg border border-primary px-8 py-4 text-label-md font-label-md text-primary transition-all hover:bg-surface-container">
                  {t('landing.viewDashboard')}
                </Link>
              </div>
              <div className="flex items-center gap-4 pt-8 text-sm font-medium text-on-surface-variant">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-200" />
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-300" />
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-400" />
                </div>
                <span>{t('landing.teacherCount')}</span>
              </div>
            </div>
            <div className="relative flex-1">
              <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-secondary-container opacity-20 blur-3xl" />
              <div className="relative overflow-hidden rounded-xl border-4 border-white shadow-2xl">
                <img className="aspect-[4/3] h-auto w-full object-cover" src={images.hero} alt="Modern university classroom with engaged educators" />
              </div>
              <div className="absolute -bottom-6 -left-6 max-w-[260px] rounded-xl border border-slate-100 bg-white p-6 shadow-lg">
                <div className="mb-2 flex items-center gap-3">
                  <Icon filled className="text-secondary">workspace_premium</Icon>
                  <span className="text-label-md font-label-md text-primary">{t('landing.certificate')}</span>
                </div>
                <p className="text-caption font-caption text-on-surface-variant">{t('landing.certificateText')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest py-xl">
          <div className="mx-auto max-w-7xl px-margin">
            <div className="mx-auto mb-lg max-w-3xl text-center">
              <h2 className="mb-4 font-h2 text-h2 text-primary">{t('landing.whyTitle')}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">{t('landing.whyText')}</p>
            </div>
            <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
              {[
                ['menu_book', t('landing.feature1Title'), t('landing.feature1Text')],
                ['groups', t('landing.feature2Title'), t('landing.feature2Text')],
                ['history_edu', t('landing.feature3Title'), t('landing.feature3Text')],
              ].map(([icon, title, body]) => (
                <article key={title} className="group rounded-xl border border-outline-variant bg-white p-lg transition-all hover:shadow-lg">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon>{icon}</Icon>
                  </div>
                  <h3 className="mb-3 font-h3 text-h3 text-primary">{title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface py-xl">
          <div className="mx-auto max-w-7xl px-margin">
            <div className="mb-lg flex items-end justify-between">
              <div>
                <h2 className="font-h2 text-h2 text-primary">{t('landing.featured')}</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">{t('landing.featuredText')}</p>
              </div>
              <Link className="flex items-center gap-2 text-label-md font-label-md text-primary hover:underline" to="/catalog">
                {t('landing.viewCatalog')}
                <Icon>chevron_right</Icon>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
              {loadingFeatured
                ? Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white">
                      <div className="aspect-video bg-slate-100" />
                      <div className="p-6 space-y-3">
                        <div className="h-3 w-1/3 rounded bg-slate-100" />
                        <div className="h-5 w-3/4 rounded bg-slate-100" />
                      </div>
                    </div>
                  ))
                : (featuredWorkshops ?? []).map((workshop) => (
                    <MarketingWorkshopCard key={workshop.id} workshop={workshop} />
                  ))
              }
            </div>
          </div>
        </section>

        <section className="bg-primary py-xl text-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-lg px-margin md:grid-cols-2">
            <div>
              <h2 className="mb-6 font-h2 text-h2">{t('landing.community')}</h2>
              <p className="mb-8 font-body-lg text-body-lg opacity-80">{t('landing.communityText')}</p>
              <div className="flex gap-4">
                <span className="rounded-full border border-white/20 p-3"><Icon>west</Icon></span>
                <span className="rounded-full border border-white/20 p-3"><Icon>east</Icon></span>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 rounded-xl border border-white/10 bg-white/10 p-lg backdrop-blur-md">
                <Icon filled className="mb-4 text-5xl text-secondary opacity-40">format_quote</Icon>
                <p className="mb-6 font-h3 text-h3 italic leading-relaxed">„Workshop-ul despre tehnologie digitală mi-a transformat complet orele de istorie. Elevii sunt acum mult mai implicați."</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-200" />
                  <div><p className="font-bold">Maria Popescu</p><p className="text-sm opacity-70">Profesor de Istorie, Grad I</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
