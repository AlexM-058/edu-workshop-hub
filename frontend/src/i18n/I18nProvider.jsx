import { useEffect, useMemo, useState } from 'react';
import { I18nContext } from './I18nContext';
import { getInitialLocale, supportedLocales, translate } from './translations';

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('eduCraftLocale') : null;
    return supportedLocales.includes(stored) ? stored : getInitialLocale(typeof navigator !== 'undefined' ? navigator.language : '');
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem('eduCraftLocale', locale);
  }, [locale]);

  const value = useMemo(() => ({
    locale,
    setLocale: setLocaleState,
    t: (key, params) => translate(locale, key, params),
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
