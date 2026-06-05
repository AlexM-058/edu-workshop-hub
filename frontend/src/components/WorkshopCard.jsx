import { Link } from 'react-router-dom'
import Icon from './Icon'
import { useI18n } from '../i18n/I18nContext'

// Fallback image when no image is available on the workshop
const FALLBACK_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1YkTfPXwDQvAZ88N1qugikfHVsM_2a2-f6RxZtcKeHblLxqwO0N7EvE1Pkjm62ReBXteb_oR18CWMCw-xGQ3ChX3zqVhtUqnDSmye36t9xstF9iifGVZt5uKDa3D6AiskpataCRNalj6e03gju9a1uj25q_Wn4JUOcTQR3WI3AYe3-HErkPnMhUnnldLG7vxVSYVzfARUcHpOoPjN8TKKa7uTpYgBkzlKUamM6K6jo4VMweYCXcGj-7t10uOH19V6xDa8BEnG3Ho'

/**
 * Large card for the landing page "featured workshops" section.
 * Accepts a workshop object from the API ({ id, title, description, ... }).
 */
export function MarketingWorkshopCard({ workshop }) {
  const { locale } = useI18n()
  const title       = workshop.title?.[locale] ?? workshop.title?.ro ?? ''
  const description = workshop.description?.[locale] ?? workshop.description?.ro ?? ''

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
      <div className="relative aspect-video overflow-hidden">
        <img
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={FALLBACK_IMAGE}
          alt=""
        />
        {workshop.is_open && (
          <div className="absolute left-4 top-4 rounded-full bg-secondary px-3 py-1 text-caption font-label-md text-white">
            Înscrieri deschise
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-center gap-2 text-on-secondary-container">
          <Icon className="text-sm">history_edu</Icon>
          <span className="text-caption font-label-md">{workshop.referent?.name ?? '—'}</span>
        </div>
        <h3 className="mb-3 font-h3 text-xl leading-snug text-primary">{title}</h3>
        <p className="mb-6 flex-1 text-sm text-on-surface-variant line-clamp-3">{description}</p>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <Icon className="text-slate-400">group</Icon>
            <span className="text-caption text-slate-600">
              {workshop.occupied_slots}/{workshop.max_slots}
            </span>
          </div>
          <Link
            to={`/workshops/${workshop.id}`}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-label-md text-white transition-colors hover:bg-primary-container"
          >
            Detalii
          </Link>
        </div>
      </div>
    </article>
  )
}

/**
 * Card for the public catalog grid.
 * Accepts a workshop object from the API.
 */
export function CatalogWorkshopCard({ workshop }) {
  const { locale } = useI18n()
  const title    = workshop.title?.[locale] ?? workshop.title?.ro ?? ''
  const dateStr  = workshop.scheduled_at
    ? new Date(workshop.scheduled_at).toLocaleDateString(locale === 'de' ? 'de-DE' : 'ro-RO', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—'

  return (
    <article className="group flex flex-col border border-outline-variant bg-white transition-all duration-300 hover:shadow-xl">
      <div className="relative aspect-video overflow-hidden">
        <img
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={FALLBACK_IMAGE}
          alt=""
        />
        {workshop.is_open && (
          <div className="absolute left-4 top-4 bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            {locale === 'de' ? 'Einschreibung offen' : 'Înscrieri deschise'}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-start justify-between">
          <span className="rounded bg-tertiary-fixed px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-on-tertiary-container">
            {locale === 'de' ? 'Workshop' : 'Workshop'}
          </span>
          <span className="text-caption font-caption text-outline">
            {workshop.available_slots} {locale === 'de' ? 'Plätze frei' : 'locuri libere'}
          </span>
        </div>
        <h3 className="mb-4 font-h3 text-h3 leading-tight text-primary transition-colors group-hover:text-surface-tint">
          {title}
        </h3>
        <div className="mb-6 space-y-2">
          <Info icon="person">{workshop.referent?.name ?? '—'}</Info>
          <Info icon="calendar_today">{dateStr}</Info>
          <Info icon="location_on">{workshop.location}</Info>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-6">
          <div className="flex flex-col">
            <span className="font-h3 text-xl text-primary">
              {workshop.occupied_slots}/{workshop.max_slots}
            </span>
            <span className="text-[10px] font-bold uppercase text-secondary">
              {locale === 'de' ? 'Teilnehmende' : 'Participanți'}
            </span>
          </div>
          <Link
            to={`/workshops/${workshop.id}`}
            className="rounded-lg bg-primary px-6 py-2 font-label-md text-white transition-colors hover:bg-primary-container"
          >
            {locale === 'de' ? 'Details' : 'Detalii'}
          </Link>
        </div>
      </div>
    </article>
  )
}

function Info({ icon, children }) {
  return (
    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
      <Icon className="text-base">{icon}</Icon>
      <span>{children}</span>
    </div>
  )
}
