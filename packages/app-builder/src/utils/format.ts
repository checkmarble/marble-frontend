import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import cronstrue from 'cronstrue';
import { type Options as ConstrueOptions } from 'cronstrue/dist/options';
import { add } from 'date-fns/add';
import { formatDistanceStrict } from 'date-fns/formatDistanceStrict';
import { formatRelative } from 'date-fns/formatRelative';
import { type Currency, dinero, toDecimal } from 'dinero.js';
import { useMemo } from 'react';
import { Temporal } from 'temporal-polyfill';

/**
 * Get the language of the user's browser.
 *
 * This is a workaround for the fact we do not allow the user to change the data format.
 * Since we do not store the user's language preferences, we use the browser's language.
 *
 * Note: Prefered translation language and data format language are not necessarily the same.
 * You can have a user with a prefered language in 'en-US' but the data format in 'fr-FR' (for DateTime, Number, etc).
 *
 * This introduce hydration issues for non 'fr-FR' browsers, as the language is not available on the server.
 * We use a hook to ease the migration to a better solution (like storing the user's data format language preferences).
 *
 * A frontend only solution could be to store the user's language preferences in the already existing language session cookie.
 * We just need to add an interface to allow the user to change it.
 */
export function useFormatLanguage() {
  return useMemo(
    () => (typeof window === 'undefined' ? 'fr-FR' : (navigator?.languages[0] ?? 'fr-FR')),
    [],
  );
}

export function formatDateTime(
  createdAt: string | Date,
  { language, ...options }: { language: string } & Intl.DateTimeFormatOptions,
) {
  return Intl.DateTimeFormat(language, {
    dateStyle: 'short',
    timeStyle: 'short',
    ...options,
  }).format(typeof createdAt === 'string' ? new Date(createdAt) : createdAt);
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
