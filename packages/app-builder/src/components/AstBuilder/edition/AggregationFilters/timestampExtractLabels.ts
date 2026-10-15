export type TimestampExtractLabel = {
  value: number;
  label: string;
};

const referenceYear = 2024;

export function getTimestampExtractMonths(locale: string): TimestampExtractLabel[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });

  return Array.from({ length: 12 }, (_, index) => {
    const value = index + 1;
    return {
      value,
      label: formatter.format(new Date(Date.UTC(referenceYear, index, 1))),
    };
  });
}

export function getTimestampExtractWeekdays(locale: string): TimestampExtractLabel[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });

  return Array.from({ length: 7 }, (_, index) => {
    const value = index + 1;
    return {
      value,
      // 2024-01-08 is a Monday, matching TimestampExtract's 1-7 weekday values.
      label: formatter.format(new Date(Date.UTC(referenceYear, 0, 7 + value))),
    };
  });
}
