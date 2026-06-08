function normalizeApiBaseUrl(value) {
  const rawValue = value ?? 'http://localhost:8000/api';

  return rawValue
    .trim()
    .replace(/^VITE_API_URL=/, '')
    .replace(/\/$/, '');
}

const apiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

async function apiFetch(path, { token, ...init } = {}) {
  const headers = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers ?? {}),
  };

  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw Object.assign(
      new Error(body.message ?? `API error ${response.status}`),
      { status: response.status, body },
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function getHealth() {
  const payload = await apiFetch('/health');

  if (payload.status !== 'ok' || payload.service !== 'backend') {
    throw new Error('Backend health response is invalid');
  }

  return payload;
}

export async function fetchCurrentUser(token) {
  return apiFetch('/auth/me', { token });
}

export async function markTeacherInviteNoticeSeen(token) {
  return apiFetch('/auth/teacher-invitation-notice/seen', {
    method: 'POST',
    token,
  });
}

// ---------------------------------------------------------------------------
// Workshops — public catalog
// ---------------------------------------------------------------------------

/**
 * Fetch a paginated list of active workshops.
 *
 * @param {{ page?: number, perPage?: number }} params
 * @returns {Promise<{ data: Workshop[], meta: PaginationMeta }>}
 */
export async function fetchWorkshops({ page = 1, perPage = 12 } = {}) {
  return apiFetch(`/workshops?page=${page}&per_page=${perPage}`);
}

/**
 * Fetch a single workshop by ID.
 *
 * @param {number|string} id
 * @returns {Promise<{ data: Workshop }>}
 */
export async function fetchWorkshop(id) {
  return apiFetch(`/workshops/${id}`);
}

// ---------------------------------------------------------------------------
// Teacher (referent) — authenticated endpoints
// ---------------------------------------------------------------------------

/**
 * Fetch the authenticated referent's workshops (paginated).
 *
 * @param {{ token: string, page?: number, perPage?: number }} opts
 */
export async function fetchTeacherWorkshops({ token, page = 1, perPage = 12 } = {}) {
  return apiFetch(`/teacher/workshops?page=${page}&per_page=${perPage}`, { token });
}

/**
 * Fetch aggregated stats for the authenticated referent.
 *
 * @param {{ token: string }} opts
 * @returns {Promise<{ total_workshops: number, active_workshops: number, total_enrolled: number, total_capacity: number }>}
 */
export async function fetchTeacherStats({ token } = {}) {
  return apiFetch('/teacher/stats', { token });
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function fetchCategories() {
  return apiFetch('/categories');
}

export async function fetchAdminCategories({ token } = {}) {
  return apiFetch('/admin/categories', { token });
}

export async function createCategory({ token, name, icon } = {}) {
  return apiFetch('/admin/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, icon }),
    token,
  });
}

export async function updateCategory({ token, categoryId, name, icon } = {}) {
  return apiFetch(`/admin/categories/${encodeURIComponent(categoryId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, icon }),
    token,
  });
}

export async function deleteCategory({ token, categoryId } = {}) {
  return apiFetch(`/admin/categories/${encodeURIComponent(categoryId)}`, {
    method: 'DELETE',
    token,
  });
}

export async function fetchTeacherParticipants({ token, workshopId } = {}) {
  return apiFetch(`/teacher/workshops/${encodeURIComponent(workshopId)}/participants`, { token });
}

export async function markRegistrationAttendance({ token, registrationId, attended } = {}) {
  return apiFetch(`/teacher/registrations/${encodeURIComponent(registrationId)}/attendance`, {
    method: 'PATCH',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attended }),
  });
}

export async function createAttendanceQrToken({ token, workshopId } = {}) {
  return apiFetch(`/teacher/workshops/${encodeURIComponent(workshopId)}/attendance-qr`, {
    method: 'POST',
    token,
  });
}

export async function downloadAttendanceList({ token, workshopId, format = 'csv', locale = 'ro' } = {}) {
  const params = new URLSearchParams({
    format,
    locale,
  });

  const response = await fetch(
    `${apiBaseUrl}/teacher/workshops/${encodeURIComponent(workshopId)}/attendance-list?${params}`,
    {
      headers: {
        Accept: format === 'pdf' ? 'application/pdf' : 'text/csv',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw Object.assign(
      new Error(body.message ?? `Attendance export failed with ${response.status}`),
      { status: response.status, body },
    );
  }

  return response.blob();
}

// ---------------------------------------------------------------------------
// Attender (professor) — authenticated endpoints
// ---------------------------------------------------------------------------

/**
 * Fetch the authenticated professor's registrations (paginated).
 *
 * @param {{ token: string, page?: number, perPage?: number, status?: string }} opts
 */
export async function fetchAttenderRegistrations({ token, page = 1, perPage = 12, status } = {}) {
  const params = new URLSearchParams({ page, per_page: perPage });
  if (status) params.set('status', status);
  return apiFetch(`/attender/registrations?${params}`, { token });
}

/**
 * Fetch aggregated stats for the authenticated professor.
 *
 * @param {{ token: string }} opts
 */
export async function fetchAttenderStats({ token } = {}) {
  return apiFetch('/attender/stats', { token });
}

export async function uploadProfessorImage({ token, file } = {}) {
  return uploadFile({ endpoint: '/auth/me/professor-image', token, file });
}

export async function deleteWorkshopByAdmin({ token, workshopId } = {}) {
  return apiFetch(`/admin/workshops/${encodeURIComponent(workshopId)}`, {
    method: 'DELETE',
    token,
  });
}

export async function updateUserRoleByAdmin({ token, userId, role } = {}) {
  return apiFetch(`/admin/users/${encodeURIComponent(userId)}/role`, {
    method: 'PATCH',
    token,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role }),
  });
}

export async function deleteUserByAdmin({ token, userId } = {}) {
  return apiFetch(`/admin/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    token,
  });
}

