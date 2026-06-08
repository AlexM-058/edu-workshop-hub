const GOOGLE_CALENDAR_TEMPLATE_URL = 'https://calendar.google.com/calendar/render'

export function createGoogleCalendarWorkshopUrl(workshop, locale = 'ro') {
  const startsAt = parseDate(workshop?.scheduled_at)
  const endsAt = parseDate(workshop?.ends_at)

  if (!startsAt || !endsAt || endsAt <= startsAt) {
    return null
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: localizedValue(workshop.title, locale) || '',
    dates: `${formatGoogleCalendarDate(startsAt)}/${formatGoogleCalendarDate(endsAt)}`,
  })

  const location = trimToNull(workshop.location)
  if (location) {
    params.set('location', location)
  }

  const details = calendarDetails(workshop, locale)
  if (details) {
    params.set('details', details)
  }

  return `${GOOGLE_CALENDAR_TEMPLATE_URL}?${params.toString()}`
}

function calendarDetails(workshop, locale) {
  const description = localizedValue(workshop.description, locale)
  const teacherName = trimToNull(workshop.referent?.name ?? workshop.teacher?.name)
  const parts = []

  if (description) {
    parts.push(description)
  }

  if (teacherName) {
    const label = locale === 'de' ? 'Referent' : 'Referent'
    parts.push(`${label}: ${teacherName}`)
  }

  return parts.join('\n\n')
}

function localizedValue(value, locale) {
  if (typeof value === 'string') {
    return trimToNull(value)
  }

  return trimToNull(value?.[locale] ?? value?.ro ?? value?.de)
}

function parseDate(value) {
  if (!value) {
    return null
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatGoogleCalendarDate(date) {
  const compactIso = date.toISOString().replaceAll('-', '').replaceAll(':', '')
  return compactIso.slice(0, 15) + 'Z'
}

function trimToNull(value) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}
