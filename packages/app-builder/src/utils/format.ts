import cronstrue from 'cronstrue';

export function formatDateTime(locale: string, createdAt: string) {
  return Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(createdAt));
}

export function formatNumber(locale: string, number: number) {
  return Intl.NumberFormat(locale).format(number);
}

export function formatSchedule(
  schedule: string,
  { language }: { language: string }
) {
  // Cronstrue only expose locale for lng, without country code
  const locale = language.split('-')[0];

  return cronstrue
    .toString(schedule, {
      verbose: false,
      locale,
      throwExceptionOnParseError: false,
    })
    .toLowerCase();
}
