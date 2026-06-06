const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

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
