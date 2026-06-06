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

export function buildWorkshopPayload(form, status, coverImage, professorImage) {
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
    cost: optionalText(form.cost),
    status,
  };

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

export async function submitWorkshopForm({ form, status, coverImage, professorImage, getToken, createWorkshop, t }) {
  try {
    const token = await getToken();
    const payload = buildWorkshopPayload(form, status, coverImage, professorImage);
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
