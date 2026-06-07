export function getAttendanceCheckInMessage(payload, t) {
  if (payload?.status === 'already_confirmed') {
    return t('attendance.checkIn.alreadyConfirmed');
  }

  return t('attendance.checkIn.confirmed');
}

export function getAttendanceCheckInErrorMessage(error, t) {
  if (error?.status === 422) {
    return t('attendance.checkIn.expired');
  }

  if (error?.status === 403) {
    return t('attendance.checkIn.forbidden');
  }

  return t('attendance.checkIn.genericError');
}

export async function submitAttendanceCheckIn({ token, getToken, checkIn, t }) {
  const qrToken = token.trim();

  if (!qrToken) {
    return {
      kind: 'error',
      message: t('attendance.checkIn.missingToken'),
    };
  }

  try {
    const authToken = await getToken();
    const payload = await checkIn({ token: authToken, qrToken });

    return {
      kind: 'success',
      message: getAttendanceCheckInMessage(payload, t),
    };
  } catch (error) {
    return {
      kind: 'error',
      message: getAttendanceCheckInErrorMessage(error, t),
    };
  }
}
