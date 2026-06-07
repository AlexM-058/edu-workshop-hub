import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getAttendanceCheckInMessage,
  submitAttendanceCheckIn,
} from './attendanceCheckIn.js';

const translations = {
  'attendance.checkIn.alreadyConfirmed': 'Prezența era deja confirmată.',
  'attendance.checkIn.confirmed': 'Prezența a fost confirmată.',
  'attendance.checkIn.expired': 'Codul QR a expirat. Cere un cod nou.',
  'attendance.checkIn.forbidden': 'Nu poți confirma prezența pentru acest workshop.',
  'attendance.checkIn.genericError': 'Check-in-ul nu a putut fi finalizat.',
  'attendance.checkIn.missingToken': 'Codul QR lipsește.',
};

function t(key) {
  return translations[key] ?? key;
}

describe('attendance check-in helper', () => {
  it('maps confirmed and already confirmed responses to visible success messages', () => {
    assert.equal(
      getAttendanceCheckInMessage({ status: 'confirmed' }, t),
      translations['attendance.checkIn.confirmed'],
    );
    assert.equal(
      getAttendanceCheckInMessage({ status: 'already_confirmed' }, t),
      translations['attendance.checkIn.alreadyConfirmed'],
    );
  });

  it('maps expired and forbidden failures to visible inline messages', async () => {
    const expired = await submitAttendanceCheckIn({
      token: 'expired',
      getToken: async () => 'attender-token',
      checkIn: async () => {
        const error = new Error('Expired');
        error.status = 422;
        throw error;
      },
      t,
    });

    const forbidden = await submitAttendanceCheckIn({
      token: 'forbidden',
      getToken: async () => 'attender-token',
      checkIn: async () => {
        const error = new Error('Forbidden');
        error.status = 403;
        throw error;
      },
      t,
    });

    assert.deepEqual(expired, {
      kind: 'error',
      message: translations['attendance.checkIn.expired'],
    });
    assert.deepEqual(forbidden, {
      kind: 'error',
      message: translations['attendance.checkIn.forbidden'],
    });
  });

  it('submits auth token and QR token then returns a success state', async () => {
    const calls = [];

    const result = await submitAttendanceCheckIn({
      token: 'qr-token',
      getToken: async () => 'attender-token',
      checkIn: async ({ token, qrToken }) => {
        calls.push([token, qrToken]);

        return { status: 'confirmed' };
      },
      t,
    });

    assert.deepEqual(calls, [['attender-token', 'qr-token']]);
    assert.deepEqual(result, {
      kind: 'success',
      message: translations['attendance.checkIn.confirmed'],
    });
  });

  it('returns a visible missing token state before calling the API', async () => {
    const result = await submitAttendanceCheckIn({
      token: '',
      getToken: async () => {
        throw new Error('should not be called');
      },
      checkIn: async () => {
        throw new Error('should not be called');
      },
      t,
    });

    assert.deepEqual(result, {
      kind: 'error',
      message: translations['attendance.checkIn.missingToken'],
    });
  });
});
