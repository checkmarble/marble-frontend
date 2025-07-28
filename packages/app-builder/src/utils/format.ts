import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import cronstrue from 'cronstrue';
import { type Options as ConstrueOptions } from 'cronstrue/dist/options';
import { add } from 'date-fns/add';
import { formatDistanceStrict } from 'date-fns/formatDistanceStrict';
import { formatRelative } from 'date-fns/formatRelative';
import { type Currency, dinero, toDecimal } from 'dinero.js';
import { Temporal } from 'temporal-polyfill';

import { useFormatPreferences } from './hooks/use-format-preferences';

/**
 * Get the language for data formatting.
 *
 * This is a workaround for the fact we do not allow the user to change the data format.
 * Since we do not store the user's language preferences, we use the browser's language.
 *
 * Note: Prefered translation language and data format language are not necessarily the same.
 * You can have a user with a prefered language in 'en-US' but the data format in 'fr-FR' (for DateTime, Number, etc).
 *
 * This approach first tries to use the client-side browser language, then falls back to
 * the language set on the request (which includes user preferences and Accept-Language header).
 * This helps reduce hydration issues while providing a server-side fallback.
 *
 * A frontend only solution could be to store the user's data format language preferences in the already existing language session cookie.
 * We just need to add an interface to allow the user to change it.
 */
export function useFormatLanguage() {
  const { language } = useFormatPreferences();
  console.log('language in useFormatLanguage', language);
  return language;
}

/**
 * Get date and hours format preferences.
 *
 * Returns user's preferred formats with fallbacks to locale-appropriate defaults.
 */
export function useFormatPreferencesHook() {
  return useFormatPreferences();
}

/**
 * Format a date using the user's preferred date format.
 */
export function useFormatDate() {
  const { dateFormat } = useFormatPreferences();

  return (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Convert our format pattern to Intl.DateTimeFormat options
    const formatOptions = getDateTimeFormatOptions(dateFormat);

    return new Intl.DateTimeFormat(undefined, formatOptions).format(dateObj);
  };
}

/**
 * Format a time using the user's preferred hours format.
 */
export function useFormatTime() {
  const { hoursFormat } = useFormatPreferences();

  return (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Convert our format pattern to Intl.DateTimeFormat options
    const formatOptions = getTimeFormatOptions(hoursFormat);

    return new Intl.DateTimeFormat(undefined, formatOptions).format(dateObj);
  };
}

/**
 * Convert date format string to Intl.DateTimeFormat options
 */
function getDateTimeFormatOptions(format: string): Intl.DateTimeFormatOptions {
  switch (format) {
    case 'dd/MM/yyyy':
      return { day: '2-digit', month: '2-digit', year: 'numeric' };
    case 'MM/dd/yyyy':
      return { month: '2-digit', day: '2-digit', year: 'numeric' };
    case 'yyyy-MM-dd':
      return { year: 'numeric', month: '2-digit', day: '2-digit' };
    default:
      return { day: '2-digit', month: '2-digit', year: 'numeric' };
  }
}

/**
 * Convert time format string to Intl.DateTimeFormat options
 */
function getTimeFormatOptions(format: string): Intl.DateTimeFormatOptions {
  switch (format) {
    case 'HH:mm':
      return { hour: '2-digit', minute: '2-digit', hour12: false };
    case 'hh:mm':
      return { hour: '2-digit', minute: '2-digit', hour12: true };
    default:
      return { hour: '2-digit', minute: '2-digit', hour12: false };
  }
}

/**
 * Format date/time using user's preferred formats and language.
 * This is the new preferred way to format dates that respects user preferences.
 */
export function formatDateTime(
  timestamp: string | Date,
  options?: Omit<Intl.DateTimeFormatOptions, 'hour12'> & {
    useUserTimeFormat?: boolean;
    useUserDateFormat?: boolean;
  },
) {
  const { language, dateFormat, hoursFormat } = useFormatPreferences();
  const { useUserTimeFormat = true, useUserDateFormat = true, ...intlOptions } = options ?? {};

  // Apply user preferences if requested
  const formatOptions: Intl.DateTimeFormatOptions = { ...intlOptions };

  // Apply user's time format preference
  if (
    useUserTimeFormat &&
    (formatOptions.hour !== undefined || formatOptions.minute !== undefined)
  ) {
    const timeOptions = getTimeFormatOptions(hoursFormat);
    Object.assign(formatOptions, timeOptions);
  }

  // Apply user's date format preference if no specific date options are provided
  if (
    useUserDateFormat &&
    !formatOptions.dateStyle &&
    formatOptions.year === undefined &&
    formatOptions.month === undefined &&
    formatOptions.day === undefined
  ) {
    const dateOptions = getDateTimeFormatOptions(dateFormat);
    Object.assign(formatOptions, dateOptions);
  }

  return Intl.DateTimeFormat(language, formatOptions).format(
    typeof timestamp === 'string' ? new Date(timestamp) : timestamp,
  );
}

