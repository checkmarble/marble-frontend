export function formatCreatedAt(locale: string, createdAt: string) {
  return Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(createdAt));
}

export function formatNumber(locale: string, number: number) {
  return Intl.NumberFormat(locale).format(number);
}
