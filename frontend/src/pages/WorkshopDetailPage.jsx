import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import TopNav from '../components/TopNav'
import { images } from '../data/stitchData'
import { useI18n } from '../i18n/I18nContext'

export default function WorkshopDetailPage() {
  const { t } = useI18n()

  return (
    <div className="bg-surface text-on-surface">
      <TopNav />
      <main className="mx-auto max-w-7xl px-8 py-xl pt-28">
        <section className="mb-xl grid grid-cols-1 items-center gap-xl lg:grid-cols-12">
          <div className="lg:col-span-7">
            <nav className="mb-6 flex gap-2 text-xs font-label-md uppercase tracking-widest text-on-surface-variant">
              <span>Catalog</span><Icon className="text-sm">chevron_right</Icon><span>Higher Education</span><Icon className="text-sm">chevron_right</Icon><span className="font-bold text-primary">Instructional Leadership</span>
            </nav>
            <h1 className="mb-6 font-h1 text-h1 leading-tight text-primary">{t('detail.title')}</h1>
            <p className="mb-8 max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
              {t('detail.subtitle')}
            </p>
            <div className="mb-10 flex flex-wrap gap-6">
              <Info icon="calendar_today">Oct 24 - Nov 12, 2024</Info>
              <Info icon="schedule">12 Credit Hours</Info>
              <Info icon="group">Limited to 25 Participants</Info>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="/demo/dashboard/attender" className="rounded-xl bg-primary px-10 py-4 font-label-md text-on-primary shadow-lg shadow-primary/10 transition-all hover:opacity-95">{t('detail.enrollNow')}</Link>
              <button className="cursor-not-allowed rounded-xl border-2 border-outline-variant px-8 py-4 font-label-md text-primary opacity-60" disabled title={t('common.demoUnavailable')} type="button">{t('detail.download')}</button>
            </div>
          </div>
          <div className="relative lg:col-span-5">
            <div className="aspect-[4/5] overflow-hidden rounded-xl border border-outline-variant/30 shadow-2xl">
              <img className="h-full w-full object-cover" src={images.conference} alt="Workshop Environment" />
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-xl border border-secondary/20 bg-secondary-container p-6 text-on-secondary-container shadow-xl">
              <div className="flex items-center gap-3"><Icon className="text-3xl">verified</Icon><div><p className="font-label-md">Accredited Workshop</p><p className="text-xs opacity-80">Continuing Ed. Board Approved</p></div></div>
            </div>
          </div>
        </section>
        <div className="mb-xl grid grid-cols-1 gap-gutter md:grid-cols-3">
          <article className="rounded-xl border border-outline-variant bg-white p-8 shadow-sm md:col-span-2">
            <h2 className="mb-6 font-h2 text-h2 text-primary">{t('detail.overview')}</h2>
            <div className="space-y-4 font-body-md leading-relaxed text-on-surface-variant">
              <p>In an era of rapid technological advancement, the digital classroom requires more than just screen sharing.</p>
              <p>Participants will explore evidence-based frameworks for designing interactive learning modules while maintaining the highest standards of intellectual discourse.</p>
            </div>
            <h3 className="mb-6 mt-10 font-h3 text-h3 text-primary">{t('detail.learn')}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {['Designing asynchronous modules for high-retention learning.', 'Utilizing AI-assisted grading and feedback systems.', 'Facilitating deep-dive synchronous discussions online.', 'Accessibility standards for diverse learner profiles.', 'Measuring qualitative outcomes in digital spaces.', 'Building a sustainable digital professional practice.'].map((item) => (
                <div key={item} className="flex items-start gap-3"><Icon filled className="shrink-0 text-secondary">check_circle</Icon><span className="font-body-md">{item}</span></div>
              ))}
            </div>
          </article>
          <article className="flex flex-col items-center rounded-xl border border-outline-variant bg-surface-container-low p-8 text-center">
            <img className="mb-6 h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg" src={images.profile} alt="Dr. Sarah Jenkins" />
            <h3 className="mb-1 font-h3 text-h3 text-primary">Dr. Sarah Jenkins</h3>
            <p className="mb-6 font-label-md text-secondary">Lead Instructional Designer, Stanford EdTech</p>
            <p className="mb-8 px-4 font-body-md text-on-surface-variant">With over 20 years of experience in higher education, Dr. Jenkins specializes in the cognitive load theory of digital learning.</p>
            <button className="w-full cursor-not-allowed rounded-lg border border-outline-variant bg-white py-3 font-label-md text-primary opacity-60" disabled title={t('common.demoUnavailable')} type="button">View Publications</button>
          </article>
        </div>
        <section className="mb-xl">
          <h2 className="mb-lg font-h2 text-h2 text-primary">{t('detail.curriculum')}</h2>
          <div className="space-y-4">
            {['Foundations of Digital Engagement', 'Tool Synthesis and Implementation', 'Assessing Excellence', 'The Future Roadmap'].map((title, index) => (
              <article key={title} className="group overflow-hidden rounded-xl border border-outline-variant bg-white transition-colors hover:border-primary/30">
                <div className="flex cursor-pointer items-center justify-between p-6">
                  <div className="flex items-center gap-6"><span className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container font-h3 text-xl font-bold text-primary">{String(index + 1).padStart(2, '0')}</span><div><h4 className="font-h3 text-lg font-bold text-primary">{title}</h4><p className="text-sm text-on-surface-variant">Understanding the cognitive transition from physical to virtual.</p></div></div>
                  <Icon className="text-slate-400 transition-colors group-hover:text-primary">expand_more</Icon>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function Info({ icon, children }) {
  return <div className="flex items-center gap-2"><Icon className="text-secondary">{icon}</Icon><span className="font-label-md">{children}</span></div>
}
