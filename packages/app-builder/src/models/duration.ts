import { Temporal } from 'temporal-polyfill';

export const durationUnits = ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds'] as const;
export type DurationUnit = (typeof durationUnits)[number];

export const lifecycleDurationUnits = ['months', 'years'] as const;
export type LifecycleDurationUnit = (typeof lifecycleDurationUnits)[number];

export interface LifecycleDurationFormValue {
  value?: number;
  unit: LifecycleDurationUnit;
  /** Preserves a valid API duration that cannot be represented by the lifecycle controls. */
  rawValue?: string;
  /** Retains malformed input so it cannot be mistaken for an intentional clear. */
  inputValue?: string;
  invalid?: boolean;
}

export function isInvalidLifecycleDuration({ invalid, value }: LifecycleDurationFormValue): boolean {
  return invalid === true || (value !== undefined && (!Number.isInteger(value) || value <= 0));
}

export function parseLifecycleDuration(value?: string | null): LifecycleDurationFormValue {
  if (!value) return { unit: 'months' };

  try {
    const duration = Temporal.Duration.from(value);
    const nonCalendarUnits = [
      ['weeks', duration.weeks],
      ['days', duration.days],
      ['hours', duration.hours],
      ['minutes', duration.minutes],
      ['seconds', duration.seconds],
      ['milliseconds', duration.milliseconds],
      ['microseconds', duration.microseconds],
      ['nanoseconds', duration.nanoseconds],
    ].filter(([, amount]) => amount !== 0);

    if (nonCalendarUnits.length === 0 && duration.months === 0 && duration.years !== 0) {
      return { value: duration.years, unit: 'years' };
    }
    if (nonCalendarUnits.length === 0 && (duration.years !== 0 || duration.months !== 0)) {
      return { value: duration.years * 12 + duration.months, unit: 'months' };
    }
  } catch {
    // Preserve malformed or unsupported values rather than overwriting them on an unrelated edit.
  }

  return { unit: 'months', rawValue: value };
}

export function serializeLifecycleDuration(duration: LifecycleDurationFormValue): string | null {
  if (duration.invalid) throw new Error('Cannot serialize an invalid lifecycle duration');
  if (duration.value === undefined) return duration.rawValue ?? null;
  return Temporal.Duration.from({ [duration.unit]: duration.value }).toString();
}

// Source https://tc39.es/ecma402/#table-validcodefordatetimefield
type DateTimeFieldCode = 'year' | 'month' | 'weekOfYear' | 'day' | 'hour' | 'minute' | 'second';

export function adaptDateTimeFieldCodes(durationUnit: DurationUnit): DateTimeFieldCode {
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
    relativeTo: Temporal.Now.plainDateTimeISO(),
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
