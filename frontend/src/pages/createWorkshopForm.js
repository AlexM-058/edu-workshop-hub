function optionalText(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed === '' ? undefined : trimmed;
}

function compactName(parts) {
  return parts
    .map((part) => String(part ?? '').trim())
    .filter(Boolean)
    .join(' ');
}

export function buildTeacherAutofillFields({ appUser, clerkUser } = {}) {
  const coordinatorName =
    optionalText(appUser?.name) ??
    optionalText(clerkUser?.fullName) ??
    optionalText(compactName([clerkUser?.firstName, clerkUser?.lastName])) ??
    optionalText(appUser?.email) ??
    optionalText(clerkUser?.primaryEmailAddress?.emailAddress) ??
    '';

  return {
    coordinatorName,
  };
}

function optionalCapacity(value) {
  const trimmed = String(value ?? '').trim();

  if (trimmed === '') {
    return undefined;
  }

  return /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed;
}

export function buildWorkshopPayload(form, status, coverImage, professorImage) {
  const payload = {
    title: form.title.trim(),
    category_id: form.category_id ? String(form.category_id).trim() : '',
    description: form.description.trim(),
    coordinator_name: optionalText(form.coordinatorName),
    coordinator_bio: optionalText(form.coordinatorBio),
    starts_at: optionalText(form.startsAt),
    ends_at: optionalText(form.endsAt),
    duration: optionalText(form.duration),
    capacity: optionalCapacity(form.capacity),
    location: optionalText(form.location),
    cost: optionalText(form.cost),
    status,
  };

  if (!coverImage && !professorImage) {
    return Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined),
    );
  }

  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value);
    }
  });

  if (coverImage) {
    formData.append('cover_image', coverImage);
  }

  if (professorImage) {
    formData.append('professor_image', professorImage);
  }

  return formData;
}

export function getWorkshopSubmitErrorMessage(error, t) {
  const validationErrors = error.payload?.errors;

  if (validationErrors) {
    const firstField = Object.keys(validationErrors)[0];

    if (firstField) {
      const firstMessage = validationErrors[firstField]?.[0];

      if (firstMessage) {
        return firstMessage;
      }

      const translationKey = `create.error.${firstField}`;
      const translated = t(translationKey);
      
      if (translated !== translationKey) {
        return translated;
      }
      
      return `${t('create.error.field_invalid')}: ${firstField}`;
    }
  }

  return t('create.errorGeneric');
}

export async function submitWorkshopForm({ form, status, coverImage, professorImage, getToken, apiCall, createWorkshop, workshopId, t }) {
  try {
    const token = await getToken();
    const payload = buildWorkshopPayload(form, status, coverImage, professorImage);
    const submit = apiCall ?? createWorkshop;
    const response = workshopId 
      ? await submit(token, workshopId, payload)
      : await submit(token, payload);

    return {
      errorMessage: '',
      workshop: response.data || response.workshop,
    };
  } catch (error) {
    return {
      errorMessage: getWorkshopSubmitErrorMessage(error, t),
      workshop: null,
    };
  }
}
