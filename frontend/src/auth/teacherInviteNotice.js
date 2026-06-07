export function shouldShowTeacherInviteNotice(payload) {
  const role = payload?.user?.role
  return Boolean(
    (
      payload?.notifications?.teacher_invitation_notice_pending === true
      || payload?.notifications?.teacher_invitation_accepted === true
    )
    && (role === 'teacher' || role === 'referent'),
  )
}
