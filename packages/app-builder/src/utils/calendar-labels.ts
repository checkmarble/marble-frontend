export type CalendarLabel = {
  value: number;
  label: string;
};

const referenceYear = 2024;

// Months 1-12, labelled in the locale.
export function getMonthLabels(locale: string): CalendarLabel[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });

  return Array.from({ length: 12 }, (_, index) => {
    const value = index + 1;
    return {
      value,
      label: formatter.format(new Date(Date.UTC(referenceYear, index, 1))),
    };
  });
}

// ISO weekdays 1 (Monday) to 7 (Sunday), labelled in the locale.
export function getWeekdayLabels(locale: string): CalendarLabel[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });

  return Array.from({ length: 7 }, (_, index) => {
    const value = index + 1;
    return {
      value,
      // 2024-01-08 is a Monday.
      label: formatter.format(new Date(Date.UTC(referenceYear, 0, 7 + value))),
    };
  });
}
