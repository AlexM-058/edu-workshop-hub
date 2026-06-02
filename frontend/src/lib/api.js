const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export async function getHealth() {
  const response = await fetch(`${apiBaseUrl}/health`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Backend responded with ${response.status}`);
  }

  const payload = await response.json();

  if (payload.status !== 'ok' || payload.service !== 'backend') {
    throw new Error('Backend health response is invalid');
  }

  return payload;
}

export async function fetchCurrentUser(token) {
  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Auth sync failed with ${response.status}`);
  }

  return response.json();
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
  const response = await fetch(`${apiBaseUrl}/teacher/workshops`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
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
