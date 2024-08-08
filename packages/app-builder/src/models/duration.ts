export const durationUnits = [
  'years',
  'months',
  'weeks',
  'days',
  'hours',
  'minutes',
  'seconds',
] as const;
type DurationUnit = (typeof durationUnits)[number];

// Source https://tc39.es/ecma402/#table-validcodefordatetimefield
type DateTimeFieldCode =
  | 'year'
  | 'month'
  | 'weekOfYear'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second';

export function adaptDateTimeFieldCodes(
  durationUnit: DurationUnit,
): DateTimeFieldCode {
  switch (durationUnit) {
    case 'years':
      return 'year';
    case 'months':
      return 'month';
    case 'weeks':
      return 'weekOfYear';
    case 'days':
      return 'day';
    case 'hours':
      return 'hour';
    case 'minutes':
      return 'minute';
    case 'seconds':
      return 'second';
  }
}
