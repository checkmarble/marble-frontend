import { sampleDateFormats, sampleHoursFormats } from '@app-builder/services/i18n/i18n-config';
import { useRouteLoaderData } from '@remix-run/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { loader as rootLoader } from '../../root';

/**
 * Hook to access user's date and hours format preferences.
 *
 * Falls back to browser language for client-side rendering and
 * server-detected language for server-side rendering when no user preference is set.
 */
export function useFormatPreferences() {
  const { i18n } = useTranslation();
  const rootLoaderData = useRouteLoaderData<typeof rootLoader>('root');

  return useMemo(() => {
    // Get user preferences from server
    const userPreferences = rootLoaderData?.userPreferences;

    // Determine fallback language (only used when no user preference exists)
    const fallbackLanguage =
      typeof window !== 'undefined'
        ? (navigator?.languages[0] ?? 'fr-FR')
        : (i18n.language ?? 'fr-FR');

    // Prioritize user's stored language preference, then fallback
    const language = userPreferences?.language ?? fallbackLanguage;

    // Get date format preference or fallback to default based on language
    const dateFormat = userPreferences?.dateFormat ?? getDefaultDateFormat(language);

    // Get hours format preference or fallback to default based on language
    const hoursFormat = userPreferences?.hoursFormat ?? getDefaultHoursFormat(language);

    return {
      language,
      dateFormat,
      hoursFormat,
      dateFormatDisplay:
        sampleDateFormats[dateFormat as keyof typeof sampleDateFormats]?.displayName ?? dateFormat,
      hoursFormatDisplay:
        sampleHoursFormats[hoursFormat as keyof typeof sampleHoursFormats]?.displayName ??
        hoursFormat,
    };
  }, [rootLoaderData?.userPreferences, i18n.language]);
}

/**
 * Get default date format based on language/locale
 */
function getDefaultDateFormat(language: string): string {
  // Extract language code (e.g., 'en' from 'en-US')
  const langCode = language.split('-')[0];

  switch (langCode) {
    case 'en':
      // US locale typically uses MM/dd/yyyy, but UK uses dd/MM/yyyy
      return language.includes('US') ? 'MM/dd/yyyy' : 'dd/MM/yyyy';
    case 'fr':
    case 'ar':
      return 'dd/MM/yyyy';
    default:
      return 'dd/MM/yyyy'; // European format as fallback
  }
}

/**
 * Get default hours format based on language/locale
 */
function getDefaultHoursFormat(language: string): string {
  // Extract language code and country
  const langCode = language.split('-')[0];
  const hasUS = language.includes('US');

  switch (langCode) {
    case 'en':
      // US typically uses 12-hour format, others use 24-hour
      return hasUS ? 'hh:mm' : 'HH:mm';
    case 'fr':
    case 'ar':
      return 'HH:mm'; // 24-hour format
    default:
      return 'HH:mm'; // 24-hour format as fallback
  }
}
