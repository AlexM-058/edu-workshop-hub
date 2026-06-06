import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { shouldShowTeacherInviteNotice } from './teacherInviteNotice.js'

describe('teacher invite notice', () => {
  it('shows when the teacher invitation notice is pending for a teacher', () => {
    assert.equal(shouldShowTeacherInviteNotice({
      user: { role: 'teacher' },
      notifications: { teacher_invitation_notice_pending: true },
    }), true)
  })

  it('keeps compatibility with the first accepted sync flag', () => {
    assert.equal(shouldShowTeacherInviteNotice({
      user: { role: 'teacher' },
      notifications: {
        teacher_invitation_accepted: true,
        teacher_invitation_notice_pending: false,
      },
    }), true)
  })

  it('does not show for admins or normal syncs', () => {
    assert.equal(shouldShowTeacherInviteNotice({
      user: { role: 'admin' },
      notifications: { teacher_invitation_notice_pending: true },
    }), false)

    assert.equal(shouldShowTeacherInviteNotice({
      user: { role: 'teacher' },
      notifications: {
        teacher_invitation_accepted: false,
        teacher_invitation_notice_pending: false,
      },
    }), false)
  })
})
