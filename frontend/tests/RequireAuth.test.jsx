import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import RequireAuth from '../src/components/RequireAuth'
import { getSession } from '../src/lib/auth'

vi.mock('../src/lib/auth', () => ({
  getSession: vi.fn(),
}))

function LocationProbe() {
  const location = useLocation()

  return (
    <output>
      {location.pathname}
      {location.state?.from?.pathname ? ` from ${location.state.from.pathname}` : ''}
    </output>
  )
}

function renderGuard(allowedRoles, initialEntry = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<RequireAuth allowedRoles={allowedRoles} />}>
          <Route path="/protected" element={<h1>Protected content</h1>} />
        </Route>
        <Route path="/" element={<LocationProbe />} />
        <Route path="/dashboard/attender" element={<h1>Attender dashboard</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireAuth legacy route guard', () => {
  beforeEach(() => {
    getSession.mockReturnValue({
      role: 'teacher',
      userName: 'Teacher Test',
    })
  })

  it('redirects unauthenticated visitors to the landing page with their attempted path', () => {
    getSession.mockReturnValue(null)

    renderGuard(['teacher'])

    expect(screen.getByText('/ from /protected')).toBeInTheDocument()
  })

  it('redirects signed-in users to their own dashboard when their role is not allowed', () => {
    getSession.mockReturnValue({
      role: 'attender',
      userName: 'Attender Test',
    })

    renderGuard(['teacher', 'admin'])

    expect(screen.getByRole('heading', { name: 'Attender dashboard' })).toBeInTheDocument()
  })

  it('renders nested routes when the current session role is allowed', () => {
    renderGuard(['teacher'])

    expect(screen.getByRole('heading', { name: 'Protected content' })).toBeInTheDocument()
  })
})
