import { type IdLessAstNode, isUndefinedAstNode } from '@app-builder/models';
import {
  type AggregationAstNode,
  isAggregation,
  isFuzzyMatchFilterOptionsAstNode,
} from '@app-builder/models/astNode/aggregation';
import { isConstant } from '@app-builder/models/astNode/constant';
import { isCustomListAccess } from '@app-builder/models/astNode/custom-list';
import { isDatabaseAccess, isPayload } from '@app-builder/models/astNode/data-accessor';
import { isIsMultipleOf, type IsMultipleOfAstNode } from '@app-builder/models/astNode/multiple-of';
import {
  type FuzzyMatchComparatorAstNode,
  isFuzzyMatchComparator,
  isStringTemplateAstNode,
  type StringTemplateAstNode,
} from '@app-builder/models/astNode/strings';
import {
  isTimeAdd,
  isTimeNow,
  isTimestampExtract,
  type TimeAddAstNode,
  type TimestampExtractAstNode,
} from '@app-builder/models/astNode/time';
import { type CustomList } from '@app-builder/models/custom-list';
import { getOperatorName } from '@app-builder/models/get-operator-name';
import { isAggregatorOperator } from '@app-builder/models/modale-operators';
import { formatNumber } from '@app-builder/utils/format';
import { type TFunction } from 'i18next';
import * as R from 'remeda';
import { Temporal } from 'temporal-polyfill';

import { formatConstant } from './formatConstant';
import { getCustomListAccessCustomList } from './getCustomListAccessCustomList';

type TFunctionDisplayName = TFunction<['common', 'scenarios'], undefined>;

interface AstNodeStringifierContext {
  t: TFunctionDisplayName;
  language: string;
  customLists: CustomList[];
}

export function getAstNodeDisplayName(
  astNode: IdLessAstNode,
  context: AstNodeStringifierContext,
): string {
  if (isConstant(astNode)) {
    return formatConstant(astNode.constant, context);
  }

  if (isCustomListAccess(astNode)) {
    const customList = getCustomListAccessCustomList(astNode, context);
    return customList?.name ?? context.t('scenarios:custom_list.unknown');
  }

  if (isDatabaseAccess(astNode)) {
    const { path, fieldName } = astNode.namedChildren;
    return [...path.constant, fieldName.constant].join('.');
  }

  if (isPayload(astNode)) {
    return astNode.children[0].constant;
  }

  if (isAggregation(astNode)) {
    return getAggregatorDisplayName(astNode, context);
  }

  if (isTimeAdd(astNode)) {
    return getTimeAddDisplayName(astNode, context);
  }

  if (isTimeNow(astNode)) {
    return context.t('scenarios:edit_date.now');
  }

  if (isTimestampExtract(astNode)) {
    return getTimestampExtractDisplayName(astNode, context);
  }

  if (isFuzzyMatchComparator(astNode)) {
    return getFuzzyMatchComparatorDisplayName(astNode, context);
  }

  if (isIsMultipleOf(astNode)) {
    return getIsMultipleOfDisplayName(astNode, context);
  }

  if (isStringTemplateAstNode(astNode)) {
    return getStringTemplateDisplayName(astNode, context);
  }

  if (isFuzzyMatchFilterOptionsAstNode(astNode)) {
    return getAstNodeDisplayName(astNode.namedChildren.value, context);
  }

  if (isUndefinedAstNode(astNode)) {
    return '';
  }

  // If there is no name, return a default value (should never happen since constant are handled above)
  if (!astNode.name) return '🤷‍♂️';

  // default AstNode toString() implementation
  const childrenArgs = R.pipe(
    astNode.children,
    R.map((child) => getAstNodeDisplayName(child, context)),
    R.join(', '),
  );

  const namedChildrenArgs = R.pipe(
    R.entries(astNode.namedChildren),
    R.map(([name, child]) => `${name}: ${getAstNodeDisplayName(child, context)}`),
    R.join(', '),
  );

  const args = R.pipe(
    [childrenArgs, namedChildrenArgs],
    R.filter((arg) => arg !== ''),
    R.join(', '),
  );

  return `${astNode.name}(${args})`;
}

