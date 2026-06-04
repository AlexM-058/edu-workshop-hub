import { afterEach, describe, it, expect, vi } from 'vitest'
import {
  createTeacherInvitation,
  createTeacherWorkshop,
  enrollInWorkshop,
  fetchCurrentUser,
  getHealth,
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
})
