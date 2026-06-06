import AdminShell from '../components/AdminShell'
import DashboardShell from '../components/DashboardShell'
import Icon from '../components/Icon'
import { useAppAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'

const resources = [
  ['menu_book', 'Pedagogie digitală', 'Ghiduri pentru clase hibride și activități interactive.', 'Digitale Pädagogik', 'Leitfäden für hybride Klassen und interaktive Aktivitäten.'],
  ['workspace_premium', 'Documente oficiale', 'Modele pentru certificate, prezență și raportare.', 'Offizielle Dokumente', 'Vorlagen für Zertifikate, Anwesenheit und Berichte.'],
  ['support_agent', 'Suport platformă', 'Întrebări frecvente despre conturi, roluri și workshop-uri.', 'Plattform-Support', 'Häufige Fragen zu Konten, Rollen und Workshops.'],
]

export default function ResourcesPage() {
  const { role } = useAppAuth()
  const { locale } = useI18n()
  const isAdmin = role === 'admin'
  const isTeacher = role === 'teacher' || role === 'referent'

  const content = (
    <main className="mx-auto max-w-[1100px] p-8">
      <header className="mb-lg border-b border-slate-200 pb-md">
        <h1 className="font-h1 text-h1 text-primary">{locale === 'de' ? 'Ressourcen' : 'Resurse'}</h1>
        <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
          {locale === 'de'
            ? 'Kuratiertes Arbeitsmaterial für Plattformnutzung, Workshop-Management und Teilnahme.'
            : 'Materiale curate pentru utilizarea platformei, administrarea workshop-urilor și participare.'}
        </p>
      </header>

      <section className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        {resources.map(([icon, titleRo, textRo, titleDe, textDe]) => (
          <article key={titleRo} className="rounded-lg border border-slate-200 bg-white p-lg">
            <span className="mb-md flex h-12 w-12 items-center justify-center rounded-lg bg-primary-fixed text-primary">
              <Icon>{icon}</Icon>
            </span>
            <h2 className="font-h3 text-h3 text-primary">{locale === 'de' ? titleDe : titleRo}</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{locale === 'de' ? textDe : textRo}</p>
            <button
              className="mt-md inline-flex cursor-not-allowed items-center gap-2 rounded border border-primary px-4 py-2 text-sm font-label-md text-primary opacity-60"
              disabled
              type="button"
            >
              <Icon>download</Icon>
              {locale === 'de' ? 'Bald verfügbar' : 'Disponibil curând'}
            </button>
          </article>
        ))}
      </section>
    </main>
  )

  if (isAdmin) return <AdminShell searchKey="nav.searchResources">{content}</AdminShell>
  return <DashboardShell mode={isTeacher ? 'teacher' : 'attender'}>{content}</DashboardShell>
}
