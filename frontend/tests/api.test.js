import { afterEach, describe, it, expect, vi } from 'vitest'
import {
  createTeacherInvitation,
  createTeacherWorkshop,
  enrollInWorkshop,
  fetchAdminStats,
  fetchAdminUsers,
  fetchAttenderRegistrations,
  fetchAttenderStats,
  fetchCurrentUser,
  fetchTeacherStats,
  fetchTeacherWorkshops,
  fetchWorkshop,
  fetchWorkshops,
  getHealth,
  markTeacherInviteNoticeSeen,
} from '../src/lib/api'

function jsonResponse(payload, ok = true, status = 200) {
  return {
    ok,
    status,
    json: vi.fn(async () => payload),
  }
}

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches backend health and validates the response shape', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({
      service: 'backend',
      status: 'ok',
    })))

    await expect(getHealth()).resolves.toEqual({
      service: 'backend',
      status: 'ok',
    })

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/health', {
      headers: {
        Accept: 'application/json',
      },
    })
  })

  it('rejects invalid backend health payloads', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({
      service: 'backend',
      status: 'degraded',
    })))

    await expect(getHealth()).rejects.toThrow('Backend health response is invalid')
  })

  it('attaches status and parsed body to generic API errors', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({
      message: 'Unauthenticated',
      trace_id: 'req_123',
    }, false, 401)))

    await expect(fetchCurrentUser('bad-token')).rejects.toMatchObject({
      message: 'Unauthenticated',
      status: 401,
      body: {
        trace_id: 'req_123',
      },
    })
  })

  it('sends the bearer token when syncing the current user', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({
      user: {
        id: 7,
        role: 'teacher',
      },
    })))

    await expect(fetchCurrentUser('clerk-token')).resolves.toEqual({
      user: {
        id: 7,
        role: 'teacher',
      },
    })

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/auth/me', {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer clerk-token',
      },
    })
  })

  it('marks the teacher invite notice as seen with a POST request', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ ok: true })))

    await expect(markTeacherInviteNoticeSeen('teacher-token')).resolves.toEqual({ ok: true })

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/auth/teacher-invitation-notice/seen', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer teacher-token',
      },
    })
  })

  it('builds public workshop catalog and detail routes', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ data: [], meta: { current_page: 2 } })))

    await fetchWorkshops({ page: 2, perPage: 24 })
    await fetchWorkshop(9)

    expect(fetch).toHaveBeenNthCalledWith(1, 'http://localhost:8000/api/workshops?page=2&per_page=24', {
      headers: {
        Accept: 'application/json',
      },
    })
    expect(fetch).toHaveBeenNthCalledWith(2, 'http://localhost:8000/api/workshops/9', {
      headers: {
        Accept: 'application/json',
      },
    })
  })

  it('builds authenticated dashboard query routes with filters and tokens', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ data: [], total: 0 })))

    await fetchTeacherWorkshops({ token: 'teacher-token', page: 3, perPage: 8 })
    await fetchTeacherStats({ token: 'teacher-token' })
    await fetchAttenderRegistrations({
      token: 'attender-token',
      page: 4,
      perPage: 6,
      status: 'waitlist',
    })
    await fetchAttenderStats({ token: 'attender-token' })
    await fetchAdminUsers({ token: 'admin-token', page: 5, perPage: 10, role: 'teacher' })
    await fetchAdminStats({ token: 'admin-token' })

    expect(fetch).toHaveBeenNthCalledWith(1, 'http://localhost:8000/api/teacher/workshops?page=3&per_page=8', {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer teacher-token',
      },
    })
    expect(fetch).toHaveBeenNthCalledWith(2, 'http://localhost:8000/api/teacher/stats', {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer teacher-token',
      },
    })
    expect(fetch).toHaveBeenNthCalledWith(3, 'http://localhost:8000/api/attender/registrations?page=4&per_page=6&status=waitlist', {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer attender-token',
      },
    })
    expect(fetch).toHaveBeenNthCalledWith(4, 'http://localhost:8000/api/attender/stats', {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer attender-token',
      },
    })
    expect(fetch).toHaveBeenNthCalledWith(5, 'http://localhost:8000/api/admin/users?page=5&per_page=10&role=teacher', {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer admin-token',
      },
    })
    expect(fetch).toHaveBeenNthCalledWith(6, 'http://localhost:8000/api/admin/stats', {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer admin-token',
      },
    })
  })

  it('creates a teacher invitation with JSON body and auth headers', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({
      status: 'created',
      invitation: {
        email: 'teacher@example.com',
      },
    })))

    await expect(createTeacherInvitation('admin-token', 'teacher@example.com')).resolves.toEqual({
      status: 'created',
      invitation: {
        email: 'teacher@example.com',
      },
    })

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/admin/teacher-invitations', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer admin-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'teacher@example.com' }),
    })
  })

  it('attaches backend payload and status to teacher invitation errors', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({
      message: 'Invalid email',
      errors: {
        email: ['Email is invalid.'],
      },
    }, false, 422)))

    await expect(createTeacherInvitation('admin-token', 'not-an-email')).rejects.toMatchObject({
      message: 'Invalid email',
      status: 422,
      payload: {
        errors: {
          email: ['Email is invalid.'],
        },
      },
    })
  })

  it('creates a teacher workshop with the provided payload', async () => {
    const payload = {
      title: 'Applied Digital Pedagogy',
      status: 'draft',
    }

    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({
      workshop: {
        id: 7,
        ...payload,
      },
    })))

    await expect(createTeacherWorkshop('teacher-token', payload)).resolves.toEqual({
      workshop: {
        id: 7,
        ...payload,
      },
    })

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/teacher/workshops', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer teacher-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  })

  it('attaches backend payload and status to teacher workshop errors', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({
      message: 'Validation failed',
      errors: {
        title_ro: ['Required.'],
      },
    }, false, 422)))

    await expect(createTeacherWorkshop('teacher-token', {})).rejects.toMatchObject({
      message: 'Validation failed',
      status: 422,
      payload: {
        errors: {
          title_ro: ['Required.'],
        },
      },
    })
  })

  it('posts enrollment to the encoded workshop id route', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({
      enrollment: {
        status: 'waiting',
        waitlist_position: 3,
      },
    })))

    await expect(enrollInWorkshop('attender-token', 'workshop 7')).resolves.toEqual({
      enrollment: {
        status: 'waiting',
        waitlist_position: 3,
      },
    })

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/workshops/workshop%207/enroll', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer attender-token',
      },
    })
  })

  it('attaches backend payload and status to enrollment errors', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({
      message: 'Already registered',
    }, false, 409)))

    await expect(enrollInWorkshop('attender-token', 7)).rejects.toMatchObject({
      message: 'Already registered',
      status: 409,
      payload: {
        message: 'Already registered',
      },
    })
  })
})
