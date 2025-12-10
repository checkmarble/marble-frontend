import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import cronstrue from 'cronstrue';
import { type Options as ConstrueOptions } from 'cronstrue/dist/options';
import { add } from 'date-fns/add';
import { formatDistanceStrict } from 'date-fns/formatDistanceStrict';
import { formatRelative } from 'date-fns/formatRelative';
import { type Currency, dinero, toDecimal } from 'dinero.js';
import { useTranslation } from 'react-i18next';
import { Temporal } from 'temporal-polyfill';

/**
 * Get the user's selected language for formatting dates, numbers, and currencies.
 *
 * Returns the current i18next language, ensuring formatting matches the user's
 * selected translation language. Works correctly during both SSR and client-side
 * rendering.
 */
export function useFormatLanguage() {
  const { i18n } = useTranslation();
  return i18n.language;
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
