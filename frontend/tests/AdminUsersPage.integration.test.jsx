import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAppAuth } from '../src/auth/AuthContext'
import { useI18n } from '../src/i18n/I18nContext'
import { createTeacherInvitation } from '../src/lib/api'
import AdminUsersPage from '../src/pages/AdminUsersPage'

vi.mock('../src/auth/AuthContext', () => ({
  useAppAuth: vi.fn(),
}))

vi.mock('../src/i18n/I18nContext', () => ({
  useI18n: vi.fn(),
}))

vi.mock('../src/lib/api', () => ({
  createTeacherInvitation: vi.fn(),
}))

vi.mock('../src/components/AdminShell', () => ({
  default: ({ children }) => <div>{children}</div>,
}))

vi.mock('../src/components/Icon', () => ({
  default: ({ children }) => <span>{children}</span>,
}))

const translations = {
  'admin.activate': 'Activate',
  'admin.active': 'Active',
  'admin.deactivate': 'Deactivate',
  'admin.exportCsv': 'Export CSV',
  'admin.inactive': 'Inactive',
  'admin.roleAdmin': 'Administrator',
  'admin.roleAttender': 'Attender',
  'admin.roleAttenderPlural': 'Attenders',
  'admin.roleTeacher': 'Teacher',
  'admin.roleTeacherPlural': 'Teachers',
  'admin.suspended': 'Suspended',
  'admin.users.activityReport': 'Activity report',
  'admin.users.allRoles': 'All roles',
  'admin.users.allStatuses': 'All statuses',
  'admin.users.inviteCreated': 'Invitation prepared for',
  'admin.users.inviteEmail': 'Teacher email',
  'admin.users.inviteEmailPlaceholder': 'teacher@example.com',
  'admin.users.inviteError': 'Invitation could not be created.',
  'admin.users.inviteExisting': 'Invitation already exists for',
  'admin.users.inviteTeacher': 'Invite teacher',
  'admin.users.inviteTeacherText': 'Send an invitation by email.',
  'admin.users.inviting': 'Inviting...',
  'admin.users.monthGrowth': '+12% this month',
  'admin.users.name': 'Name',
  'admin.users.registeredAt': 'Registered at',
  'admin.users.role': 'Role',
  'admin.users.rolesPermissions': 'Roles and permissions',
  'admin.users.sendInvite': 'Send invite',
  'admin.users.showing': 'Showing users',
  'admin.users.subtitle': 'Manage users.',
  'admin.users.title': 'User management',
  'admin.users.totalUsers': 'Total users',
  'common.actions': 'Actions',
  'common.demoUnavailable': 'Unavailable in demo',
  'common.edit': 'Edit',
  'common.status': 'Status',
}

function t(key) {
  return translations[key] ?? key
}

function renderAdminUsersPage() {
  useI18n.mockReturnValue({ locale: 'ro', setLocale: vi.fn(), t })
  useAppAuth.mockReturnValue({
    getToken: vi.fn(async () => 'admin-token'),
  })

  return render(<AdminUsersPage />)
}

describe('AdminUsersPage teacher invitation integration', () => {
  beforeEach(() => {
    createTeacherInvitation.mockResolvedValue({
      status: 'created',
      invitation: {
        email: 'new.teacher@example.com',
      },
    })
  })

  it('submits a teacher invitation, clears the input, and shows created success text', async () => {
    renderAdminUsersPage()

    await userEvent.type(screen.getByLabelText('Teacher email'), ' new.teacher@example.com ')
    await userEvent.click(screen.getByRole('button', { name: /Send invite/ }))

    await waitFor(() => {
      expect(createTeacherInvitation).toHaveBeenCalledWith('admin-token', 'new.teacher@example.com')
    })

    expect(screen.getByLabelText('Teacher email')).toHaveValue('')
    expect(screen.getByText('Invitation prepared for new.teacher@example.com')).toBeInTheDocument()
  })

  it('shows distinct success text when the invitation already exists', async () => {
    createTeacherInvitation.mockResolvedValue({
      status: 'existing',
      invitation: {
        email: 'existing.teacher@example.com',
      },
    })

    renderAdminUsersPage()

    await userEvent.type(screen.getByLabelText('Teacher email'), 'existing.teacher@example.com')
    await userEvent.click(screen.getByRole('button', { name: /Send invite/ }))

    await waitFor(() => {
      expect(screen.getByText('Invitation already exists for existing.teacher@example.com')).toBeInTheDocument()
    })
  })

  it('renders backend validation errors returned by the invitation API', async () => {
    const error = new Error('Validation failed')
    error.payload = {
      errors: {
        email: ['Email is invalid.'],
      },
    }
    createTeacherInvitation.mockRejectedValue(error)

    renderAdminUsersPage()

    await userEvent.type(screen.getByLabelText('Teacher email'), 'invalid.teacher@example.com')
    await userEvent.click(screen.getByRole('button', { name: /Send invite/ }))

    await waitFor(() => {
      expect(screen.getByText('Email is invalid.')).toBeInTheDocument()
    })
  })
})
