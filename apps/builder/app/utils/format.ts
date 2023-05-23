export function formatCreatedAt(locale: string, createdAt: string) {
  return Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(createdAt));
}
