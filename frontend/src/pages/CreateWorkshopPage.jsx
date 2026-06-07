import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppAuth } from '../auth/AuthContext'
import DashboardShell from '../components/DashboardShell'
import Icon from '../components/Icon'
import { useI18n } from '../i18n/I18nContext'
import { createTeacherWorkshop, updateTeacherWorkshop, fetchCategories } from '../lib/api'
import { useWorkshop } from '../lib/workshops'
import { submitWorkshopForm } from './createWorkshopForm'

const initialForm = {
  title: '',
  category_id: '',
  description: '',
  coordinatorName: '',
  coordinatorBio: '',
  startsAt: '',
  endsAt: '',
  duration: '',
  capacity: '',
  location: '',
  cost: '',
}

export default function CreateWorkshopPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)
  
  const { t, locale } = useI18n()
  const { getToken } = useAppAuth()
  
  const { workshop: existingWorkshop, isLoading: isFetching } = useWorkshop(id)
  
  const [form, setForm] = useState(initialForm)
  const [categories, setCategories] = useState([])
  const [coverImage, setCoverImage] = useState(null)
  const [coverImagePreview, setCoverImagePreview] = useState(null)
  const [professorImage, setProfessorImage] = useState(null)
  const [professorImagePreview, setProfessorImagePreview] = useState(null)
  const [submittingStatus, setSubmittingStatus] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [createdWorkshop, setCreatedWorkshop] = useState(null)

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories()
        setCategories(data)
        if (data.length > 0 && !form.category_id) {
          setForm(prev => ({ ...prev, category_id: data[0].id }))
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      }
    }
    loadCategories()
  }, [])

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  useEffect(() => {
    if (isEditMode && existingWorkshop) {
      setForm({
        title: typeof existingWorkshop.title === 'object' ? existingWorkshop.title?.ro : (existingWorkshop.title || ''),
        category_id: existingWorkshop.category_id || '',
        description: typeof existingWorkshop.description === 'object' ? existingWorkshop.description?.ro : (existingWorkshop.description || ''),
        coordinatorName: existingWorkshop.coordinator_name || '',
        coordinatorBio: existingWorkshop.coordinator_bio || '',
        startsAt: existingWorkshop.scheduled_at ? existingWorkshop.scheduled_at.split('T')[0] : '',
        endsAt: existingWorkshop.ends_at ? existingWorkshop.ends_at.split('T')[0] : '',
        duration: existingWorkshop.duration || '',
        capacity: existingWorkshop.max_slots ? String(existingWorkshop.max_slots) : '',
        location: existingWorkshop.location || '',
        cost: existingWorkshop.cost ? String(existingWorkshop.cost) : '',
      })
      if (existingWorkshop.cover_image_base64) {
        setCoverImagePreview(existingWorkshop.cover_image_base64)
      }
      if (existingWorkshop.professor_image_base64) {
        setProfessorImagePreview(existingWorkshop.professor_image_base64)
      }
    }
  }, [isEditMode, existingWorkshop])

  async function handleSubmit(status) {
    setSubmittingStatus(status)
    setErrorMessage('')
    setCreatedWorkshop(null)

    const result = await submitWorkshopForm({
      form,
      coverImage,
      professorImage,
      status,
      getToken,
      apiCall: isEditMode ? updateTeacherWorkshop : createTeacherWorkshop,
      workshopId: id,
      t,
    })

    setErrorMessage(result.errorMessage)
    setCreatedWorkshop(result.workshop)
    setSubmittingStatus('')
    
    if (isEditMode && !result.errorMessage) {
      navigate('/demo/dashboard/teacher/workshops')
    }
  }

  const isSubmitting = submittingStatus !== ''

  return (
    <DashboardShell mode="teacher">
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1000px] px-margin py-lg">
          <header className="mb-xl">
            <h1 className="mb-base font-h1 text-h1 text-primary">
              {isEditMode ? (locale === 'de' ? 'Workshop bearbeiten' : 'Editează workshop') : t('create.title')}
            </h1>
            <p className="max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
              {isEditMode ? (locale === 'de' ? 'Aktualisieren Sie die Details des Workshops' : 'Actualizează detaliile acestui workshop') : t('create.subtitle')}
            </p>
          </header>

          <div className="grid grid-cols-12 gap-gutter">
            <section className="col-span-12 space-y-md lg:col-span-8">
              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
                <div className="space-y-lg">
                  <Field label={t('create.titleLabel')} onChange={(value) => updateField('title', value)} placeholder={t('create.titlePlaceholder')} value={form.title} />
                  <label className="space-y-xs block">
                    <span className="block font-label-md text-label-md uppercase text-primary">{t('create.category')}</span>
                    <select className="w-full rounded-lg border border-outline-variant bg-white p-4 font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" onChange={(event) => updateField('category_id', event.target.value)} value={form.category_id || ''}>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-xs block">
                    <span className="block font-label-md text-label-md uppercase text-primary">{t('create.description')}</span>
                    <textarea className="w-full resize-none rounded-lg border border-outline-variant bg-white p-4 font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" onChange={(event) => updateField('description', event.target.value)} placeholder={t('create.descriptionPlaceholder')} rows="6" value={form.description} />
                  </label>

                  <section className="border-t border-slate-100 pt-lg">
                    <h3 className="mb-md font-label-md text-label-md uppercase text-primary">{t('create.coordinator')}</h3>
                    <div className="grid grid-cols-1 gap-md md:grid-cols-[120px_1fr]">
                      <div>
                        <div className="relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-outline-variant bg-slate-100 transition-colors hover:bg-slate-200">
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setProfessorImage(file)
                                setProfessorImagePreview(URL.createObjectURL(file))
                              }
                            }}
                          />
                          {professorImagePreview ? (
                            <img src={professorImagePreview} alt="Professor preview" className="h-full w-full object-cover" />
                          ) : (
                            <Icon className="h-8 w-8 text-slate-400">upload</Icon>
                          )}
                        </div>
                        <p className="mt-xs text-center font-caption text-[10px] uppercase text-on-surface-variant">{t('create.profileImage')}</p>
                      </div>
                      <div className="space-y-md">
                        <Field label={t('create.fullName')} onChange={(value) => updateField('coordinatorName', value)} placeholder={t('create.fullNamePlaceholder')} value={form.coordinatorName} compact />
                        <label className="space-y-xs block">
                          <span className="block font-label-md text-label-md uppercase text-primary">{t('create.bio')}</span>
                          <textarea className="w-full resize-none rounded-lg border border-outline-variant p-3 font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" onChange={(event) => updateField('coordinatorBio', event.target.value)} placeholder={t('create.bioPlaceholder')} rows="3" value={form.coordinatorBio} />
                        </label>
                        <Field label={t('create.links')} placeholder="https://linkedin.com/in/..." compact icon="link" />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-lg border-t border-slate-100 pt-lg">
                    <label className="space-y-xs block">
                      <span className="block font-label-md text-label-md uppercase text-primary">{t('create.period')}</span>
                      <div className="flex items-center gap-2">
                        <input className="w-full rounded-lg border border-outline-variant p-3 font-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" onChange={(event) => updateField('startsAt', event.target.value)} type="date" value={form.startsAt} />
                        <span className="text-outline">-</span>
                        <input className="w-full rounded-lg border border-outline-variant p-3 font-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" onChange={(event) => updateField('endsAt', event.target.value)} type="date" value={form.endsAt} />
                      </div>
                    </label>
                    <Field label={t('create.duration')} onChange={(value) => updateField('duration', value)} placeholder={t('create.durationPlaceholder')} value={form.duration} compact />
                  </section>

                  <section className="border-t border-slate-100 pt-lg">
                    <div className="mb-md grid grid-cols-1 gap-md md:grid-cols-2">
                      <Field label={t('create.cost')} onChange={(value) => updateField('cost', value)} placeholder="0.00" value={form.cost} compact prefix="RON" />
                      <Field label={t('create.participants')} onChange={(value) => updateField('capacity', value)} placeholder={t('create.participantsPlaceholder')} type="number" value={form.capacity} compact />
                    </div>
                    <Field label={t('create.location')} onChange={(value) => updateField('location', value)} placeholder={t('create.locationPlaceholder')} value={form.location} compact icon="location_on" />
                  </section>
                </div>
              </div>
            </section>

            <aside className="col-span-12 space-y-md lg:col-span-4">
              <section className="rounded-xl border border-outline-variant bg-surface-container-low p-md">
                <label className="mb-base block font-label-md text-label-md uppercase text-primary">{t('create.cover')}</label>
                <div className="relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-outline bg-white transition-colors hover:bg-slate-50">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setCoverImage(file)
                        setCoverImagePreview(URL.createObjectURL(file))
                      }
                    }}
                  />
                  {coverImagePreview ? (
                    <img src={coverImagePreview} alt="Cover preview" className="h-full w-full object-cover" />
                  ) : (
                    <Icon className="h-10 w-10 text-outline">image</Icon>
                  )}
                </div>
                <p className="mt-sm font-caption text-caption text-on-surface-variant">{t('create.coverHelp')}</p>
              </section>
              <section className="rounded-xl border border-on-tertiary-fixed-variant/10 bg-tertiary-fixed p-md text-on-tertiary-fixed">
                <h4 className="mb-sm font-label-md text-label-md uppercase">{t('create.expertTip')}</h4>
                <p className="font-caption text-caption leading-relaxed">{t('create.expertTipText')}</p>
              </section>
            </aside>
          </div>

          <div className="mt-lg space-y-sm" aria-live="polite">
            {errorMessage ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-md py-sm font-body-md text-sm text-red-700">{errorMessage}</p>
            ) : null}
            {createdWorkshop ? (
              <p className="rounded-lg border border-green-200 bg-green-50 px-md py-sm font-body-md text-sm text-green-700">
                {t(createdWorkshop.is_active ? 'create.successPublished' : 'create.successDraft')} {createdWorkshop.title?.[locale] ?? createdWorkshop.title?.ro ?? ''}
              </p>
            ) : null}
          </div>

          <footer className="sticky bottom-0 z-40 mt-xl flex items-center justify-between border-t border-slate-200 bg-white/80 py-md backdrop-blur-sm">
            <button className="inline-flex items-center gap-base rounded-lg border border-primary px-lg py-3 font-bold text-primary transition-all disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} onClick={() => handleSubmit('draft')} type="button">
              <Icon>{submittingStatus === 'draft' ? 'hourglass_top' : 'save'}</Icon>
              {submittingStatus === 'draft' ? t('create.saving') : t('common.saveDraft')}
            </button>
            <button
              className="inline-flex items-center gap-base rounded-lg bg-primary px-xl py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              onClick={() => handleSubmit('published')}
              type="button"
            >
              {submittingStatus === 'published' ? t('common.loading') : isEditMode ? (locale === 'de' ? 'Änderungen speichern' : 'Salvează modificările') : t('common.publish')}
              <Icon>{submittingStatus === 'published' ? 'hourglass_top' : 'arrow_forward'}</Icon>
            </button>
          </footer>
        </div>
      </main>
    </DashboardShell>
  )
}

function Field({ label, placeholder, compact = false, icon, prefix, onChange, type = 'text', value }) {
  return (
    <label className="space-y-xs block">
      <span className="block font-label-md text-label-md uppercase text-primary">{label}</span>
      <div className="relative">
        {icon ? <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-outline">{icon}</Icon> : null}
        {prefix ? <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">{prefix}</span> : null}
        <input className={`w-full rounded-lg border border-outline-variant font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${compact ? 'p-3' : 'p-4'} ${icon ? 'pl-10' : ''} ${prefix ? 'pl-16' : ''}`} onChange={onChange ? (event) => onChange(event.target.value) : undefined} placeholder={placeholder} type={type} value={value} />
      </div>
    </label>
  )
}
