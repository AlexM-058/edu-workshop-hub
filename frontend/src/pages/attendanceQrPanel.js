export function getAttendanceQrPanelState({ isLoading, qrPayload, error, nowMs }) {
  if (qrPayload) {
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
      isRefreshing: Boolean(isLoading),
    };
  }

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

  return {
    kind: 'idle',
    labelKey: 'attendance.qr.idle',
    canStart: true,
  };
}

export function getMillisecondsUntilRefresh({ expiresAt, sessionExpiresAt, refreshAfterSeconds, nowMs }) {
  const sessionExpiresMs = Date.parse(sessionExpiresAt);
  const refreshDelayMs = Number.isFinite(Number(refreshAfterSeconds))
    ? Number(refreshAfterSeconds) * 1000
    : Date.parse(expiresAt) - nowMs;
  const refreshAtMs = nowMs + refreshDelayMs;

  if (refreshAtMs >= sessionExpiresMs) {
    return null;
  }

  return Math.max(0, refreshDelayMs);
}
