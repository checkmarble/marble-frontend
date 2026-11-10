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

export { getWeekdayOptions as getTimestampExtractWeekdays } from '@app-builder/components/SelectableValues';