export async function fetchRegistrationStatus({ token, workshopId } = {}) {
  return apiFetch(`/attender/workshops/${encodeURIComponent(workshopId)}/registration-status`, { token });
}

export async function withdrawRegistration({ token, registrationId } = {}) {
  return apiFetch(`/attender/registrations/${encodeURIComponent(registrationId)}`, {
    method: 'DELETE',
    token,
  });
}
export async function downloadCertificate({ token, workshopId } = {}) {
  const response = await fetch(`${apiBaseUrl}/workshops/${encodeURIComponent(workshopId)}/certificate`, {
    method: 'GET',
    headers: {
      Accept: 'application/pdf',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Eroare la descărcarea certificatului');
  }

  return response.blob();
}

export async function checkInAttendance({ token, qrToken } = {}) {
  return apiFetch('/attender/attendance/check-in', {
    method: 'POST',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: qrToken }),
  });
}

// ---------------------------------------------------------------------------
// Admin — authenticated endpoints (role: admin)
// ---------------------------------------------------------------------------

/**
 * Fetch all platform users (paginated, optional role filter).
 *
 * @param {{ token: string, page?: number, perPage?: number, role?: string }} opts
 */
export async function fetchAdminUsers({ token, page = 1, perPage = 20, role } = {}) {
  const params = new URLSearchParams({ page, per_page: perPage });
  if (role) params.set('role', role);
  return apiFetch(`/admin/users?${params}`, { token });
}

/**
 * Fetch platform-wide aggregated stats for the admin audit dashboard.
 *
 * @param {{ token: string }} opts
 */
export async function fetchAdminStats({ token } = {}) {
  return apiFetch('/admin/stats', { token });
}

export async function createTeacherInvitation(token, email) {
  const response = await fetch(`${apiBaseUrl}/admin/teacher-invitations`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message ?? `Teacher invitation failed with ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function createTeacherWorkshop(token, payload) {
  const isFormData = payload instanceof FormData;

  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${apiBaseUrl}/teacher/workshops`, {
    method: 'POST',
    headers,
    body: isFormData ? payload : JSON.stringify(payload),
  });

  const responsePayload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(responsePayload.message ?? `Workshop creation failed with ${response.status}`);
    error.status = response.status;
    error.payload = responsePayload;
    throw error;
  }

  return responsePayload;
}

export async function updateTeacherWorkshop(token, workshopId, payload) {
  const isFormData = payload instanceof FormData;

  if (isFormData) {
    payload.append('_method', 'PUT');
  }

  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${apiBaseUrl}/teacher/workshops/${encodeURIComponent(workshopId)}`, {
    method: 'POST',
    headers,
    body: isFormData ? payload : JSON.stringify({ ...payload, _method: 'PUT' }),
  });

  const responsePayload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(responsePayload.message ?? `Workshop update failed with ${response.status}`);
    error.status = response.status;
    error.payload = responsePayload;
    throw error;
  }

  return responsePayload;
}

export async function enrollInWorkshop(token, workshopId) {
  const response = await fetch(`${apiBaseUrl}/workshops/${encodeURIComponent(workshopId)}/enroll`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const responsePayload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(responsePayload.message ?? `Workshop enrollment failed with ${response.status}`);
    error.status = response.status;
    error.payload = responsePayload;
    throw error;
  }

  return responsePayload;
}
