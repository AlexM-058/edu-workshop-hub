export function getAttendanceQrPanelState({ isLoading, qrPayload, error, nowMs }) {
  if (isLoading) {
    return {
      kind: 'loading',
      labelKey: 'attendance.qr.loading',
      canStart: false,
    };
  }

  if (error) {
    return {
      kind: 'error',
      labelKey: 'attendance.qr.error',
      canStart: true,
    };
  }

  if (!qrPayload) {
    return {
      kind: 'idle',
      labelKey: 'attendance.qr.idle',
      canStart: true,
    };
  }

  const sessionExpiresMs = Date.parse(qrPayload.session_expires_at);
  const secondsRemaining = Math.max(0, Math.ceil((sessionExpiresMs - nowMs) / 1000));

  if (secondsRemaining <= 0) {
    return {
      kind: 'expired',
      labelKey: 'attendance.qr.expired',
      canStart: true,
    };
  }

  return {
    kind: 'active',
    labelKey: 'attendance.qr.active',
    canStart: false,
    secondsRemaining,
  };
}

export function getMillisecondsUntilRefresh({ expiresAt, sessionExpiresAt, nowMs }) {
  const expiresMs = Date.parse(expiresAt);
  const sessionExpiresMs = Date.parse(sessionExpiresAt);

  if (expiresMs >= sessionExpiresMs) {
    return null;
  }

  return Math.max(0, expiresMs - nowMs);
}
