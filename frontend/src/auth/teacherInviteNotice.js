export function shouldShowTeacherInviteNotice(payload) {
  return Boolean(
    (
      payload?.notifications?.teacher_invitation_notice_pending === true
      || payload?.notifications?.teacher_invitation_accepted === true
    )
    && payload?.user?.role === 'teacher',
  )
}
