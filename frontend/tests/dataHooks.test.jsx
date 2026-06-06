import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { useAppAuth } from '../src/auth/AuthContext'
import {
  fetchAttenderRegistrations,
  fetchAttenderStats,
  fetchTeacherStats,
  fetchTeacherWorkshops,
  fetchWorkshop,
  fetchWorkshops,
} from '../src/lib/api'
import { useAttenderRegistrations, useAttenderStats } from '../src/lib/attenderRegistrations'
import { useTeacherStats, useTeacherWorkshops } from '../src/lib/teacherWorkshops'
import { useWorkshop, useWorkshops } from '../src/lib/workshops'

vi.mock('../src/auth/AuthContext', () => ({
  useAppAuth: vi.fn(),
}))

vi.mock('../src/lib/api', () => ({
  fetchAttenderRegistrations: vi.fn(),
  fetchAttenderStats: vi.fn(),
  fetchTeacherStats: vi.fn(),
  fetchTeacherWorkshops: vi.fn(),
  fetchWorkshop: vi.fn(),
  fetchWorkshops: vi.fn(),
}))

function PublicCatalogProbe() {
  const { workshops, meta, isLoading, error } = useWorkshops({ page: 2, perPage: 6 })

  return (
    <output data-testid="state">
      {JSON.stringify({
        error: error?.message ?? null,
        isLoading,
        meta,
        workshops,
      })}
    </output>
  )
}

function WorkshopDetailProbe({ id }) {
  const { workshop, isLoading, error } = useWorkshop(id)

  return (
    <output data-testid="state">
      {JSON.stringify({
        error: error?.message ?? null,
        isLoading,
        workshop,
      })}
    </output>
  )
}

function TeacherWorkshopsProbe() {
  const { workshops, meta, isLoading, error } = useTeacherWorkshops({ page: 3, perPage: 4 })

  return (
    <output data-testid="state">
      {JSON.stringify({
        error: error?.message ?? null,
        isLoading,
        meta,
        workshops,
      })}
    </output>
  )
}

function TeacherStatsProbe() {
  const { stats, isLoading, error } = useTeacherStats()

  return (
    <output data-testid="state">
      {JSON.stringify({
        error: error?.message ?? null,
        isLoading,
        stats,
      })}
    </output>
  )
}

function AttenderRegistrationsProbe() {
  const { registrations, meta, isLoading, error } = useAttenderRegistrations({
    page: 4,
    perPage: 5,
    status: 'waitlist',
  })

  return (
    <output data-testid="state">
      {JSON.stringify({
        error: error?.message ?? null,
        isLoading,
        meta,
        registrations,
      })}
    </output>
  )
}

function AttenderStatsProbe() {
  const { stats, isLoading, error } = useAttenderStats()

  return (
    <output data-testid="state">
      {JSON.stringify({
        error: error?.message ?? null,
        isLoading,
        stats,
      })}
    </output>
  )
}

function readState() {
  return JSON.parse(screen.getByTestId('state').textContent)
}

describe('data hooks', () => {
  const getToken = vi.fn(async () => 'session-token')

  beforeEach(() => {
    getToken.mockClear()
    useAppAuth.mockReturnValue({
      getToken,
      isSignedIn: true,
    })
  })

  it('loads the public workshop catalog and exposes pagination metadata', async () => {
    fetchWorkshops.mockResolvedValue({
      data: [{ id: 1, title: { ro: 'Workshop' } }],
      meta: { current_page: 2 },
    })

    render(<PublicCatalogProbe />)

    await waitFor(() => {
      expect(readState()).toMatchObject({
        isLoading: false,
        meta: { current_page: 2 },
        workshops: [{ id: 1, title: { ro: 'Workshop' } }],
      })
    })

    expect(fetchWorkshops).toHaveBeenCalledWith({ page: 2, perPage: 6 })
  })

  it('exposes public workshop fetch errors as inline state', async () => {
    fetchWorkshops.mockRejectedValue(new Error('Catalog unavailable'))

    render(<PublicCatalogProbe />)

    await waitFor(() => {
      expect(readState()).toMatchObject({
        error: 'Catalog unavailable',
        isLoading: false,
        workshops: null,
      })
    })
  })

  it('does not fetch a workshop detail without an id', () => {
    render(<WorkshopDetailProbe id={null} />)

    expect(fetchWorkshop).not.toHaveBeenCalled()
    expect(readState()).toMatchObject({
      isLoading: true,
      workshop: null,
    })
  })

  it('loads a workshop detail when an id is present', async () => {
    fetchWorkshop.mockResolvedValue({ data: { id: 7, title: { ro: 'Detail' } } })

    render(<WorkshopDetailProbe id="7" />)

    await waitFor(() => {
      expect(readState()).toMatchObject({
        isLoading: false,
        workshop: { id: 7, title: { ro: 'Detail' } },
      })
    })

    expect(fetchWorkshop).toHaveBeenCalledWith('7')
  })

  it('loads authenticated teacher workshops with the session token', async () => {
    fetchTeacherWorkshops.mockResolvedValue({
      data: [{ id: 2 }],
      meta: { current_page: 3 },
    })

    render(<TeacherWorkshopsProbe />)

    await waitFor(() => {
      expect(readState()).toMatchObject({
        isLoading: false,
        meta: { current_page: 3 },
        workshops: [{ id: 2 }],
      })
    })

    expect(getToken).toHaveBeenCalledTimes(1)
    expect(fetchTeacherWorkshops).toHaveBeenCalledWith({
      page: 3,
      perPage: 4,
      token: 'session-token',
    })
  })

  it('keeps private teacher hooks idle when the user is signed out', () => {
    useAppAuth.mockReturnValue({
      getToken,
      isSignedIn: false,
    })

    render(<TeacherWorkshopsProbe />)

    expect(getToken).not.toHaveBeenCalled()
    expect(fetchTeacherWorkshops).not.toHaveBeenCalled()
    expect(readState()).toMatchObject({
      isLoading: true,
      workshops: null,
    })
  })

  it('loads authenticated teacher stats', async () => {
    fetchTeacherStats.mockResolvedValue({
      active_workshops: 2,
      total_enrolled: 40,
    })

    render(<TeacherStatsProbe />)

    await waitFor(() => {
      expect(readState()).toMatchObject({
        isLoading: false,
        stats: {
          active_workshops: 2,
          total_enrolled: 40,
        },
      })
    })

    expect(fetchTeacherStats).toHaveBeenCalledWith({ token: 'session-token' })
  })

  it('loads authenticated attender registrations with status filters', async () => {
    fetchAttenderRegistrations.mockResolvedValue({
      data: [{ id: 3, status: 'waitlist' }],
      meta: { current_page: 4 },
    })

    render(<AttenderRegistrationsProbe />)

    await waitFor(() => {
      expect(readState()).toMatchObject({
        isLoading: false,
        meta: { current_page: 4 },
        registrations: [{ id: 3, status: 'waitlist' }],
      })
    })

    expect(fetchAttenderRegistrations).toHaveBeenCalledWith({
      page: 4,
      perPage: 5,
      status: 'waitlist',
      token: 'session-token',
    })
  })

  it('loads authenticated attender stats', async () => {
    fetchAttenderStats.mockResolvedValue({
      certificates_available: 1,
      waitlisted: 2,
    })

    render(<AttenderStatsProbe />)

    await waitFor(() => {
      expect(readState()).toMatchObject({
        isLoading: false,
        stats: {
          certificates_available: 1,
          waitlisted: 2,
        },
      })
    })

    expect(fetchAttenderStats).toHaveBeenCalledWith({ token: 'session-token' })
  })
})
