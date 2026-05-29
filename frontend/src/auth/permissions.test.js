import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { canAccessRole } from './permissions.js'

describe('auth permissions', () => {
  it('allows any synced role when route has no explicit role list', () => {
    assert.equal(canAccessRole('professor'), true)
    assert.equal(canAccessRole(null), false)
  })

  it('allows teachers and admins into teacher routes', () => {
    assert.equal(canAccessRole('teacher', ['teacher', 'admin']), true)
    assert.equal(canAccessRole('admin', ['teacher', 'admin']), true)
    assert.equal(canAccessRole('professor', ['teacher', 'admin']), false)
  })
})
