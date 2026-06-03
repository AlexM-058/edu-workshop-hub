import { describe, it, expect } from 'vitest';
import {
  getEnrollmentErrorMessage,
  getEnrollmentSuccessMessage,
  submitWorkshopEnrollment,
} from './workshopEnrollment.js';

const translations = {
  'detail.enrollErrorDuplicate': 'Ești deja înscris sau pe lista de așteptare pentru acest workshop.',
  'detail.enrollErrorForbidden': 'Doar utilizatorii cu rol attender se pot înscrie.',
  'detail.enrollErrorGeneric': 'Înscrierea nu a putut fi finalizată. Încearcă din nou.',
  'detail.enrollErrorUnpublished': 'Înscrierea este disponibilă doar pentru workshop-uri publicate.',
  'detail.enrollSuccess': 'Înscriere confirmată.',
  'detail.waitlistSuccess': 'Ai fost adăugat pe lista de așteptare. Poziția ta: 3.',
};

function t(key, params = {}) {
  const value = translations[key] ?? key;

  return value.replace('{position}', params.position);
}

describe('workshop enrollment helper', () => {
  it('submits enrollment with a token and returns enrolled success state', async () => {
    const calls = [];

    const result = await submitWorkshopEnrollment({
      workshopId: 7,
      getToken: async () => 'attender-token',
      enrollInWorkshop: async (token, workshopId) => {
        calls.push([token, workshopId]);

        return {
          enrollment: {
            status: 'enrolled',
            waitlist_position: null,
          },
        };
      },
      t,
    });

    expect(calls).toEqual([['attender-token', 7]]);
    expect(result).toEqual({
      errorMessage: '',
      successMessage: 'Înscriere confirmată.',
    });
  });

  it('returns waitlist position success state', () => {
    expect(getEnrollmentSuccessMessage({
      enrollment: {
        status: 'waiting',
        waitlist_position: 3,
      },
    }, t)).toBe('Ai fost adăugat pe lista de așteptare. Poziția ta: 3.');
  });

  it('maps duplicate, unpublished, and forbidden errors to inline text', () => {
    expect(getEnrollmentErrorMessage({ status: 409 }, t)).toBe(translations['detail.enrollErrorDuplicate']);
    expect(getEnrollmentErrorMessage({ status: 422 }, t)).toBe(translations['detail.enrollErrorUnpublished']);
    expect(getEnrollmentErrorMessage({ status: 403 }, t)).toBe(translations['detail.enrollErrorForbidden']);
  });

  it('uses a generic inline error for unknown failures', async () => {
    const result = await submitWorkshopEnrollment({
      workshopId: 7,
      getToken: async () => 'attender-token',
      enrollInWorkshop: async () => {
        throw new Error('Network failed');
      },
      t,
    });

    expect(result).toEqual({
      errorMessage: translations['detail.enrollErrorGeneric'],
      successMessage: '',
    });
  });
});
