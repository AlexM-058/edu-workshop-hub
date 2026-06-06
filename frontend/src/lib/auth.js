/**
 * Client-side auth helpers — PROTOTYPE / MOCK implementation.
 *
 * There is no real backend authentication yet. This module simulates a session
 * by writing a small JSON blob to sessionStorage on "login" and clearing it on
 * "logout". sessionStorage is scoped to the browser tab and is cleared when the
 * tab is closed, so the mock behaves roughly like a real session cookie.
 *
 * IMPORTANT: This is NOT a security boundary. Any data shown in the dashboards
 * must be treated as public until a real backend auth endpoint (Google OAuth +
 * Laravel Sanctum/session) is wired up and this module is replaced.
 *
 * Replacement contract:
 *   - getSession() must return { role, userName } when authenticated, or null.
 *   - login(role, userName) must persist the session.
 *   - logout() must clear the session.
 */

const SESSION_KEY = 'ewh_demo_session';

/**
 * Returns the active demo session, or null if there is none.
 * @returns {{ role: string, userName: string } | null}
 */
export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Persists a demo session for the given role.
 * @param {'professor' | 'referent'} role
 * @param {string} userName
 */
export function login(role, userName) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ role, userName }));
}

/**
 * Clears the demo session.
 */
export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}
