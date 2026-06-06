import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { shouldShowTeacherInviteNotice } from './teacherInviteNotice.js'

describe('teacher invite notice', () => {
  it('shows when the auth sync accepted a teacher invitation for a teacher', () => {
    assert.equal(shouldShowTeacherInviteNotice({
      user: { role: 'teacher' },
      notifications: { teacher_invitation_accepted: true },
    }), true)
  })

  it('does not show for admins or normal syncs', () => {
    assert.equal(shouldShowTeacherInviteNotice({
      user: { role: 'admin' },
      notifications: { teacher_invitation_accepted: true },
    }), false)

    assert.equal(shouldShowTeacherInviteNotice({
      user: { role: 'teacher' },
      notifications: { teacher_invitation_accepted: false },
    }), false)
  })
})
