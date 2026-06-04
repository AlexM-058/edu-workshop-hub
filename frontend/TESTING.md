# Frontend Testing Guide

This frontend test suite uses Vitest with React Testing Library. It includes small unit tests for pure helpers and presentational components, plus integration-style tests for routed auth behavior, auth provider sync, API wiring, and the main user actions.

## What The Tests Cover

### Auth And Permissions

- `tests/permissions.test.js`
  - Verifies the pure `canAccessRole` helper.
  - Checks that a synced role can access routes without explicit role restrictions.
  - Checks teacher/admin allow lists.

- `tests/ProtectedRoute.integration.test.jsx`
  - Renders `ProtectedRoute` inside a real `MemoryRouter`.
  - Provides fake auth and i18n context values.
  - Verifies loading state while Clerk is not loaded.
  - Verifies signed-out users redirect to `/sign-in` with `redirect_url`.
  - Verifies sync errors show the retry/sign-out UI and call `signOut`.
  - Verifies the route waits while the backend role is syncing.
  - Verifies denied roles redirect to the attender dashboard.
  - Verifies allowed roles render protected children.

- `tests/AuthProvider.integration.test.jsx`
  - Mocks Clerk hooks and the backend user sync API.
  - Verifies `StaticAuthProvider` returns a safe signed-out state.
  - Verifies `ClerkBackedAuthProvider` fetches the backend user and exposes the synced role.
  - Verifies backend sync failures expose `syncError` and clear the app user.
  - Verifies signed-out Clerk sessions do not call the backend sync API.

### API Client

- `tests/api.test.js`
  - Mocks `fetch`.
  - Verifies request URLs, HTTP methods, headers, bearer tokens, and JSON bodies.
  - Verifies workshop IDs are URL-encoded for enrollment.
  - Verifies backend error payloads are attached to thrown errors.

### Page Interaction Integration Tests

- `tests/WorkshopDetailPage.integration.test.jsx`
  - Renders the real page with mocked auth, i18n, layout, and API boundaries.
  - Verifies signed-out users see an inline sign-in error and no API call is made.
  - Verifies non-attender roles see a forbidden error and no API call is made.
  - Verifies attender enrollment uses the route workshop id and token.
  - Verifies enrolled and waitlisted success messages.
  - Verifies API errors map to visible inline error text.

- `tests/CreateWorkshopPage.integration.test.jsx`
  - Renders the real form with mocked auth, i18n, shell, icon, and API boundaries.
  - Fills fields with Testing Library user events.
  - Verifies draft submission sends a trimmed payload and renders the returned success state.
  - Verifies publish submission sends `status: "published"`.
  - Verifies backend validation errors appear inline.

- `tests/AdminUsersPage.integration.test.jsx`
  - Renders the real admin users page with mocked auth, i18n, shell, icon, and API boundaries.
  - Verifies teacher invite submission trims the email and sends the admin token.
  - Verifies created and existing invite success messages.
  - Verifies backend validation errors appear inline.

### Component And Helper Unit Tests

- `tests/LanguageToggle.test.jsx`
  - Locale button text, locale switching, custom classes, and accessibility attributes.

- `tests/MetricCard.test.jsx`
  - Required props, optional meta text, tone classes, icon rendering, and translation usage.

- `tests/WorkshopCard.test.jsx`
  - Marketing and catalog card content, images, badges, optional notes, and links.

- `tests/Icon.test.jsx`
  - SVG attributes, default classes, icon map lookup, and fallback icon behavior.

- `tests/i18n.test.js`
  - Translation lookup, Romanian fallback, browser locale normalization, interpolation, and RO/DE dictionary key sync.

- `tests/workshopEnrollment.test.js`
  - Enrollment helper success/error mapping and token/API call behavior.

- `tests/createWorkshopForm.test.js`
  - Workshop payload creation, trimming, optional field omission, submit success, and validation error mapping.

- `tests/adminTeacherInvitationForm.test.js`
  - Teacher invite helper success/error states, message formatting, and loading control state.

- `tests/spaFallback.test.js`
  - Static hosting fallback config.
  - Nginx SPA fallback config.
  - No placeholder `href="#"` navigation.
  - Canonical dashboard routes and legacy redirects.

## What These Tests Prove

The integration tests prove that the frontend pieces are wired together correctly at the component boundary:

- Context values are consumed correctly.
- React Router redirects happen for the expected auth states.
- User clicks and form submissions call the correct API functions.
- Tokens and route params are passed into API calls.
- Success and error responses become visible UI messages.
- Important auth and role states do not accidentally render protected content.

They do not prove that Clerk itself, the real backend, Docker networking, or a real browser login flow works end to end. Those concerns need backend tests and browser-level end-to-end tests.

## Technologies Used

- **Vitest**: test runner, assertions, mocks, and spies.
- **React Testing Library**: renders React components and queries the DOM like a user.
- **@testing-library/user-event**: simulates realistic typing and clicking.
- **@testing-library/jest-dom**: adds DOM matchers like `toBeInTheDocument`.
- **jsdom**: browser-like DOM environment for Vitest.
- **React Router MemoryRouter**: tests routing and redirects without opening a browser.
- **Vitest `vi.mock` and `vi.stubGlobal`**: mocks modules, Clerk hooks, API functions, and `fetch`.

## Running Tests

Run these commands from the `frontend` directory:

```bash
cd frontend
```

Run all tests in watch mode:

```bash
npm test
```

Run all tests once:

```bash
npm test -- --run
```

Run the Vitest UI:

```bash
npm run test:ui
```

Run lint:

```bash
npm run lint
```

Run one test file:

```bash
npm test -- --run tests/ProtectedRoute.integration.test.jsx
```

Run tests matching a name pattern:

```bash
npm test -- --run ProtectedRoute
```

Run all integration tests by filename pattern:

```bash
npm test -- --run integration
```

Run all API tests:

```bash
npm test -- --run tests/api.test.js
```

## Current Verification Command

The suite was verified with:

```bash
npm test -- --run
npm run lint
```

At the time this guide was updated, the frontend suite had 16 passing test files and 101 passing tests.

## Coverage Notes

Vitest coverage is not currently configured because `@vitest/coverage-v8` is not installed. To add numeric coverage later:

```bash
npm install -D @vitest/coverage-v8
npm test -- --run --coverage
```

Use coverage as a guide, not the only quality signal. For this app, the most important confidence comes from the integration tests around auth routing, provider sync, API requests, and the main user actions.

## How To Know A Test Is Useful

A useful frontend test should fail if a real behavior breaks. Prefer assertions like:

- a redirected route appears,
- protected content is hidden or shown,
- a button click calls the expected API with the expected token and payload,
- a backend error becomes visible inline,
- a form trims and transforms values before submission.

Avoid writing too many tests that only assert CSS classes or internal implementation details unless the styling branch itself is important behavior.

## Adding New Tests

Use unit tests when the code is a pure function or a small presentational component.

Use integration-style tests when behavior depends on several pieces working together, such as:

- context plus component state,
- router plus protected route,
- form inputs plus API submit helper,
- mocked backend response plus visible UI result.

Basic test structure:

```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('ComponentName', () => {
  it('handles the important user behavior', async () => {
    const apiCall = vi.fn()

    render(<ComponentName apiCall={apiCall} />)

    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(apiCall).toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent('Saved')
  })
})
```
