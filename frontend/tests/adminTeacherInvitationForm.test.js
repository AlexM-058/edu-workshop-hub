import { describe, it, expect } from 'vitest';
import {
  getTeacherInvitationFormControlState,
  getTeacherInvitationSuccessMessage,
  submitTeacherInvitationForm,
} from '../src/pages/adminTeacherInvitationForm.js';

const translations = {
  'admin.users.inviteCreated': 'Invitație pregătită pentru',
  'admin.users.inviteExisting': 'Invitația există deja pentru',
  'admin.users.inviteError': 'Invitația nu a putut fi creată.',
};

function t(key) {
  return translations[key] ?? key;
}

describe('admin teacher invitation form', () => {
  it('submits a trimmed email and returns visible created success state', async () => {
    const calls = [];

    const result = await submitTeacherInvitationForm({
      email: ' new.teacher@example.com ',
      getToken: async () => 'admin-token',
      createInvitation: async (token, email) => {
        calls.push([token, email]);

        return {
          status: 'created',
          invitation: { email },
        };
      },
      t,
    });

    expect(calls).toEqual([['admin-token', 'new.teacher@example.com']]);
    expect(result).toEqual({
      didInvite: true,
      inviteEmail: '',
      inviteError: '',
      invitedEmail: 'new.teacher@example.com',
      inviteStatus: 'created',
      successMessage: 'Invitație pregătită pentru new.teacher@example.com',
    });
  });

  it('returns a distinct visible success state for an existing invitation', async () => {
    const result = await submitTeacherInvitationForm({
      email: 'existing.teacher@example.com',
      getToken: async () => 'admin-token',
      createInvitation: async () => ({
        status: 'existing',
        invitation: { email: 'existing.teacher@example.com' },
      }),
      t,
    });

    expect(result.inviteStatus).toBe('existing');
    expect(result.successMessage).toBe('Invitația există deja pentru existing.teacher@example.com');
  });

  it('returns visible inline error state when the backend rejects the invite', async () => {
    const error = new Error('Request failed');
    error.payload = {
      errors: {
        email: ['Emailul este invalid.'],
      },
    };

    const result = await submitTeacherInvitationForm({
      email: 'not-an-email',
      getToken: async () => 'admin-token',
      createInvitation: async () => {
        throw error;
      },
      t,
    });

    expect(result).toEqual({
      didInvite: false,
      inviteError: 'Emailul este invalid.',
      invitedEmail: '',
      inviteStatus: '',
      successMessage: '',
    });
  });

  it('uses the generic inline error when the backend has no validation message', async () => {
    const result = await submitTeacherInvitationForm({
      email: 'teacher@example.com',
      getToken: async () => 'admin-token',
      createInvitation: async () => {
        throw new Error('Network failed');
      },
      t,
    });

    expect(result.inviteError).toBe('Invitația nu a putut fi creată.');
  });

  it('formats created and existing messages from stable invitation status', () => {
    expect(
      getTeacherInvitationSuccessMessage('created', 'teacher@example.com', t),
    ).toBe('Invitație pregătită pentru teacher@example.com');
    expect(
      getTeacherInvitationSuccessMessage('existing', 'teacher@example.com', t),
    ).toBe('Invitația există deja pentru teacher@example.com');
  });

  it('disables input and submit controls while an invitation is loading', () => {
    expect(getTeacherInvitationFormControlState(true)).toEqual({
      inputDisabled: true,
      submitDisabled: true,
      buttonIcon: 'hourglass_top',
      buttonLabelKey: 'admin.users.inviting',
    });

    expect(getTeacherInvitationFormControlState(false)).toEqual({
      inputDisabled: false,
      submitDisabled: false,
      buttonIcon: 'person_add',
      buttonLabelKey: 'admin.users.sendInvite',
    });
  });
});
