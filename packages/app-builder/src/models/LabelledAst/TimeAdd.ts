import {
  getDatabaseAccessorDisplayName,
  getPayloadAccessorsDisplayName,
  isDatabaseAccess,
  isPayload,
  isTimeNow,
  type LabelledAst,
  NewTimeAddAstNode,
  type TimeAddAstNode,
} from '@app-builder/models';
import { Temporal } from 'temporal-polyfill';

import { TimeNowName } from './TimeNow';

export function newTimeAddLabelledAst(
  node: TimeAddAstNode = NewTimeAddAstNode(),
): LabelledAst {
  return {
    name: getTimeAddName(node),
    description: '',
    operandType: 'Function',
    dataType: 'unknown',
    astNode: node,
  };
}

const getTimeAddName = (node: TimeAddAstNode): string => {
  const sign = node.namedChildren['sign']?.constant ?? '';
  const isoDuration = node.namedChildren['duration']?.constant ?? '';

  let timestamp = '';
  if (isDatabaseAccess(node.namedChildren['timestampField'])) {
    timestamp = getDatabaseAccessorDisplayName(
      node.namedChildren['timestampField'],
    );
  }
  if (isPayload(node.namedChildren['timestampField'])) {
    timestamp = getPayloadAccessorsDisplayName(
      node.namedChildren['timestampField'],
    );
  }

  if (isTimeNow(node.namedChildren['timestampField'])) {
    timestamp = TimeNowName;
  }

  if (sign === '' || isoDuration === '' || timestamp === '') {
    return 'Date';
  }

  const temporalDuration = Temporal.Duration.from(isoDuration);
  return `${timestamp} ${sign} ${temporalDurationToString(temporalDuration)}`;
};

// TODO (i18n): translate & pluralize
const temporalDurationToString = (
  temporalDuration: Temporal.Duration,
): string => {
  let durationString = '';
  if (temporalDuration.days !== 0) {
    durationString += `${pluralizeTemporalDurationUnit(
      temporalDuration.days,
      'day',
    )}`;
  }
  if (temporalDuration.hours !== 0) {
    durationString += `${pluralizeTemporalDurationUnit(
      temporalDuration.hours,
      'hour',
    )}`;
  }
  if (temporalDuration.minutes !== 0) {
    durationString += `${pluralizeTemporalDurationUnit(
      temporalDuration.minutes,
      'minute',
    )}`;
  }
  if (temporalDuration.seconds !== 0) {
    durationString += `${pluralizeTemporalDurationUnit(
      temporalDuration.seconds,
      'second',
    )}`;
  }
  if (durationString === '') {
    durationString += `${pluralizeTemporalDurationUnit(
      temporalDuration.seconds,
      'second',
    )}`;
  }
  return durationString;
};

const pluralizeTemporalDurationUnit = (unit: number, type: string): string => {
  if (unit === 1) {
    return `${unit} ${type}`;
  }
  return `${unit} ${type}s`;
};
