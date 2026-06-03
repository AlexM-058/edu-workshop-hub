import { describe, it, expect } from 'vitest';
import { getInitialLocale, translations, translate } from './translations.js';

describe('i18n translations', () => {
  it('returns Romanian and German labels for the same key', () => {
    expect(translate('ro', 'nav.catalog')).toBe('Catalog');
    expect(translate('de', 'nav.catalog')).toBe('Catalog');
    expect(translate('ro', 'auth.signIn')).toBe('Autentificare');
    expect(translate('de', 'auth.signIn')).toBe('Anmelden');
  });

  it('falls back to Romanian when locale or key is missing', () => {
    expect(translate('en', 'auth.signIn')).toBe('Autentificare');
    expect(translate('ro', 'missing.key')).toBe('missing.key');
  });

  it('normalizes browser locale to a supported language', () => {
    expect(getInitialLocale('de-DE')).toBe('de');
    expect(getInitialLocale('ro-RO')).toBe('ro');
    expect(getInitialLocale('en-US')).toBe('ro');
    expect(getInitialLocale('fr-FR')).toBe('ro');
  });

  it('interpolates translation parameters', () => {
    expect(translate('ro', 'detail.waitlistSuccess', { position: 3 })).toBe('Ai fost adăugat pe lista de așteptare. Poziția ta: 3.');
    expect(translate('de', 'detail.waitlistSuccess', { position: 3 })).toBe('Du wurdest zur Warteliste hinzugefügt. Deine Position: 3.');
  });

  it('keeps Romanian and German dictionaries in sync', () => {
    expect(Object.keys(translations.de).sort()).toEqual(Object.keys(translations.ro).sort());
  });
});
