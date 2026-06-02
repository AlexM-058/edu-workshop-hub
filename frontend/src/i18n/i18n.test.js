import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getInitialLocale, translations, translate } from './translations.js';

describe('i18n translations', () => {
  it('returns Romanian and German labels for the same key', () => {
    assert.equal(translate('ro', 'nav.catalog'), 'Catalog');
    assert.equal(translate('de', 'nav.catalog'), 'Catalog');
    assert.equal(translate('ro', 'auth.signIn'), 'Autentificare');
    assert.equal(translate('de', 'auth.signIn'), 'Anmelden');
  });

  it('falls back to Romanian when locale or key is missing', () => {
    assert.equal(translate('en', 'auth.signIn'), 'Autentificare');
    assert.equal(translate('ro', 'missing.key'), 'missing.key');
  });

  it('normalizes browser locale to a supported language', () => {
    assert.equal(getInitialLocale('de-DE'), 'de');
    assert.equal(getInitialLocale('ro-RO'), 'ro');
    assert.equal(getInitialLocale('en-US'), 'ro');
    assert.equal(getInitialLocale('fr-FR'), 'ro');
  });

  it('interpolates translation parameters', () => {
    assert.equal(translate('ro', 'detail.waitlistSuccess', { position: 3 }), 'Ai fost adăugat pe lista de așteptare. Poziția ta: 3.');
    assert.equal(translate('de', 'detail.waitlistSuccess', { position: 3 }), 'Du wurdest zur Warteliste hinzugefügt. Deine Position: 3.');
  });

  it('keeps Romanian and German dictionaries in sync', () => {
    assert.deepEqual(Object.keys(translations.de).sort(), Object.keys(translations.ro).sort());
  });
});
