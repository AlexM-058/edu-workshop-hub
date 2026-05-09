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