function getTimeAddDisplayName(
  astNode: IdLessAstNode<TimeAddAstNode>,
  context: AstNodeStringifierContext,
): string {
  const sign = astNode.namedChildren['sign']?.constant ?? '';
  const isoDuration = astNode.namedChildren['duration']?.constant ?? '';
  const timestampField = astNode.namedChildren['timestampField'];

  const timestamp = getAstNodeDisplayName(timestampField, context);

  if (sign === '' || isoDuration === '' || timestamp === '') {
    return context.t('scenarios:edit_date.date');
  }

  const temporalDuration = Temporal.Duration.from(isoDuration);
  return `${timestamp} ${sign} ${temporalDurationToString(temporalDuration)}`;
}
// TODO (i18n): translate & pluralize / or use Intl.DurationFormat polyfill: https://formatjs.io/docs/polyfills/intl-durationformat/
const temporalDurationToString = (temporalDuration: Temporal.Duration): string => {
  let durationString = '';
  if (temporalDuration.days !== 0) {
    durationString += `${pluralizeTemporalDurationUnit(temporalDuration.days, 'day')}`;
  }
  if (temporalDuration.hours !== 0) {
    durationString += `${pluralizeTemporalDurationUnit(temporalDuration.hours, 'hour')}`;
  }
  if (temporalDuration.minutes !== 0) {
    durationString += `${pluralizeTemporalDurationUnit(temporalDuration.minutes, 'minute')}`;
  }
  if (temporalDuration.seconds !== 0) {
    durationString += `${pluralizeTemporalDurationUnit(temporalDuration.seconds, 'second')}`;
  }
  if (durationString === '') {
    durationString += `${pluralizeTemporalDurationUnit(temporalDuration.seconds, 'second')}`;
  }
  return durationString;
};

const pluralizeTemporalDurationUnit = (unit: number, type: string): string => {
  if (unit === 1) {
    return `${unit} ${type}`;
  }
  return `${unit} ${type}s`;
};

function getAggregatorDisplayName(
  astNode: IdLessAstNode<AggregationAstNode>,
  context: {
    t: TFunctionDisplayName;
  },
) {
  const { aggregator, label } = astNode.namedChildren;
  if (label?.constant !== undefined && label?.constant !== '') {
    return label?.constant;
  }
  const aggregatorName = aggregator.constant;
  if (isAggregatorOperator(aggregatorName)) {
    return getOperatorName(context.t, aggregatorName);
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn('Unhandled aggregator', aggregatorName);
  }
  return aggregatorName;
}

function getFuzzyMatchComparatorDisplayName(
  astNode: IdLessAstNode<FuzzyMatchComparatorAstNode>,
  context: AstNodeStringifierContext,
) {
  const fuzzyMatch = astNode.children[0];
  const left = fuzzyMatch.children[0];
  const right = fuzzyMatch.children[1];
  if (isUndefinedAstNode(left) && isUndefinedAstNode(right)) {
    return context.t('scenarios:edit_fuzzy_match.string_similarity');
  }
  // '?' is used as a fallback when the node is undefined
  const formatLeft = getAstNodeDisplayName(left, context) || '?';
  const formatRight = getAstNodeDisplayName(right, context) || '?';
  return `${formatLeft} ≈ ${formatRight}`;
}

function getTimestampExtractDisplayName(
  astNode: IdLessAstNode<TimestampExtractAstNode>,
  context: AstNodeStringifierContext,
) {
  const part = astNode.namedChildren['part']?.constant ?? '';
  const timestamp = astNode.namedChildren['timestamp'];

  const timestampStr = getAstNodeDisplayName(timestamp, context);

  if (timestampStr === '') {
    return context.t('scenarios:edit_timestamp_extract.title');
  }

  return context.t('scenarios:edit_timestamp_extract.display_name', {
    replace: {
      operator: getOperatorName(context.t, part),
      timestamp: timestampStr,
    },
  });
}

function getIsMultipleOfDisplayName(
  astNode: IdLessAstNode<IsMultipleOfAstNode>,
  context: AstNodeStringifierContext,
) {
  const value = astNode.namedChildren.value;
  const divider = astNode.namedChildren.divider.constant;

  const valueStr = getAstNodeDisplayName(value, context);
  if (valueStr === '') {
    return context.t('scenarios:edit_is_multiple_of.title');
  }

  return context.t('scenarios:edit_is_multiple_of.display_name', {
    replace: {
      value: valueStr,
      divider: formatNumber(divider, {
        language: context.language,
        style: undefined,
      }),
    },
  });
}

function getStringTemplateDisplayName(
  astNode: IdLessAstNode<StringTemplateAstNode>,
  context: AstNodeStringifierContext,
) {
  const value = astNode.children[0]?.constant ?? '';
  if (!value) {
    return context.t('scenarios:edit_string_template.title');
  }
  return value;
}
