import {
  getDatabaseAccessorDisplayName,
  getPayloadAccessorsDisplayName,
  isDatabaseAccess,
  isPayload,
  type LabelledAst,
  NewTimeAddAstNode,
  type TimeAddAstNode,
} from '@app-builder/models';
import { Temporal } from 'temporal-polyfill';

export function newTimeAddLabelledAst(
  node: TimeAddAstNode = NewTimeAddAstNode()
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
      node.namedChildren['timestampField']
    );
  }
  if (isPayload(node.namedChildren['timestampField'])) {
    timestamp = getPayloadAccessorsDisplayName(
      node.namedChildren['timestampField']
    );
  }

  if (sign === '' || isoDuration === '' || timestamp === '') {
    return 'Date';
  }

  const temporalDuration = Temporal.Duration.from(isoDuration);
  return `${timestamp} ${sign} ${temporalDurationToString(temporalDuration)}`;
};

// TODO (i18n): translate & pluralize
const temporalDurationToString = (
  temporalDuration: Temporal.Duration
): string => {
  let durationString = '';
  if (temporalDuration.days !== 0) {
    durationString += `${temporalDuration.days} days`;
  }
  if (temporalDuration.hours !== 0) {
    durationString += `${temporalDuration.hours} hours`;
  }
  if (temporalDuration.minutes !== 0) {
    durationString += `${temporalDuration.minutes} minutes`;
  }
  if (temporalDuration.seconds !== 0) {
    durationString += `${temporalDuration.seconds} seconds`;
  }
  if (durationString === '') {
    durationString += `${temporalDuration.seconds} seconds`;
  }
  return durationString;
};
