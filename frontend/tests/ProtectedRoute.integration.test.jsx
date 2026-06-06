import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AuthContext } from '../src/auth/AuthContext'
import ProtectedRoute from '../src/auth/ProtectedRoute'
import { I18nContext } from '../src/i18n/I18nContext'

const translations = {
  'auth.loadingTitle': 'Loading session',
  'auth.loadingText': 'Checking auth state',
  'auth.signOut': 'Sign out',
  'auth.syncFailedTitle': 'Sync failed',
  'auth.syncFailedText': 'Backend sync failed',
  'auth.syncingTitle': 'Syncing account',
  'auth.syncingText': 'Preparing role',
}

function t(key) {
  return translations[key] ?? key
}

function LocationProbe() {
  const location = useLocation()

  return <p>{location.pathname}{location.search}</p>
}

function renderProtectedRoute(authValue, roles, initialEntry = '/protected?tab=1') {
  return render(
    <I18nContext.Provider value={{ locale: 'ro', setLocale: vi.fn(), t }}>
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route
              path="/protected"
              element={(
                <ProtectedRoute roles={roles}>
                  <h1>Protected content</h1>
                </ProtectedRoute>
              )}
            />
            <Route path="/sign-in" element={<LocationProbe />} />
            <Route path="/demo/dashboard/attender" element={<h1>Attender dashboard</h1>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </I18nContext.Provider>,
  )
}

const baseAuth = {
  appUser: null,
  clerkConfigured: true,
  getToken: vi.fn(),
  isLoaded: true,
  isSignedIn: true,
  isSyncing: false,
  role: 'attender',
  signOut: vi.fn(),
  syncError: null,
}

describe('ProtectedRoute integration', () => {
  it('shows a loading status while Clerk auth state is loading', () => {
    renderProtectedRoute({ ...baseAuth, isLoaded: false })

    expect(screen.getByText('Loading session')).toBeInTheDocument()
    expect(screen.getByText('Checking auth state')).toBeInTheDocument()
  })

  it('redirects signed-out users to sign in with the current route as redirect_url', () => {
    renderProtectedRoute({ ...baseAuth, isSignedIn: false })

    expect(screen.getByText('/sign-in?redirect_url=%2Fprotected%3Ftab%3D1')).toBeInTheDocument()
  })

  it('shows sync failure UI and calls signOut from the action button', async () => {
    const signOut = vi.fn()

    renderProtectedRoute({
      ...baseAuth,
      signOut,
      syncError: new Error('Sync failed'),
    })

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(screen.getByRole('heading', { name: 'Sync failed' })).toBeInTheDocument()
    expect(screen.getByText('Backend sync failed')).toBeInTheDocument()
    expect(signOut).toHaveBeenCalledTimes(1)
  })

  it('waits for backend role sync before rendering protected content', () => {
    renderProtectedRoute({ ...baseAuth, isSyncing: true, role: null })

    expect(screen.getByText('Syncing account')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('redirects signed-in users when their role is not allowed', () => {
    renderProtectedRoute({ ...baseAuth, role: 'attender' }, ['teacher', 'admin'])

    expect(screen.getByRole('heading', { name: 'Attender dashboard' })).toBeInTheDocument()
  })

  it('renders children when the synced role is allowed', () => {
    renderProtectedRoute({ ...baseAuth, role: 'teacher' }, ['teacher', 'admin'])

    expect(screen.getByRole('heading', { name: 'Protected content' })).toBeInTheDocument()
  })
})
