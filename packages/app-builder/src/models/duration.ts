import { Temporal } from 'temporal-polyfill';

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

/**
 * Serialize a Temporal.Duration to a string compatible with Go time.ParseDuration.
 * The duration is rounded to the nearest hour, minute and second
 *
 * more info https://pkg.go.dev/time#ParseDuration
 */
export function adaptGoTimeDuration(duration: Temporal.Duration): string {
  const timeDuration = duration.round({
    largestUnit: 'hours',
    smallestUnit: 'seconds',
    relativeTo: Temporal.Now.plainDateTime('gregory'),
  });
  let result = '';
  if (timeDuration.hours != 0) {
    result += `${timeDuration.hours}h`;
  }
  if (timeDuration.minutes != 0) {
    result += `${timeDuration.minutes}m`;
  }
  if (timeDuration.seconds != 0) {
    result += `${timeDuration.seconds}s`;
  }

  return result || '0'; // 0 is the minimum duration
}
