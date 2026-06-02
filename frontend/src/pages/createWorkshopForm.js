function optionalText(value) {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function optionalCapacity(value) {
  const trimmed = value.trim();

  if (trimmed === '') {
    return undefined;
  }

  return /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed;
}

export function buildWorkshopPayload(form, status) {
  const payload = {
    title: form.title.trim(),
    category: form.category.trim(),
    description: form.description.trim(),
    coordinator_name: optionalText(form.coordinatorName),
    coordinator_bio: optionalText(form.coordinatorBio),
    starts_at: optionalText(form.startsAt),
    ends_at: optionalText(form.endsAt),
    duration: optionalText(form.duration),
    capacity: optionalCapacity(form.capacity),
    location: optionalText(form.location),
    status,
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );
}

export function getWorkshopSubmitErrorMessage(error, t) {
  const validationErrors = error.payload?.errors;

  if (validationErrors) {
    const firstMessage = Object.values(validationErrors).flat()[0];

    if (firstMessage) {
      return firstMessage;
    }
  }

  return t('create.errorGeneric');
}

export async function submitWorkshopForm({ form, status, getToken, createWorkshop, t }) {
  try {
    const token = await getToken();
    const payload = buildWorkshopPayload(form, status);
    const response = await createWorkshop(token, payload);

    return {
      errorMessage: '',
      workshop: response.workshop,
    };
  } catch (error) {
    return {
      errorMessage: getWorkshopSubmitErrorMessage(error, t),
      workshop: null,
    };
  }
}
