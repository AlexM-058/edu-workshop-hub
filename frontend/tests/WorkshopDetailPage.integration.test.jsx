import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useAppAuth } from '../src/auth/AuthContext'
import { useI18n } from '../src/i18n/I18nContext'
import { enrollInWorkshop } from '../src/lib/api'
import WorkshopDetailPage from '../src/pages/WorkshopDetailPage'

vi.mock('../src/auth/AuthContext', () => ({
  useAppAuth: vi.fn(),
}))

vi.mock('../src/i18n/I18nContext', () => ({
  useI18n: vi.fn(),
}))

vi.mock('../src/lib/api', () => ({
  enrollInWorkshop: vi.fn(),
}))

vi.mock('../src/components/TopNav', () => ({
  default: () => <nav data-testid="top-nav" />,
}))

vi.mock('../src/components/Footer', () => ({
  default: () => <footer data-testid="footer" />,
}))

vi.mock('../src/components/Icon', () => ({
  default: ({ children }) => <span>{children}</span>,
}))

vi.mock('../src/data/stitchData', () => ({
  images: {
    conference: 'conference.jpg',
    profile: 'profile.jpg',
  },
}))

const translations = {
  'common.demoUnavailable': 'Unavailable in demo',
  'detail.curriculum': 'Curriculum',
  'detail.download': 'Download syllabus',
  'detail.enrollErrorForbidden': 'Only attenders can enroll.',
  'detail.enrollErrorGeneric': 'Enrollment failed.',
  'detail.enrollErrorSignIn': 'Sign in with an attender account.',
  'detail.enrollErrorUnpublished': 'Enrollment is only available for published workshops.',
  'detail.enrollErrorDuplicate': 'You are already enrolled or waitlisted.',
  'detail.enrolling': 'Enrolling...',
  'detail.enrollNow': 'Enroll now',
  'detail.enrollSuccess': 'Enrollment confirmed.',
  'detail.learn': 'What you will learn',
  'detail.overview': 'Overview',
  'detail.subtitle': 'Workshop subtitle',
  'detail.title': 'Workshop title',
  'detail.waitlistSuccess': 'Waitlist position: {position}.',
}

function t(key, params = {}) {
  const value = translations[key] ?? key

  return Object.entries(params).reduce(
    (message, [name, replacement]) => message.replaceAll(`{${name}}`, String(replacement)),
    value,
  )
}

function renderWorkshopDetail(authOverrides = {}) {
  useI18n.mockReturnValue({ locale: 'ro', setLocale: vi.fn(), t })
  useAppAuth.mockReturnValue({
    getToken: vi.fn(async () => 'attender-token'),
    isSignedIn: true,
    isSyncing: false,
    role: 'attender',
    ...authOverrides,
  })

  return render(
    <MemoryRouter initialEntries={['/workshops/7']}>
      <Routes>
        <Route path="/workshops/:id" element={<WorkshopDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('WorkshopDetailPage enrollment integration', () => {
  beforeEach(() => {
    enrollInWorkshop.mockResolvedValue({
      enrollment: {
        status: 'enrolled',
        waitlist_position: null,
      },
    })
  })

  it('shows a sign-in error and does not call the API when the user is signed out', async () => {
    renderWorkshopDetail({ isSignedIn: false, role: null })

    await userEvent.click(screen.getByRole('button', { name: 'Enroll now' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Sign in with an attender account.')
    expect(enrollInWorkshop).not.toHaveBeenCalled()
  })

  it('shows a forbidden error and does not call the API for non-attender roles', async () => {
    renderWorkshopDetail({ role: 'teacher' })

    await userEvent.click(screen.getByRole('button', { name: 'Enroll now' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Only attenders can enroll.')
    expect(enrollInWorkshop).not.toHaveBeenCalled()
  })

  it('submits enrollment with the route workshop id and shows success text', async () => {
    const getToken = vi.fn(async () => 'attender-token')

    renderWorkshopDetail({ getToken })

    await userEvent.click(screen.getByRole('button', { name: 'Enroll now' }))

    await waitFor(() => {
      expect(enrollInWorkshop).toHaveBeenCalledWith('attender-token', '7')
    })

    expect(getToken).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status')).toHaveTextContent('Enrollment confirmed.')
  })

  it('shows waitlist success text when the backend returns a waiting enrollment', async () => {
    enrollInWorkshop.mockResolvedValue({
      enrollment: {
        status: 'waiting',
        waitlist_position: 3,
      },
    })

    renderWorkshopDetail()

    await userEvent.click(screen.getByRole('button', { name: 'Enroll now' }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Waitlist position: 3.')
    })
  })

  it('maps API failures to visible enrollment error text', async () => {
    const error = new Error('Already enrolled')
    error.status = 409
    enrollInWorkshop.mockRejectedValue(error)

    renderWorkshopDetail()

    await userEvent.click(screen.getByRole('button', { name: 'Enroll now' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('You are already enrolled or waitlisted.')
    })
  })
})
