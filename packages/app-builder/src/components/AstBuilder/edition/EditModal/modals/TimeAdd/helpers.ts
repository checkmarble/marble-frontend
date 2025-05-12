import type { Temporal } from 'temporal-polyfill';

import type { DurationUnit } from './DurationUnitSelect';

export const adaptDurationAndUnitFromTemporalDuration = (
  temporalDuration: Temporal.Duration,
): { duration: number; durationUnit: DurationUnit } => {
  if (temporalDuration.seconds > 0) {
    return {
      duration: temporalDuration.total('second'),
      durationUnit: 'seconds',
    };
  }
  if (temporalDuration.minutes > 0) {
    return {
      duration: temporalDuration.total('minute'),
      durationUnit: 'minutes',
    };
  }
  if (temporalDuration.hours > 0) {
    return {
      duration: temporalDuration.total('hour'),
      durationUnit: 'hours',
    };
  }
  return {
    duration: temporalDuration.total('day'),
    durationUnit: 'days',
  };
};
