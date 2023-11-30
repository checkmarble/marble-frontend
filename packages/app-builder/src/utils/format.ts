import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import cronstrue from 'cronstrue';
import { type Options as ConstrueOptions } from 'cronstrue/dist/options';
import { add, formatDistanceStrict, formatRelative } from 'date-fns';
import { Temporal } from 'temporal-polyfill';

export function formatDateTime(
  createdAt: string | Date,
  { language, ...options }: { language: string } & Intl.DateTimeFormatOptions
) {
  return Intl.DateTimeFormat(language, {
    dateStyle: 'short',
    timeStyle: 'short',
    ...options,
  }).format(typeof createdAt === 'string' ? new Date(createdAt) : createdAt);
}

export function formatNumber(
  number: number,
  { language, ...options }: { language: string } & Intl.NumberFormatOptions
) {
  return Intl.NumberFormat(language, options).format(number);
}

export function formatSchedule(
  schedule: string,
  { language, ...options }: { language: string } & ConstrueOptions
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
  return formatDistanceStrict(
    add(date, Temporal.Duration.from(duration)),
    date,
    {
      addSuffix: true,
      locale: getDateFnsLocale(language),
    }
  );
}

export function formatDateRelative(
  date: string | Date,
  options: { language: string }
) {
  return formatRelative(
    typeof date === 'string' ? new Date(date) : date,
    new Date(),
    {
      locale: getDateFnsLocale(options.language),
    }
  );
}
