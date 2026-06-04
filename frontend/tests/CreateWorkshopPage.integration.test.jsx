import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAppAuth } from '../src/auth/AuthContext'
import { useI18n } from '../src/i18n/I18nContext'
import { createTeacherWorkshop } from '../src/lib/api'
import CreateWorkshopPage from '../src/pages/CreateWorkshopPage'

vi.mock('../src/auth/AuthContext', () => ({
  useAppAuth: vi.fn(),
}))

vi.mock('../src/i18n/I18nContext', () => ({
  useI18n: vi.fn(),
}))

vi.mock('../src/lib/api', () => ({
  createTeacherWorkshop: vi.fn(),
}))

vi.mock('../src/components/DashboardShell', () => ({
  default: ({ children }) => <div>{children}</div>,
}))

vi.mock('../src/components/Icon', () => ({
  default: ({ children }) => <span>{children}</span>,
}))

const translations = {
  'common.publish': 'Publish workshop',
  'common.saveDraft': 'Save draft',
  'create.bio': 'Coordinator bio',
  'create.bioPlaceholder': 'Short bio',
  'create.category': 'Category',
  'create.continuePreview': 'Continue to preview',
  'create.coordinator': 'Coordinator',
  'create.cost': 'Cost',
  'create.cover': 'Cover',
  'create.coverHelp': 'Recommended image size',
  'create.description': 'Description',
  'create.descriptionPlaceholder': 'Describe the workshop',
  'create.duration': 'Duration',
  'create.durationPlaceholder': '12 hours',
  'create.errorGeneric': 'Workshop could not be saved.',
  'create.expertTip': 'Expert tip',
  'create.expertTipText': 'Clear titles work best.',
  'create.fullName': 'Coordinator name',
  'create.fullNamePlaceholder': 'Name',
  'create.links': 'Links',
  'create.location': 'Location',
  'create.locationPlaceholder': 'Online',
  'create.participants': 'Participants',
  'create.participantsPlaceholder': '25',
  'create.period': 'Period',
  'create.profileImage': 'Profile image',
  'create.publish': 'Publish',
  'create.publishing': 'Publishing...',
  'create.saving': 'Saving...',
  'create.subtitle': 'Create subtitle',
  'create.successDraft': 'Draft saved:',
  'create.successPublished': 'Workshop published:',
  'create.title': 'Create workshop',
  'create.titleLabel': 'Workshop title',
  'create.titlePlaceholder': 'Workshop title',
}

function t(key) {
  return translations[key] ?? key
}

function renderCreateWorkshopPage() {
  useI18n.mockReturnValue({ locale: 'ro', setLocale: vi.fn(), t })
  useAppAuth.mockReturnValue({
    getToken: vi.fn(async () => 'teacher-token'),
  })

  return render(<CreateWorkshopPage />)
}

async function fillRequiredWorkshopFields() {
  await userEvent.type(screen.getByLabelText('Workshop title'), ' Applied Digital Pedagogy ')
  await userEvent.type(screen.getByLabelText('Description'), ' Classroom methods with practical data exercises. ')
}

describe('CreateWorkshopPage integration', () => {
  beforeEach(() => {
    createTeacherWorkshop.mockImplementation(async (_token, payload) => ({
      workshop: {
        id: 7,
        title: payload.title,
        status: payload.status,
      },
    }))
  })

  it('submits a draft workshop and renders the returned success state', async () => {
    renderCreateWorkshopPage()

    await fillRequiredWorkshopFields()
    await userEvent.type(screen.getByLabelText('Coordinator name'), ' Tina Teacher ')
    await userEvent.type(screen.getByLabelText('Coordinator bio'), ' Teacher educator. ')
    await userEvent.type(screen.getByLabelText('Duration'), ' 12 hours ')
    await userEvent.type(screen.getByLabelText('Participants'), '24')
    await userEvent.type(screen.getByPlaceholderText('Online'), ' Online ')
    await userEvent.click(screen.getByRole('button', { name: /Save draft/ }))

    await waitFor(() => {
      expect(createTeacherWorkshop).toHaveBeenCalledWith('teacher-token', expect.objectContaining({
        title: 'Applied Digital Pedagogy',
        description: 'Classroom methods with practical data exercises.',
        coordinator_name: 'Tina Teacher',
        coordinator_bio: 'Teacher educator.',
        duration: '12 hours',
        capacity: 24,
        location: 'Online',
        status: 'draft',
      }))
    })

    expect(screen.getByText('Draft saved: Applied Digital Pedagogy')).toBeInTheDocument()
  })

  it('submits a published workshop from the publish action', async () => {
    renderCreateWorkshopPage()

    await fillRequiredWorkshopFields()
    await userEvent.click(screen.getByRole('button', { name: /Publish workshop/ }))

    await waitFor(() => {
      expect(createTeacherWorkshop).toHaveBeenCalled()
    })

    expect(createTeacherWorkshop.mock.calls[0][1].status).toBe('published')
    expect(screen.getByText('Workshop published: Applied Digital Pedagogy')).toBeInTheDocument()
  })

  it('renders the first backend validation error after submit failure', async () => {
    const error = new Error('Validation failed')
    error.payload = {
      errors: {
        title: ['Title is required.'],
      },
    }
    createTeacherWorkshop.mockRejectedValue(error)

    renderCreateWorkshopPage()

    await userEvent.click(screen.getByRole('button', { name: /Publish workshop/ }))

    await waitFor(() => {
      expect(screen.getByText('Title is required.')).toBeInTheDocument()
    })
  })
})
