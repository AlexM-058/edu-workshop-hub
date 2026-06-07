import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getAttendanceQrPanelState,
  getMillisecondsUntilRefresh,
} from './attendanceQrPanel.js';

describe('attendance QR panel state', () => {
  it('shows loading while the teacher starts or refreshes the QR token', () => {
    assert.deepEqual(getAttendanceQrPanelState({
      isLoading: true,
      qrPayload: null,
      error: null,
      nowMs: Date.parse('2026-06-07T10:00:00.000Z'),
    }), {
      kind: 'loading',
      labelKey: 'attendance.qr.loading',
      canStart: false,
    });
  });

  it('shows active state while the session has time remaining', () => {
    assert.deepEqual(getAttendanceQrPanelState({
      isLoading: false,
      qrPayload: {
        check_in_url: 'http://localhost:5173/attendance/check-in?token=abc',
        expires_at: '2026-06-07T10:00:05.000Z',
        session_expires_at: '2026-06-07T10:05:00.000Z',
      },
      error: null,
      nowMs: Date.parse('2026-06-07T10:00:01.000Z'),
    }), {
      kind: 'active',
      labelKey: 'attendance.qr.active',
      canStart: false,
      secondsRemaining: 299,
    });
  });

  it('shows expired state after the five minute session expires', () => {
    assert.deepEqual(getAttendanceQrPanelState({
      isLoading: false,
      qrPayload: {
        check_in_url: 'http://localhost:5173/attendance/check-in?token=abc',
        expires_at: '2026-06-07T10:00:05.000Z',
        session_expires_at: '2026-06-07T10:05:00.000Z',
      },
      error: null,
      nowMs: Date.parse('2026-06-07T10:05:00.000Z'),
    }), {
      kind: 'expired',
      labelKey: 'attendance.qr.expired',
      canStart: true,
    });
  });

  it('keeps the panel expired after the session deadline passes', () => {
    assert.deepEqual(getAttendanceQrPanelState({
      isLoading: false,
      qrPayload: {
        check_in_url: 'http://localhost:5173/attendance/check-in?token=abc',
        expires_at: '2026-06-07T10:05:00.000Z',
        session_expires_at: '2026-06-07T10:05:00.000Z',
      },
      error: null,
      nowMs: Date.parse('2026-06-07T10:05:01.000Z'),
    }), {
      kind: 'expired',
      labelKey: 'attendance.qr.expired',
      canStart: true,
    });
  });

  it('shows error state when token generation fails', () => {
    assert.deepEqual(getAttendanceQrPanelState({
      isLoading: false,
      qrPayload: null,
      error: new Error('Network failed'),
      nowMs: Date.parse('2026-06-07T10:00:00.000Z'),
    }), {
      kind: 'error',
      labelKey: 'attendance.qr.error',
      canStart: true,
    });
  });

  it('calculates refresh delay from the current token expiry', () => {
    assert.equal(getMillisecondsUntilRefresh({
      expiresAt: '2026-06-07T10:00:05.000Z',
      sessionExpiresAt: '2026-06-07T10:05:00.000Z',
      nowMs: Date.parse('2026-06-07T10:00:01.000Z'),
    }), 4000);
    assert.equal(getMillisecondsUntilRefresh({
      expiresAt: '2026-06-07T10:00:05.000Z',
      sessionExpiresAt: '2026-06-07T10:05:00.000Z',
      nowMs: Date.parse('2026-06-07T10:00:06.000Z'),
    }), 0);
  });

  it('does not schedule an automatic refresh for the final token in the session', () => {
    assert.equal(getMillisecondsUntilRefresh({
      expiresAt: '2026-06-07T10:05:00.000Z',
      sessionExpiresAt: '2026-06-07T10:05:00.000Z',
      nowMs: Date.parse('2026-06-07T10:04:56.000Z'),
    }), null);
    assert.equal(getMillisecondsUntilRefresh({
      expiresAt: '2026-06-07T10:05:05.000Z',
      sessionExpiresAt: '2026-06-07T10:05:00.000Z',
      nowMs: Date.parse('2026-06-07T10:04:56.000Z'),
    }), null);
  });
});
