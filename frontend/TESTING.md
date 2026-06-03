# Frontend Unit Tests Documentation

## Overview
I've created comprehensive unit tests for your frontend React components using **Vitest** and **React Testing Library**. All tests follow best practices and are configured to run seamlessly with your existing test setup.

## Test Files Created

### Component Tests (23 passing tests)

1. **[LanguageToggle.test.jsx](src/components/LanguageToggle.test.jsx)** (6 tests)
   - Tests locale switching between Romanian and German
   - Verifies button text updates correctly
   - Checks custom className and accessibility attributes

2. **[MetricCard.test.jsx](src/components/MetricCard.test.jsx)** (9 tests)
   - Tests rendering with required/optional props
   - Verifies tone styling (blue, green, amber)
   - Checks icon and meta text display
   - Tests demo text from translations

3. **[WorkshopCard.test.jsx](src/components/WorkshopCard.test.jsx)** (23 tests)
   - **MarketingWorkshopCard** (9 tests):
     - Image, title, description rendering
     - Category and rating display
     - Badge styling variations
   - **CatalogWorkshopCard** (14 tests):
     - Workshop details (credits, facilitator, date, location, price)
     - Enrollment open badge
     - Enrollment button and link routing
     - Optional note display

4. **[Icon.test.jsx](src/components/Icon.test.jsx)** (10 tests)
   - SVG element rendering and attributes
   - Icon lookup and fallback behavior
   - Class application and styling

### Setup File

5. **[vitest.setup.js](vitest.setup.js)**
   - Configures test environment cleanup
   - Mocks `window.matchMedia` for responsive components
   - Imports Testing Library utilities

## Running the Tests

### Run all tests once:
```bash
npm run test
```

### Run tests in watch mode (auto-rerun on file changes):
```bash
npm run test
```
Then press `w` to enter watch mode, or just let it stay in watch mode.

### Run tests with UI:
```bash
npm run test:ui
```

### Run specific test file:
```bash
npm run test -- src/components/LanguageToggle.test.jsx
```

### Run tests matching a pattern:
```bash
npm run test -- MetricCard
```

## Test Results
✅ **23 tests passing** - All new component tests pass successfully

## Key Testing Patterns Used

### 1. Mocking Context
```javascript
vi.mock('../i18n/I18nContext', () => ({
  useI18n: vi.fn(),
}));
```

### 2. Mocking Components
```javascript
vi.mock('./Icon', () => ({
  default: ({ children, className, filled }) => (
    <span data-testid="icon" className={className}>
      {children}
    </span>
  ),
}));
```

### 3. Router Wrapping for Link Components
```javascript
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};
```

### 4. User Events
```javascript
const user = userEvent.setup();
await user.click(button);
```

## Dependencies Added

- `@testing-library/user-event` - For simulating user interactions

## Next Steps - Write More Tests

To add tests for other components, follow this pattern:

1. Create a `.test.jsx` file next to the component
2. Import necessary testing utilities:
   ```javascript
   import { describe, it, expect, vi } from 'vitest';
   import { render, screen } from '@testing-library/react';
   ```
3. Mock external dependencies as needed
4. Write test cases using `describe()` and `it()` blocks
5. Use `render()` to mount components and `screen` queries to find elements

## Example Test Structure

```javascript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
    vi.clearAllMocks();
  });

  it('does something specific', () => {
    render(<Component />);
    expect(screen.getByText('text')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    render(<Component />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(mockFn).toHaveBeenCalled();
  });
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
