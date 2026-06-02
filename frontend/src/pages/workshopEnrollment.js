export function getEnrollmentSuccessMessage(payload, t) {
  const enrollment = payload.enrollment;

  if (enrollment?.status === 'waiting') {
    return t('detail.waitlistSuccess', {
      position: enrollment.waitlist_position,
    });
  }

  return t('detail.enrollSuccess');
}

export function getEnrollmentErrorMessage(error, t) {
  if (error.status === 409) {
    return t('detail.enrollErrorDuplicate');
  }

  if (error.status === 422) {
    return t('detail.enrollErrorUnpublished');
  }

  if (error.status === 401 || error.status === 403) {
    return t('detail.enrollErrorForbidden');
  }

  return t('detail.enrollErrorGeneric');
}

export async function submitWorkshopEnrollment({ workshopId, getToken, enrollInWorkshop, t }) {
  try {
    const token = await getToken();
    const payload = await enrollInWorkshop(token, workshopId);

    return {
      errorMessage: '',
      successMessage: getEnrollmentSuccessMessage(payload, t),
    };
  } catch (error) {
    return {
      errorMessage: getEnrollmentErrorMessage(error, t),
      successMessage: '',
    };
  }
}
