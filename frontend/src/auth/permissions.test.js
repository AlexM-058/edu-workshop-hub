import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { canAccessRole } from './permissions.js'

describe('auth permissions', () => {
  it('allows any synced role when route has no explicit role list', () => {
    assert.equal(canAccessRole('professor'), true)
    assert.equal(canAccessRole(null), false)
  })

  it('allows referents and admins into referent routes', () => {
    assert.equal(canAccessRole('referent', ['referent', 'admin']), true)
    assert.equal(canAccessRole('admin', ['referent', 'admin']), true)
    assert.equal(canAccessRole('professor', ['referent', 'admin']), false)
  })
})
