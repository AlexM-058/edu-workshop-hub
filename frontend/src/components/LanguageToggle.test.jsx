import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageToggle from './LanguageToggle';
import { useI18n } from '../i18n/I18nContext';

// Mock the i18n context
vi.mock('../i18n/I18nContext', () => ({
  useI18n: vi.fn(),
}));

describe('LanguageToggle', () => {
  const mockSetLocale = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useI18n.mockReturnValue({
      locale: 'ro',
      setLocale: mockSetLocale,
      t: (key) => key,
    });
  });

  it('renders button with correct text for Romanian locale', () => {
    render(<LanguageToggle />);
    const button = screen.getByRole('button');
    expect(button.textContent).toBe('DE');
  });

  it('renders button with correct text for German locale', () => {
    useI18n.mockReturnValue({
      locale: 'de',
      setLocale: mockSetLocale,
      t: (key) => key,
    });

    render(<LanguageToggle />);
    const button = screen.getByRole('button');
    expect(button.textContent).toBe('RO');
  });

  it('toggles locale from ro to de on click', async () => {
    render(<LanguageToggle />);
    const button = screen.getByRole('button');

    await userEvent.click(button);

    expect(mockSetLocale).toHaveBeenCalledWith('de');
  });

  it('toggles locale from de to ro on click', async () => {
    useI18n.mockReturnValue({
      locale: 'de',
      setLocale: mockSetLocale,
      t: (key) => key,
    });

    render(<LanguageToggle />);
    const button = screen.getByRole('button');

    await userEvent.click(button);

    expect(mockSetLocale).toHaveBeenCalledWith('ro');
  });

  it('applies custom className', () => {
    render(<LanguageToggle className="custom-class" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('has correct accessibility attributes', () => {
    render(<LanguageToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-label', 'common.switchLanguage');
  });
});
