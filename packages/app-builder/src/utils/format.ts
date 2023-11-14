import cronstrue from 'cronstrue';
import { type Options as ConstrueOptions } from 'cronstrue/dist/options';

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