export function formatDateTimeWithoutPresets(
  timestamp: string | Date,
  options?: { language?: string } & Intl.DateTimeFormatOptions,
): string;
export function formatDateTimeWithoutPresets(
  timestamp: string | Date,
  { language, ...options }: { language: string } & Intl.DateTimeFormatOptions,
): string;
export function formatDateTimeWithoutPresets(
  timestamp: string | Date,
  optionsParam?:
    | ({ language?: string } & Intl.DateTimeFormatOptions)
    | ({ language: string } & Intl.DateTimeFormatOptions),
): string {
  const { language, ...options } = optionsParam ?? {};

  console.log('language in formatDateTimeWithoutPresets', language);

  // If no language is provided, use user preferences
  if (!language) {
    const formatPreferences = useFormatPreferences();
    const userLanguage = formatPreferences.language;

    // Apply user's format preferences intelligently based on the options provided
    const enhancedOptions = { ...options };

    // If using dateStyle/timeStyle, respect those over user preferences
    if (!enhancedOptions.dateStyle && !enhancedOptions.timeStyle) {
      // If specific date/time components are requested, apply user preferences
      const hasDateComponents =
        enhancedOptions.year !== undefined ||
        enhancedOptions.month !== undefined ||
        enhancedOptions.day !== undefined;
      const hasTimeComponents =
        enhancedOptions.hour !== undefined ||
        enhancedOptions.minute !== undefined ||
        enhancedOptions.second !== undefined;

      if (hasDateComponents) {
        // Apply user's date format for specific date components
        const dateOptions = getDateTimeFormatOptions(formatPreferences.dateFormat);
        if (enhancedOptions.year !== undefined) enhancedOptions.year = dateOptions.year;
        if (enhancedOptions.month !== undefined) enhancedOptions.month = dateOptions.month;
        if (enhancedOptions.day !== undefined) enhancedOptions.day = dateOptions.day;
      }

      if (hasTimeComponents) {
        // Apply user's hours format for time components
        const timeOptions = getTimeFormatOptions(formatPreferences.hoursFormat);
        Object.assign(enhancedOptions, timeOptions);
      }
    }

    return Intl.DateTimeFormat(userLanguage, enhancedOptions).format(
      typeof timestamp === 'string' ? new Date(timestamp) : timestamp,
    );
  }

  // Backward compatibility: when language is provided, use it directly
  return Intl.DateTimeFormat(language, options).format(
    typeof timestamp === 'string' ? new Date(timestamp) : timestamp,
  );
}

/**
 * Format date/time using user's preferred formats and language.
 * This is a simplified version that automatically applies user preferences.
 *
 * @param timestamp - Date string or Date object to format
 * @param options - Optional Intl.DateTimeFormatOptions (user preferences will be applied when possible)
 */
export function formatDateTimeWithUserPreferences(
  timestamp: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  return formatDateTimeWithoutPresets(timestamp, options);
}

export function formatNumber(
  number: Parameters<Intl.NumberFormat['format']>[0],
  {
    language,
    ...options
  }: {
    language: string;
    // For currency, use formatCurrency
    style?: 'decimal' | 'percent';
  } & Omit<Intl.NumberFormatOptions, 'currency' | 'style'>,
) {
  return Intl.NumberFormat(language, options).format(number);
}

export function formatCurrency(
  amount: number,
  {
    currency,
    ...options
  }: { language: string; currency: Currency<number> } & Omit<
    Intl.NumberFormatOptions,
    'currency' | 'style'
  >,
) {
  const decimal = toDecimal(dinero({ amount, currency }));
  // @ts-expect-error toDecimal return string instead of `${number}`
  return formatNumber(decimal, {
    style: 'currency',
    currency: currency.code,
    ...options,
  });
}

export function formatSchedule(
  schedule: string,
  { language, ...options }: { language: string } & ConstrueOptions,
) {
  // Cronstrue only expose locale for lng, without country code
  const locale = language.split('-')[0];

  return cronstrue
    .toString(schedule, {
      verbose: false,
      locale,
      throwExceptionOnParseError: false,
      ...options,
    })
    .toLowerCase();
}

const date = new Date();
export function formatDuration(duration: string, language: string) {
  return formatDistanceStrict(add(date, Temporal.Duration.from(duration)), date, {
    addSuffix: true,
    locale: getDateFnsLocale(language),
  });
}

export function formatDateRelative(date: string | Date, options: { language: string }) {
  return formatRelative(typeof date === 'string' ? new Date(date) : date, new Date(), {
    locale: getDateFnsLocale(options.language),
  });
}
