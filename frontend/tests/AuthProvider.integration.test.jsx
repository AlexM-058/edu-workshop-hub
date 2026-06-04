import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { fetchCurrentUser } from '../src/lib/api'
import { ClerkBackedAuthProvider, StaticAuthProvider } from '../src/auth/AuthProvider'
import { useAppAuth } from '../src/auth/AuthContext'

vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(),
  useUser: vi.fn(),
}))

vi.mock('../src/lib/api', () => ({
  fetchCurrentUser: vi.fn(),
}))

function AuthProbe() {
  const auth = useAppAuth()

  return (
    <dl>
      <dt>configured</dt>
      <dd data-testid="configured">{String(auth.clerkConfigured)}</dd>
      <dt>signed-in</dt>
      <dd data-testid="signed-in">{String(auth.isSignedIn)}</dd>
      <dt>syncing</dt>
      <dd data-testid="syncing">{String(auth.isSyncing)}</dd>
      <dt>role</dt>
      <dd data-testid="role">{auth.role ?? 'none'}</dd>
      <dt>error</dt>
      <dd data-testid="error">{auth.syncError ? auth.syncError.message : 'none'}</dd>
      <dt>clerk-user</dt>
      <dd data-testid="clerk-user">{auth.clerkUser?.id ?? 'none'}</dd>
    </dl>
  )
}

describe('auth providers integration', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      getToken: vi.fn(async () => 'clerk-token'),
      isLoaded: true,
      isSignedIn: true,
      signOut: vi.fn(),
    })

    useUser.mockReturnValue({
      user: { id: 'clerk-user-1' },
    })

    fetchCurrentUser.mockResolvedValue({
      user: { id: 7, role: 'teacher' },
    })
  })

  it('provides a signed-out static auth context when Clerk is not configured', () => {
    render(
      <StaticAuthProvider>
        <AuthProbe />
      </StaticAuthProvider>,
    )

    expect(screen.getByTestId('configured')).toHaveTextContent('false')
    expect(screen.getByTestId('signed-in')).toHaveTextContent('false')
    expect(screen.getByTestId('role')).toHaveTextContent('none')
    expect(screen.getByTestId('syncing')).toHaveTextContent('false')
  })

  it('syncs the Clerk session with the backend and exposes the backend role', async () => {
    render(
      <ClerkBackedAuthProvider>
        <AuthProbe />
      </ClerkBackedAuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('role')).toHaveTextContent('teacher')
    })

    expect(fetchCurrentUser).toHaveBeenCalledWith('clerk-token')
    expect(screen.getByTestId('configured')).toHaveTextContent('true')
    expect(screen.getByTestId('signed-in')).toHaveTextContent('true')
    expect(screen.getByTestId('clerk-user')).toHaveTextContent('clerk-user-1')
    expect(screen.getByTestId('error')).toHaveTextContent('none')
  })

  it('exposes syncError and clears app user when backend sync fails', async () => {
    fetchCurrentUser.mockRejectedValue(new Error('Backend unavailable'))

    render(
      <ClerkBackedAuthProvider>
        <AuthProbe />
      </ClerkBackedAuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Backend unavailable')
    })

    expect(screen.getByTestId('role')).toHaveTextContent('none')
    expect(screen.getByTestId('syncing')).toHaveTextContent('false')
  })

  it('does not sync with the backend when Clerk reports a signed-out session', async () => {
    useAuth.mockReturnValue({
      getToken: vi.fn(async () => 'unused-token'),
      isLoaded: true,
      isSignedIn: false,
      signOut: vi.fn(),
    })

    render(
      <ClerkBackedAuthProvider>
        <AuthProbe />
      </ClerkBackedAuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('signed-in')).toHaveTextContent('false')
    })

    expect(fetchCurrentUser).not.toHaveBeenCalled()
    expect(screen.getByTestId('role')).toHaveTextContent('none')
  })
})
