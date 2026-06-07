import { useState, useEffect } from 'react'
import AdminShell from '../components/AdminShell'
import Icon from '../components/Icon'
import { useI18n } from '../i18n/I18nContext'
import { useAppAuth } from '../auth/AuthContext'
import { fetchAdminCategories, createCategory, deleteCategory } from '../lib/api'

const translations = [
  ['nav_workshops', 'admin.settings.groupInterface', 'Ateliere și Cursuri', 'Workshops und Kurse'],
  ['cta_enroll_now', 'admin.settings.groupActions', 'Înscrie-te acum', 'Jetzt anmelden'],
  ['err_invalid_login', 'admin.settings.groupErrors', 'Date de autentificare incorecte', 'Ungültige Login-Daten'],
  ['success_msg_sent', 'admin.settings.groupConfirmations', 'Mesajul a fost trimis cu succes', 'Nachricht erfolgreich versendet'],
]

export default function AdminSettingsPage() {
  const { t, locale } = useI18n()
  const { getToken } = useAppAuth()
  
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('school')
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadCategories = async () => {
    try {
      const data = await fetchAdminCategories({ token: await getToken() })
      setCategories(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    setIsSubmitting(true)
    try {
      await createCategory({ token: await getToken(), name: newCatName, icon: newCatIcon })
      setNewCatName('')
      setNewCatIcon('school')
      setIsAdding(false)
      loadCategories()
    } catch (err) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCategory = async (cat) => {
    const msg = locale === 'de' 
      ? `Achtung: Das Löschen der Kategorie "${cat.name}" löscht auch dauerhaft alle ${cat.workshops_count} zugehörigen Workshops. Fortfahren?`
      : `Atenție: Ștergerea categoriei "${cat.name}" va șterge ireversibil toate cele ${cat.workshops_count} cursuri asociate. Continuați?`
    if (!window.confirm(msg)) return
    try {
      await deleteCategory({ token: await getToken(), categoryId: cat.id })
      loadCategories()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <AdminShell searchKey="admin.searchSettings">
      <div className="mx-auto max-w-[1200px] p-8">
        <header className="mb-lg">
          <h1 className="mb-base font-h1 text-h1 text-primary">{t('admin.settings.title')}</h1>
          <p className="font-body-lg text-slate-600">{t('admin.settings.subtitle')}</p>
        </header>
        <div className="grid grid-cols-12 gap-gutter">
          <section className="col-span-12 space-y-md lg:col-span-7">
            <div className="rounded-lg border border-outline-variant bg-white p-md shadow-sm">
              <div className="mb-md flex items-center justify-between border-b border-slate-100 pb-sm">
                <div>
                  <h2 className="font-h3 text-h3 text-primary">{t('admin.settings.categories')}</h2>
                  <p className="font-caption text-slate-500">{t('admin.settings.categoriesText')}</p>
                </div>
                <button 
                  className="flex items-center gap-2 rounded border border-secondary px-4 py-2 font-label-md text-secondary hover:bg-secondary/10 transition-colors" 
                  onClick={() => setIsAdding(!isAdding)}
                  type="button"
                >
                  <Icon>{isAdding ? 'close' : 'add'}</Icon>{isAdding ? t('admin.cancel') : t('admin.settings.newCategory')}
                </button>
              </div>

              {isAdding && (
                <form onSubmit={handleAddCategory} className="mb-md rounded bg-surface-container-low p-md border border-outline-variant">
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="Icon (ex: school)" 
                      value={newCatIcon} 
                      onChange={(e) => setNewCatIcon(e.target.value)} 
                      className="w-32 rounded border border-outline-variant px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input 
                      type="text" 
                      placeholder="Category Name" 
                      value={newCatName} 
                      onChange={(e) => setNewCatName(e.target.value)} 
                      className="flex-1 rounded border border-outline-variant px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="rounded bg-primary px-4 py-2 font-label-md text-white shadow-sm hover:brightness-110 disabled:opacity-50"
                    >
                      {t('admin.saveChanges')}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-sm">
                {isLoading ? (
                  <p className="text-center p-4 text-slate-500">Loading...</p>
                ) : categories.length === 0 ? (
                  <p className="text-center p-4 text-slate-500">No categories found.</p>
                ) : (
                  categories.map((cat, index) => (
                    <div key={cat.id} className={`flex items-center justify-between border border-outline-variant p-md transition-all hover:border-primary ${index === 0 ? 'bg-surface-container-low' : 'bg-white'}`}>
                      <div className="flex items-center gap-md">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-primary-fixed text-primary"><Icon>{cat.icon || 'folder'}</Icon></div>
                        <div>
                          <h3 className="font-label-md text-blue-900">{cat.name}</h3>
                          <p className="font-caption text-slate-500">{cat.workshops_count} {t('admin.settings.activeWorkshops')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-base">
                        <button className="p-2 text-slate-400 transition-colors hover:text-error" aria-label={t('admin.delete')} title={t('admin.delete')} onClick={() => handleDeleteCategory(cat)} type="button"><Icon>delete</Icon></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-gutter">
              <MetricPanel icon="language" title={t('admin.settings.activeLanguages')} value="2" suffix={t('admin.settings.languagesSuffix')} variant="primary" />
              <MetricPanel icon="verified" title={t('admin.settings.translations')} value="98%" suffix={t('admin.settings.completed')} variant="secondary" />
            </div>
          </section>
          <section className="col-span-12 lg:col-span-5">
            <div className="flex h-full flex-col rounded-lg border border-outline-variant bg-white shadow-sm">
              <div className="flex flex-col gap-sm border-b border-slate-100 bg-surface-container-low p-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-h3 text-h3 text-primary">{t('admin.settings.localization')}</h2>
                    <p className="font-caption text-slate-500">{t('admin.settings.localizationText')}</p>
                  </div>
                  <div className="flex gap-xs rounded bg-slate-100 p-xs">
                    <span className="rounded bg-white px-3 py-1 text-xs font-bold text-primary shadow-sm">RO</span>
                    <span className="rounded px-3 py-1 text-xs font-medium text-slate-500">DE</span>
                  </div>
                </div>
                <div className="relative">
                  <Icon className="absolute left-3 top-2 text-sm text-slate-400">filter_list</Icon>
                  <input className="w-full rounded border border-outline-variant py-1.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder={t('admin.settings.filterTranslations')} type="text" />
                </div>
              </div>
              <div className="max-h-[600px] flex-1 overflow-y-auto">
                {translations.map(([code, groupKey, ro, de]) => (
                  <div key={code} className="border-b border-slate-50 p-md transition-colors hover:bg-slate-50">
                    <div className="mb-sm flex items-center justify-between">
                      <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold uppercase text-primary">{code}</code>
                      <span className="text-[10px] uppercase tracking-tighter text-slate-400">{t(groupKey)}</span>
                    </div>
                    <div className="space-y-sm">
                      <ReadonlyTranslation label="RO" value={ro} />
                      <ReadonlyTranslation label="DE" value={de} muted />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-base border-t border-slate-100 bg-slate-50 p-md">
                <button className="cursor-not-allowed rounded px-6 py-2 font-label-md text-slate-600 opacity-60 transition-all hover:bg-slate-200" disabled title={t('common.demoUnavailable')} type="button">{t('admin.cancel')}</button>
                <button className="cursor-not-allowed rounded bg-primary px-6 py-2 font-label-md text-white opacity-60 shadow-sm transition-all hover:brightness-110" disabled title={t('common.demoUnavailable')} type="button">{t('admin.saveChanges')}</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  )
}

function MetricPanel({ icon, title, value, suffix, variant }) {
  const bg = variant === 'secondary' ? 'bg-secondary' : 'bg-primary'
  return (
    <div className={`${bg} rounded-lg p-md text-white`}>
      <Icon className="mb-sm text-4xl">{icon}</Icon>
      <h4 className="mb-xs text-xs font-label-md uppercase tracking-widest opacity-80">{title}</h4>
      <div className="font-h3 text-h3">{value} <span className="text-body-md opacity-60">{suffix}</span></div>
    </div>
  )
}

function ReadonlyTranslation({ label, value, muted = false }) {
  return (
    <div className="grid grid-cols-12 items-center gap-2">
      <span className="col-span-1 text-[10px] font-bold text-slate-400">{label}</span>
      <input className={`col-span-11 rounded border border-slate-200 p-1.5 text-sm ${muted ? 'bg-slate-50 italic' : 'bg-white'}`} readOnly type="text" value={value} />
    </div>
  )
}
