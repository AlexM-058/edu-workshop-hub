import { afterEach, describe, it, expect } from 'vitest'
import { getSession, login, logout } from '../src/lib/auth'

const storageKey = 'ewh_demo_session'

describe('demo auth session helpers', () => {
  afterEach(() => {
    sessionStorage.clear()
  })

  it('persists and returns the active demo session', () => {
    login('teacher', 'Teacher Test')

    expect(getSession()).toEqual({
      role: 'teacher',
      userName: 'Teacher Test',
    })
  })

  it('clears the active demo session on logout', () => {
    login('attender', 'Attender Test')

    logout()

    expect(getSession()).toBeNull()
  })

  it('returns null for corrupted stored session JSON', () => {
    sessionStorage.setItem(storageKey, '{not-json')

    expect(getSession()).toBeNull()
  })
})
