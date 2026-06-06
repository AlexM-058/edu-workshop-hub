import { Link } from 'react-router-dom'
import AdminShell from '../components/AdminShell'
import Icon from '../components/Icon'
import { useI18n } from '../i18n/I18nContext'
import { useWorkshops } from '../lib/workshops'

export default function AdminWorkshopsPage() {
  const { locale } = useI18n()
  const { workshops, meta, isLoading, error } = useWorkshops({ page: 1, perPage: 20 })

  return (
    <AdminShell searchKey="nav.searchWorkshops">
      <main className="mx-auto max-w-[1200px] p-8">
        <header className="mb-lg flex flex-col justify-between gap-4 border-b border-slate-200 pb-md md:flex-row md:items-end">
          <div>
            <h1 className="font-h1 text-h1 text-primary">{locale === 'de' ? 'Workshop-Verwaltung' : 'Administrare workshop-uri'}</h1>
            <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
              {locale === 'de'
                ? 'Aktueller veröffentlichter Katalog aus der öffentlichen Workshop-API.'
                : 'Catalogul publicat curent, citit din API-ul public de workshop-uri.'}
            </p>
          </div>
          <Link className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-label-md text-white" to="/demo/dashboard/teacher/workshops/new">
            <Icon>add</Icon>
            {locale === 'de' ? 'Workshop erstellen' : 'Creează workshop'}
          </Link>
        </header>

        <div className="mb-md rounded-lg border border-slate-200 bg-surface-container-low p-md text-sm text-on-surface-variant">
          {isLoading
            ? (locale === 'de' ? 'Lädt...' : 'Se încarcă...')
            : `${meta?.total ?? 0} ${locale === 'de' ? 'veröffentlichte Workshops' : 'workshop-uri publicate'}`}
        </div>

        {error ? (
          <div className="mb-md rounded-lg border border-error/30 bg-error-container px-6 py-4 text-on-error-container">
            {locale === 'de' ? 'Workshops konnten nicht geladen werden.' : 'Workshop-urile nu au putut fi încărcate.'}
          </div>
        ) : null}

        {isLoading ? (
          <LoadingTable />
        ) : workshops?.length === 0 ? (
          <section className="rounded-lg border border-dashed border-slate-300 bg-white py-20 text-center text-on-surface-variant">
            <Icon className="mb-3 text-5xl text-slate-300">school</Icon>
            <p>{locale === 'de' ? 'Keine veröffentlichten Workshops.' : 'Nu există workshop-uri publicate.'}</p>
          </section>
        ) : (
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left">
              <thead className="bg-surface-container">
                <tr>
                  <th className="px-md py-4 font-label-md text-primary">Workshop</th>
                  <th className="px-md py-4 font-label-md text-primary">{locale === 'de' ? 'Kapazität' : 'Capacitate'}</th>
                  <th className="px-md py-4 font-label-md text-primary">{locale === 'de' ? 'Datum' : 'Dată'}</th>
                  <th className="px-md py-4 text-right font-label-md text-primary">{locale === 'de' ? 'Aktion' : 'Acțiune'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workshops.map((workshop) => (
                  <WorkshopRow key={workshop.id} locale={locale} workshop={workshop} />
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </AdminShell>
  )
}

function WorkshopRow({ workshop, locale }) {
  const title = workshop.title?.[locale] ?? workshop.title?.ro ?? '-'
  const date = new Date(workshop.scheduled_at).toLocaleDateString(locale === 'de' ? 'de-DE' : 'ro-RO', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <tr className="hover:bg-surface-container-low">
      <td className="px-md py-4">
        <p className="font-label-md text-primary">{title}</p>
        <p className="mt-1 text-caption text-on-surface-variant">{workshop.location}</p>
      </td>
      <td className="px-md py-4 text-on-surface-variant">
        {workshop.occupied_slots}/{workshop.max_slots}
      </td>
      <td className="px-md py-4 text-on-surface-variant">{date}</td>
      <td className="px-md py-4 text-right">
        <Link className="font-label-md text-primary hover:underline" to={`/workshops/${workshop.id}`}>
          {locale === 'de' ? 'Ansehen' : 'Vezi'}
        </Link>
      </td>
    </tr>
  )
}

function LoadingTable() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex animate-pulse gap-4 rounded-lg border border-slate-200 bg-white p-md">
          <div className="h-10 w-10 rounded bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 rounded bg-slate-100" />
            <div className="h-3 w-1/4 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}
