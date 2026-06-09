import { Link } from 'react-router-dom'
import { useState } from 'react'
import DevelopmentBadge from '../components/DevelopmentBadge'
import Icon from '../components/Icon'
import LanguageToggle from '../components/LanguageToggle'
import { images } from '../data/stitchData'
import { useI18n } from '../i18n/I18nContext'

const interests = ['Cognitive Pedagogy', 'Research Ethics', 'Faculty Mentorship', 'Global Collaboration', 'AI in Curriculum', 'Policy Development']

export default function RegisterProfessor() {
  const { t } = useI18n()
  const [selectedTags, setSelectedTags] = useState(['Higher Education', 'Digital Literacy'])
  const [selectedInterests, setSelectedInterests] = useState(['Research Ethics'])

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-background">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-8">
          <Link to="/" className="text-xl font-bold tracking-tight text-blue-900">EduCraft</Link>
          <div className="flex items-center gap-4">
            <span className="text-label-md font-label-md text-slate-500">{t('common.needHelp')}</span>
            <button className="text-slate-600" aria-label={t('common.needHelp')}><Icon>help_outline</Icon></button>
            <LanguageToggle />
          </div>
        </div>
      </header>
      <main className="flex flex-grow items-center justify-center px-margin py-xl">
        <div className="grid w-full max-w-5xl grid-cols-1 items-start gap-xl md:grid-cols-12">
          <aside className="space-y-lg md:col-span-5 lg:col-span-4">
            <div className="space-y-md">
              <DevelopmentBadge />
              <h1 className="font-h1 text-h1 leading-tight text-primary">{t('register.title')}</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">{t('register.subtitle')}</p>
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {t('register.prototypeNotice')}
              </p>
            </div>
            <nav className="relative space-y-gutter">
              <div className="absolute bottom-0 left-4 top-0 -z-10 w-px bg-outline-variant" />
              {[['register.step1', 'register.step1Text'], ['register.step2', 'register.step2Text'], ['register.step3', 'register.step3Text']].map(([stepKey, textKey], index) => (
                <div key={stepKey} className="flex items-center gap-md">
                  <div className={`z-10 flex h-8 w-8 items-center justify-center rounded-full text-label-md font-label-md ${index === 0 ? 'bg-primary text-white' : index === 1 ? 'border-2 border-primary bg-surface-container text-primary' : 'border-2 border-outline-variant bg-surface-container text-on-surface-variant'}`}>{index + 1}</div>
                  <div className="flex flex-col">
                    <span className={`text-label-md font-label-md ${index < 2 ? 'text-primary' : 'text-on-surface-variant opacity-60'}`}>{t(stepKey)}</span>
                    <span className="text-caption font-caption text-on-surface-variant">{t(textKey)}</span>
                  </div>
                </div>
              ))}
            </nav>
            <div className="hidden pt-lg md:block">
              <img className="h-48 w-full rounded-xl border border-outline-variant object-cover shadow-sm" src={images.campus} alt="University Campus" />
            </div>
          </aside>
          <section className="rounded-lg border border-outline-variant bg-white p-lg shadow-sm md:col-span-7 lg:col-span-8">
            <form className="space-y-lg">
              <div className="space-y-sm">
                <h2 className="font-h2 text-h2 text-primary">{t('register.formTitle')}</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">{t('register.formText')}</p>
              </div>
              <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
                <Field className="md:col-span-2" label={t('register.institution')} placeholder="e.g. Stanford University" />
                <Field label={t('register.fullName')} placeholder="Dr. Sarah Jenkins" />
                <label className="space-y-base">
                  <span className="block text-label-md font-label-md text-primary">{t('register.titleLabel')}</span>
                  <select className="w-full border border-outline-variant bg-white px-md py-sm font-body-md text-body-md outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary">
                    <option>Assistant Professor</option><option>Associate Professor</option><option>Department Head</option><option>Administrator</option>
                  </select>
                </label>
                <div className="space-y-base md:col-span-2">
                  <label className="block text-label-md font-label-md text-primary">{t('register.subjects')}</label>
                  <div className="relative">
                    <Icon className="absolute left-md top-1/2 -translate-y-1/2 text-outline">search</Icon>
                    <input className="w-full border border-outline-variant py-sm pl-xl pr-md font-body-md text-body-md outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Search subjects (e.g., Computer Science, Linguistics)" type="text" />
                  </div>
                  <div className="mt-sm flex flex-wrap gap-xs">
                    {selectedTags.map((tag) => (
                      <span key={tag} className="flex items-center gap-xs bg-surface-container px-sm py-xs text-caption font-label-md text-primary">
                        {tag}
                        <button aria-label={`Remove ${tag}`} onClick={() => setSelectedTags((tags) => tags.filter((item) => item !== tag))} type="button">
                          <Icon className="text-[14px]">close</Icon>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-md md:col-span-2">
                  <label className="block text-label-md font-label-md text-primary">{t('register.interests')}</label>
                  <div className="grid grid-cols-2 gap-sm lg:grid-cols-3">
                    {interests.map((interest) => (
                      <button
                        key={interest}
                        aria-pressed={selectedInterests.includes(interest)}
                        className={`flex flex-col items-start gap-sm border p-md text-left transition-all ${selectedInterests.includes(interest) ? 'border-primary bg-surface-container-low ring-1 ring-primary' : 'border-outline-variant bg-surface-container-lowest hover:border-primary'}`}
                        onClick={() => setSelectedInterests((items) => items.includes(interest) ? items.filter((item) => item !== interest) : [...items, interest])}
                        type="button"
                      >
                        <Icon filled={selectedInterests.includes(interest)} className="text-primary">{interest === 'Research Ethics' ? 'biotech' : 'psychology'}</Icon>
                        <span className="text-label-md font-label-md">{interest}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-lg flex items-center justify-between border-t border-outline-variant pt-lg">
                <Link to="/" className="flex items-center gap-xs text-label-md font-label-md text-primary hover:underline"><Icon>arrow_back</Icon>{t('register.back')}</Link>
                <div className="flex items-center gap-md">
                  <div className="hidden h-2 w-32 overflow-hidden rounded-full bg-surface-container sm:block"><div className="h-full w-[66%] bg-secondary" /></div>
                  <Link to="/demo/dashboard/attender" className="bg-primary px-lg py-sm text-label-md font-label-md text-white shadow-sm transition-colors hover:bg-primary-container">{t('register.next')}</Link>
                </div>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}

function Field({ label, placeholder, className = '' }) {
  return (
    <label className={`space-y-base ${className}`}>
      <span className="block text-label-md font-label-md text-primary">{label}</span>
      <input className="w-full border border-outline-variant px-md py-sm font-body-md text-body-md outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" placeholder={placeholder} type="text" />
    </label>
  )
}
