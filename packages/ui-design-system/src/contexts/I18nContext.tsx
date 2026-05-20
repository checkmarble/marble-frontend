import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';

export interface I18nContextValue {
  locale: string;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const defaultValue: I18nContextValue = {
  locale: 'en',
  t: (key: string) => key,
};

const I18nContext = createContext<I18nContextValue>(defaultValue);

/**
 * Provides locale and `t` to design-system components. When mounted inside
 * `I18nextProvider`, subscribes to `languageChanged` and updates automatically.
 * Pass `locale` / `t` to override (e.g. tests or isolated Storybook stories).
 */
export function I18nProvider({
  children,
  locale: localeOverride,
  t: tOverride,
}: {
  children: React.ReactNode;
  locale?: string;
  t?: I18nContextValue['t'];
}) {
  const { t: i18nT, i18n } = useTranslation();

  const subscribedLocale = useSyncExternalStore(
    (onStoreChange) => {
      const handler = () => onStoreChange();
      i18n.on('languageChanged', handler);
      return () => i18n.off('languageChanged', handler);
    },
    () => i18n.resolvedLanguage ?? i18n.language,
    () => i18n.language,
  );

  const locale = localeOverride ?? subscribedLocale;
  const t = tOverride ?? (i18nT as (key: string, options?: Record<string, unknown>) => string);

  const value = useMemo(() => ({ locale, t }), [locale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
