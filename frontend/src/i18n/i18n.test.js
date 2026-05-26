import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getInitialLocale, translations, translate } from './translations.js';

describe('i18n translations', () => {
  it('returns Romanian and English labels for the same key', () => {
    assert.equal(translate('ro', 'nav.catalog'), 'Catalog');
    assert.equal(translate('en', 'nav.catalog'), 'Catalog');
    assert.equal(translate('ro', 'auth.signIn'), 'Autentificare');
    assert.equal(translate('en', 'auth.signIn'), 'Sign In');
  });

  it('falls back to Romanian when locale or key is missing', () => {
    assert.equal(translate('de', 'auth.signIn'), 'Autentificare');
    assert.equal(translate('ro', 'missing.key'), 'missing.key');
  });

  it('normalizes browser locale to a supported language', () => {
    assert.equal(getInitialLocale('en-US'), 'en');
    assert.equal(getInitialLocale('ro-RO'), 'ro');
    assert.equal(getInitialLocale('fr-FR'), 'ro');
  });

  it('keeps Romanian and English dictionaries in sync', () => {
    assert.deepEqual(Object.keys(translations.en).sort(), Object.keys(translations.ro).sort());
  });
});
