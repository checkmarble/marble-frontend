import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import cronstrue from 'cronstrue';
import { type Options as ConstrueOptions } from 'cronstrue/dist/options';
import { add } from 'date-fns/add';
import { formatDistanceStrict } from 'date-fns/formatDistanceStrict';
import { formatRelative } from 'date-fns/formatRelative';
import { type Currency, dinero, toDecimal } from 'dinero.js';
import { useCallback } from 'react';
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

// Helpers for mapping date order across locales and preferences
function getDefaultDateFormatForLanguage(language: string): string {
  const parts = new Intl.DateTimeFormat(language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(new Date(2025, 7, 21));

  const order = parts
    .map((p) => p.type)
    .filter((t): t is 'day' | 'month' | 'year' => t === 'day' || t === 'month' || t === 'year');

  const key = order.join('-');
  switch (key) {
    case 'day-month-year':
      return 'dd/MM/yyyy';
    case 'month-day-year':
      return 'MM/dd/yyyy';
    case 'year-month-day':
      return 'yyyy-MM-dd';
    default:
      return 'dd/MM/yyyy';
  }
}

function formatDateWithPatternFromParts(
  date: Date,
  language: string,
  pattern: string,
  timeZone?: string,
): string {
  const parts = new Intl.DateTimeFormat(language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone,
  }).formatToParts(date);

  const day = parts.find((p) => p.type === 'day')?.value ?? '';
  const month = parts.find((p) => p.type === 'month')?.value ?? '';
  const year = parts.find((p) => p.type === 'year')?.value ?? '';

  switch (pattern) {
    case 'dd/MM/yyyy':
      return `${day}/${month}/${year}`;
    case 'MM/dd/yyyy':
      return `${month}/${day}/${year}`;
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

function pickDateOptions(
  options: Intl.DateTimeFormatOptions | undefined,
): Intl.DateTimeFormatOptions {
  if (!options) return {};
  const { year, month, day, timeZone } = options;
  const picked: Intl.DateTimeFormatOptions = {};
  if (year !== undefined) picked.year = year;
  if (month !== undefined) picked.month = month;
  if (day !== undefined) picked.day = day;
  if (timeZone !== undefined) picked.timeZone = timeZone;
  return picked;
}

function pickTimeOptions(
  options: Intl.DateTimeFormatOptions | undefined,
): Intl.DateTimeFormatOptions {
  if (!options) return {};
  const { hour, minute, second, hour12, hourCycle, timeZone } = options;
  const picked: Intl.DateTimeFormatOptions = {};
  if (hour !== undefined) picked.hour = hour;
  if (minute !== undefined) picked.minute = minute;
  if (second !== undefined) picked.second = second;
  if (hour12 !== undefined) picked.hour12 = hour12;
  if (hourCycle !== undefined) picked.hourCycle = hourCycle;
  if (timeZone !== undefined) picked.timeZone = timeZone;
  return picked;
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

/**
 * Formats a date/time value using Intl.DateTimeFormat without applying project-specific
 * date or time "presets". You must provide the user's preferences (language, dateFormat, hoursFormat)
 * explicitly. The function applies user preferences to the provided Intl.DateTimeFormatOptions
 * only for the relevant date or time components, without overriding explicit options.
 *
 * - If date/time components are specified in options, user preferences for those components are applied.
 * - If no dateStyle/timeStyle is set, user preferences for date/time format are used where appropriate.
 *
 * @param timestamp - The date/time value to format (string or Date)
 * @param userPreferences - Object containing user's language, dateFormat, and hoursFormat
 * @param options - Intl.DateTimeFormatOptions to customize formatting
 * @returns The formatted date/time string
 */
export function formatDateTimeWithoutPresets(
  timestamp: string | Date,
  userPreferences: {
    language: string;
    dateFormat: string;
    hoursFormat: string;
  },
  options?: Intl.DateTimeFormatOptions,
): string;
export function formatDateTimeWithoutPresets(
  timestamp: string | Date,
  options: { language: string } & Intl.DateTimeFormatOptions,
): string;
export function formatDateTimeWithoutPresets(
  timestamp: string | Date,
  a:
    | { language: string; dateFormat: string; hoursFormat: string }
    | ({ language: string } & Intl.DateTimeFormatOptions),
  b?: Intl.DateTimeFormatOptions,
): string {
  const dateObj = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  if ('dateFormat' in a && 'hoursFormat' in a) {
    const { language, dateFormat, hoursFormat } = a;
    const enhancedOptions: Intl.DateTimeFormatOptions = { ...(b ?? {}) };

    // Override dateStyle: 'short' with specific format when user preferences are provided
    if (enhancedOptions.dateStyle === 'short') {
      delete enhancedOptions.dateStyle;
      Object.assign(enhancedOptions, { year: 'numeric', month: '2-digit', day: '2-digit' });
    }

    // Apply user's format preferences intelligently based on the options provided
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
        const dateOptions = getDateTimeFormatOptions(dateFormat);
        if (enhancedOptions.year !== undefined) enhancedOptions.year = dateOptions.year;
        if (enhancedOptions.month !== undefined) enhancedOptions.month = dateOptions.month;
        if (enhancedOptions.day !== undefined) enhancedOptions.day = dateOptions.day;
      }

      if (hasTimeComponents) {
        // Apply user's hours format for time components
        const timeOptions = getTimeFormatOptions(hoursFormat);
        Object.assign(enhancedOptions, timeOptions);
      }
    }

    const includeDate =
      enhancedOptions.year !== undefined ||
      enhancedOptions.month !== undefined ||
      enhancedOptions.day !== undefined;
    const includeTime =
      enhancedOptions.hour !== undefined ||
      enhancedOptions.minute !== undefined ||
      enhancedOptions.second !== undefined;

    if (includeDate) {
      const defaultFormat = getDefaultDateFormatForLanguage(language);
      let dateString: string;

      if (dateFormat !== defaultFormat) {
        // Remap date order using localized parts to desired user preference
        dateString = formatDateWithPatternFromParts(
          dateObj,
          language,
          dateFormat,
          enhancedOptions.timeZone,
        );
      } else {
        const dateOpts = pickDateOptions(enhancedOptions);
        const finalDateOpts = Object.keys(dateOpts).length
          ? dateOpts
          : getDateTimeFormatOptions(dateFormat);
        // include timezone if provided
        if (enhancedOptions.timeZone && !finalDateOpts.timeZone) {
          finalDateOpts.timeZone = enhancedOptions.timeZone;
        }
        dateString = new Intl.DateTimeFormat(language, finalDateOpts).format(dateObj);
      }

      if (includeTime) {
        const timeOpts = pickTimeOptions(enhancedOptions);
        const timeString = new Intl.DateTimeFormat(language, timeOpts).format(dateObj);
        return `${dateString} ${timeString}`;
      }

      return dateString;
    }

    if (includeTime) {
      return new Intl.DateTimeFormat(language, pickTimeOptions(enhancedOptions)).format(dateObj);
    }

    return Intl.DateTimeFormat(language, enhancedOptions).format(dateObj);
  }

  // Backward-compatible signature: second argument is Intl options including language
  const { language, ...intlOptions } = a;
  return new Intl.DateTimeFormat(language, intlOptions).format(dateObj);
}

/**
 * Format date/time using user's preferred formats and language.
 * This is a simplified version that automatically applies user preferences.
 *
 * @param timestamp - Date string or Date object to format
 * @param options - Optional Intl.DateTimeFormatOptions (user preferences will be applied when possible)
 */
/**
 * @deprecated Use useFormatDateTimeString hook instead.
 */
export function formatDateTimeWithUserPreferences(
  timestamp: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  const formatPreferences = useFormatPreferences();
  return formatDateTimeWithoutPresets(timestamp, formatPreferences, options);
}

export function useFormatDateTimeString() {
  const preferences = useFormatPreferences();
  return useCallback(
    (timestamp: string | Date, options?: Intl.DateTimeFormatOptions) =>
      formatDateTimeWithoutPresets(timestamp, preferences, options),
    [preferences.language, preferences.dateFormat, preferences.hoursFormat],
  );
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
