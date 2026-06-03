import { describe, it, expect } from 'vitest'
import { canAccessRole } from './permissions.js'

describe('auth permissions', () => {
  it('allows any synced role when route has no explicit role list', () => {
    expect(canAccessRole('attender')).toBe(true)
    expect(canAccessRole(null)).toBe(false)
  })

  it('allows teachers and admins into teacher routes', () => {
    expect(canAccessRole('teacher', ['teacher', 'admin'])).toBe(true)
    expect(canAccessRole('admin', ['teacher', 'admin'])).toBe(true)
    expect(canAccessRole('attender', ['teacher', 'admin'])).toBe(false)
  })
})
