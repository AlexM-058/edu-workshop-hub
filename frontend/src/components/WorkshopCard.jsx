import { Link } from 'react-router-dom'
import Icon from './Icon'

export function MarketingWorkshopCard({ workshop }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
      <div className="relative aspect-video overflow-hidden">
        <img className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src={workshop.image} alt="" />
        <div className={`absolute left-4 top-4 rounded-full px-3 py-1 text-caption font-label-md ${workshop.badge === 'Nou' ? 'bg-slate-100 text-primary' : 'bg-secondary text-white'}`}>
          {workshop.badge}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-center gap-2 text-on-secondary-container">
          <Icon className="text-sm">history_edu</Icon>
          <span className="text-caption font-label-md">{workshop.category}</span>
        </div>
        <h3 className="mb-3 font-h3 text-xl leading-snug text-primary">{workshop.title}</h3>
        <p className="mb-6 flex-1 text-sm text-on-surface-variant">{workshop.description}</p>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <Icon className="text-slate-400">schedule</Icon>
            <span className="text-caption text-slate-600">{workshop.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon filled className="text-yellow-500">star</Icon>
            <span className="text-label-md font-bold text-primary">{workshop.rating}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

export function CatalogWorkshopCard({ workshop }) {
  return (
    <article className="group flex flex-col border border-outline-variant bg-white transition-all duration-300 hover:shadow-xl">
      <div className="relative aspect-video overflow-hidden">
        <img className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src={workshop.image} alt="" />
        {workshop.open && <div className="absolute left-4 top-4 bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">Enrollment Open</div>}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-start justify-between">
          <span className="rounded bg-tertiary-fixed px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-on-tertiary-container">{workshop.category}</span>
          <span className="text-caption font-caption text-outline">{workshop.credits}</span>
        </div>
        <h3 className="mb-4 font-h3 text-h3 leading-tight text-primary transition-colors group-hover:text-surface-tint">{workshop.title}</h3>
        <div className="mb-6 space-y-2">
          <Info icon="person">{workshop.facilitator}</Info>
          <Info icon="calendar_today">{workshop.date}</Info>
          <Info icon={workshop.locationIcon}>{workshop.location}</Info>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-6">
          <div className="flex flex-col">
            <span className="font-h3 text-xl text-primary">{workshop.price}</span>
            {workshop.note && <span className="text-[10px] font-bold uppercase text-secondary">{workshop.note}</span>}
          </div>
          <Link to="/workshops/1" className="rounded-lg bg-primary px-6 py-2 font-label-md text-white transition-colors hover:bg-primary-container">
            Înscrie-te
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
