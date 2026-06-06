import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { canAccessRole, dashboardPathForRole } from './permissions.js'

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

  it('redirects each role to its own dashboard', () => {
    assert.equal(dashboardPathForRole('admin'), '/demo/admin/dashboard')
    assert.equal(dashboardPathForRole('teacher'), '/demo/dashboard/teacher')
    assert.equal(dashboardPathForRole('referent'), '/demo/dashboard/teacher')
    assert.equal(dashboardPathForRole('attender'), '/demo/dashboard/attender')
    assert.equal(dashboardPathForRole('professor'), '/demo/dashboard/attender')
    assert.equal(dashboardPathForRole(null), '/sign-in')
  })
})
