export function getTeacherInvitationSuccessMessage(status, email, t) {
  const key = status === 'existing'
    ? 'admin.users.inviteExisting'
    : 'admin.users.inviteCreated';

  return `${t(key)} ${email}`;
}

export function getTeacherInvitationFormControlState(isInviting) {
  return {
    inputDisabled: isInviting,
    submitDisabled: isInviting,
    buttonIcon: isInviting ? 'hourglass_top' : 'person_add',
    buttonLabelKey: isInviting ? 'admin.users.inviting' : 'admin.users.sendInvite',
  };
}

export async function submitTeacherInvitationForm({ email, getToken, createInvitation, t }) {
  try {
    const token = await getToken();
    const payload = await createInvitation(token, email.trim());
    const invitedEmail = payload.invitation.email;
    const inviteStatus = payload.status ?? 'created';

    return {
      inviteEmail: '',
      inviteError: '',
      invitedEmail,
      inviteStatus,
      successMessage: getTeacherInvitationSuccessMessage(inviteStatus, invitedEmail, t),
    };
  } catch (error) {
    const validationError = error.payload?.errors?.email?.[0];

    return {
      inviteError: validationError ?? t('admin.users.inviteError'),
      invitedEmail: '',
      inviteStatus: '',
      successMessage: '',
    };
  }
}
