import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createGoogleCalendarWorkshopUrl } from './calendar.js'

describe('Google Calendar workshop links', () => {
  it('generates a Google Calendar URL with title, interval, location, description, and teacher', () => {
    const url = createGoogleCalendarWorkshopUrl({
      title: { ro: 'Atelier pedagogic' },
      description: { ro: 'Strategii aplicate pentru clasă.' },
      scheduled_at: '2026-07-15T10:00:00+03:00',
      ends_at: '2026-07-15T12:30:00+03:00',
      location: 'Sala 2, Cluj',
      referent: { name: 'Dr. Elena Ionescu' },
    }, 'ro')

    const parsed = new URL(url)

    assert.equal(parsed.origin, 'https://calendar.google.com')
    assert.equal(parsed.pathname, '/calendar/render')
    assert.equal(parsed.searchParams.get('action'), 'TEMPLATE')
    assert.equal(parsed.searchParams.get('text'), 'Atelier pedagogic')
    assert.equal(parsed.searchParams.get('dates'), '20260715T070000Z/20260715T093000Z')
    assert.equal(parsed.searchParams.get('location'), 'Sala 2, Cluj')
    assert.equal(parsed.searchParams.get('details'), 'Strategii aplicate pentru clasă.\n\nReferent: Dr. Elena Ionescu')
  })

  it('encodes special characters through URLSearchParams', () => {
    const url = createGoogleCalendarWorkshopUrl({
      title: { de: 'Didaktik & KI: Übungen?' },
      description: { de: 'Materialien: A+B & C/D' },
      scheduled_at: '2026-08-20T09:00:00Z',
      ends_at: '2026-08-20T10:00:00Z',
      location: 'Raum 4 & Online',
    }, 'de')

    assert.match(url, /Didaktik\+%26\+KI%3A\+%C3%9Cbungen%3F/)
    assert.equal(new URL(url).searchParams.get('details'), 'Materialien: A+B & C/D')
  })

  it('returns null when required calendar dates are missing or invalid', () => {
    assert.equal(createGoogleCalendarWorkshopUrl({
      title: { ro: 'Fără final' },
      scheduled_at: '2026-07-15T10:00:00Z',
    }), null)

    assert.equal(createGoogleCalendarWorkshopUrl({
      title: { ro: 'Dată invalidă' },
      scheduled_at: 'not-a-date',
      ends_at: '2026-07-15T12:00:00Z',
    }), null)
  })
})
