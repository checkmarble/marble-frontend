import { FormatContext } from '@app-builder/contexts/FormatContext';
import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import cronstrue from 'cronstrue';
import { type Options as ConstrueOptions } from 'cronstrue/dist/options';
import { add } from 'date-fns/add';
import { formatDistanceStrict } from 'date-fns/formatDistanceStrict';
import { formatRelative } from 'date-fns/formatRelative';
import { type Currency, dinero, toDecimal } from 'dinero.js';
import { useCallback } from 'react';
import { Temporal } from 'temporal-polyfill';

/**
 * Get the user's selected language for formatting dates, numbers, and currencies.
 *
 * Returns the locale from FormatContext, which is set from the root loader data.
 * This ensures the locale is available synchronously during both SSR and client-side
 * hydration, avoiding hydration mismatches.
 */
export function useFormatLanguage() {
  return FormatContext.useValue().locale;
}

/**
 * Get the user's timezone for formatting dates.
 *
 * Returns the timezone from FormatContext, which is detected client-side and
 * stored in a cookie for server-side access.
 */
export function useFormatTimezone() {
  return FormatContext.useValue().timezone;
}

/**
 * Hook that returns a pre-configured date/time formatting function.
 *
 * The returned function automatically uses the user's locale and timezone
 * from the FormatContext, ensuring consistent formatting between server and client.
 *
 * @example
 * const formatDateTime = useFormatDateTime();
 * formatDateTime(date, { dateStyle: 'short' });
 * formatDateTime(date, { dateStyle: 'long', timeStyle: 'short' });
 */
export function useFormatDateTime() {
  const { locale, timezone } = FormatContext.useValue();

  return useCallback(
    (timestamp: string | Date, options?: Omit<Intl.DateTimeFormatOptions, 'timeZone'>) => {
      return Intl.DateTimeFormat(locale, { timeZone: timezone, ...options }).format(
        typeof timestamp === 'string' ? new Date(timestamp) : timestamp,
      );
    },
    [locale, timezone],
  );
}

export function formatDateTimeWithoutPresets(
  timestamp: string | Date,
  { language, ...options }: { language: string } & Intl.DateTimeFormatOptions,
) {
  return Intl.DateTimeFormat(language, options).format(typeof timestamp === 'string' ? new Date(timestamp) : timestamp);
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
  }: { language: string; currency: Currency<number> } & Omit<Intl.NumberFormatOptions, 'currency' | 'style'>,
) {
  const decimal = toDecimal(dinero({ amount, currency }));
  // @ts-expect-error toDecimal return string instead of `${number}`
  return formatNumber(decimal, {
    style: 'currency',
    currency: currency.code,
    ...options,
  });
}

export function formatSchedule(schedule: string, { language, ...options }: { language: string } & ConstrueOptions) {
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

export function formatPercentage(percentage: number, language: string) {
  return Intl.NumberFormat(language, { style: 'percent', maximumFractionDigits: 0 }).format(percentage / 100);
}
