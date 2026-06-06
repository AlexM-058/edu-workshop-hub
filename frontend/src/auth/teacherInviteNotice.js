export function shouldShowTeacherInviteNotice(payload) {
  return Boolean(
    payload?.notifications?.teacher_invitation_accepted === true
    && payload?.user?.role === 'teacher',
  )
}
