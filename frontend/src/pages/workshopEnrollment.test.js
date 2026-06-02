import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
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

    assert.deepEqual(calls, [['attender-token', 7]]);
    assert.deepEqual(result, {
      errorMessage: '',
      successMessage: 'Înscriere confirmată.',
    });
  });

  it('returns waitlist position success state', () => {
    assert.equal(getEnrollmentSuccessMessage({
      enrollment: {
        status: 'waiting',
        waitlist_position: 3,
      },
    }, t), 'Ai fost adăugat pe lista de așteptare. Poziția ta: 3.');
  });

  it('maps duplicate, unpublished, and forbidden errors to inline text', () => {
    assert.equal(getEnrollmentErrorMessage({ status: 409 }, t), translations['detail.enrollErrorDuplicate']);
    assert.equal(getEnrollmentErrorMessage({ status: 422 }, t), translations['detail.enrollErrorUnpublished']);
    assert.equal(getEnrollmentErrorMessage({ status: 403 }, t), translations['detail.enrollErrorForbidden']);
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

    assert.deepEqual(result, {
      errorMessage: translations['detail.enrollErrorGeneric'],
      successMessage: '',
    });
  });
});
