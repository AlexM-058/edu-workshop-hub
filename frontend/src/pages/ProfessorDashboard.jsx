import { Link } from 'react-router-dom';
import DashboardShell from '../components/DashboardShell';
import Icon from '../components/Icon';
import { images } from '../data/stitchData';
import { useI18n } from '../i18n/I18nContext';

export default function ProfessorDashboard() {
  const { t } = useI18n();
  const activeWorkshops = [
    {
      titleKey: 'dashboard.workshop1Title',
      image: images.tablet,
      progress: '65%',
      unitsKey: 'dashboard.workshop1Units',
    },
    {
      titleKey: 'dashboard.workshop2Title',
      image: images.conference,
      progress: '20%',
      unitsKey: 'dashboard.workshop2Units',
    },
  ];
  const recommended = ['dashboard.recommended1', 'dashboard.recommended2'];

  return (
    <DashboardShell>
      <div className="mx-auto max-w-7xl px-10 py-12">
        <div className="mb-12 rounded-lg border border-primary-fixed bg-primary-fixed px-4 py-3 text-sm font-label-md text-primary">{t('dashboard.professorDemo')}</div>
        <header className="mb-12">
          <h1 className="mb-2 font-h1 text-h1 text-primary">{t('dashboard.welcome')}</h1>
          <p className="max-w-2xl font-body-lg text-body-lg text-on-surface-variant">{t('dashboard.welcomeText')}</p>
        </header>
        <div className="grid grid-cols-12 gap-gutter">
          <section className="col-span-12 space-y-md lg:col-span-8">
            <div className="mb-2 flex items-center justify-between gap-4">
              <h2 className="font-h3 text-h3 text-primary">{t('dashboard.active')}</h2>
              <Link className="inline-flex items-center gap-1 whitespace-nowrap font-label-md text-blue-900 hover:underline" to="/catalog">
                {t('common.viewAll')} <Icon className="h-4 w-4">arrow_forward</Icon>
              </Link>
            </div>
            {activeWorkshops.map((workshop) => (
              <article key={workshop.titleKey} className="flex flex-col gap-6 rounded-lg border border-outline-variant bg-white p-md transition-shadow hover:shadow-sm md:flex-row">
                <img className="h-32 w-full flex-shrink-0 rounded-lg object-cover md:w-48" src={workshop.image} alt="" />
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <h3 className="mb-1 font-h3 text-xl text-primary">{t(workshop.titleKey)}</h3>
                    <p className="text-sm font-body-md text-on-surface-variant">{t('dashboard.workshopInstructor')} &bull; {t('dashboard.modulesCount')}</p>
                  </div>
                  <div className="mt-4">
                    <div className="mb-2 flex justify-between gap-4 text-xs font-label-md"><span>{t('dashboard.progressLabel')} {workshop.progress}</span><span className="text-right">{t(workshop.unitsKey)}</span></div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-secondary" style={{ width: workshop.progress }} /></div>
                  </div>
                </div>
              </article>
            ))}
          </section>
          <aside className="col-span-12 space-y-md lg:col-span-4">
            <div className="rounded-lg bg-primary p-lg text-white">
              <h3 className="mb-6 font-h3 text-xl">{t('dashboard.learningVelocity')}</h3>
              <div className="space-y-6">
                <Stat icon="workspace_premium" value="12" label={t('dashboard.certificatesTotal')} />
                <Stat icon="timer" value="156h" label={t('dashboard.learningHours')} />
              </div>
              <button className="mt-8 w-full cursor-not-allowed rounded bg-secondary-container py-3 font-label-md text-on-secondary-container opacity-60" disabled title={t('common.demoUnavailable')} type="button">{t('dashboard.downloadTranscript')}</button>
            </div>
            <div className="border border-outline-variant bg-white p-md">
              <h3 className="mb-4 font-h3 text-lg text-primary">{t('dashboard.recommended')}</h3>
              {recommended.map((itemKey) => <p key={itemKey} className="border-t border-slate-100 py-4 text-sm font-label-md text-primary first:border-t-0">{t(itemKey)}<span className="block text-xs font-normal text-on-surface-variant">{t('dashboard.basedOnHistory')}</span></p>)}
            </div>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}

function Stat({ icon, value, label }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10">
        <Icon className="h-6 w-6 text-secondary-fixed">{icon}</Icon>
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold leading-none">{value}</div>
        <div className="mt-1 text-xs font-label-md text-on-primary-container">{label}</div>
      </div>
    </div>
  )
}
