import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import { fetchTeacherWorkshops, fetchWorkshops } from './api.js'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

function mockJsonFetch(assertRequest) {
  globalThis.fetch = async (url, init) => {
    assertRequest(new URL(url), init)

    return {
      ok: true,
      status: 200,
      json: async () => ({ data: [], meta: {} }),
    }
  }
}

describe('workshop API search params', () => {
  it('fetchWorkshops includes encoded search in query params', async () => {
    mockJsonFetch((url) => {
      assert.equal(url.pathname, '/api/workshops')
      assert.equal(url.searchParams.get('page'), '2')
      assert.equal(url.searchParams.get('per_page'), '5')
      assert.equal(url.searchParams.get('search'), 'didaktik & AI')
      assert.match(url.search, /search=didaktik\+%26\+AI/)
    })

    await fetchWorkshops({ page: 2, perPage: 5, search: 'didaktik & AI' })
  })

  it('fetchTeacherWorkshops includes encoded search in query params', async () => {
    mockJsonFetch((url, init) => {
      assert.equal(url.pathname, '/api/teacher/workshops')
      assert.equal(url.searchParams.get('search'), 'Cluj & online')
      assert.equal(init.headers.Authorization, 'Bearer test-token')
    })

    await fetchTeacherWorkshops({ token: 'test-token', search: 'Cluj & online' })
  })
})
