import {
  type AggregationAstNode,
  type AstNode,
  type ConstantType,
  type FuzzyMatchComparatorAstNode,
  isAggregation,
  isConstant,
  isCustomListAccess,
  isDatabaseAccess,
  isFuzzyMatchComparator,
  isPayload,
  isTimeAdd,
  isTimeNow,
  isUndefinedAstNode,
  type TimeAddAstNode,
} from '@app-builder/models';
import { type CustomList } from '@app-builder/models/custom-list';
import {
  getOperatorName,
  isAggregatorOperator,
} from '@app-builder/models/editable-operators';
import { type TFunction } from 'i18next';
import * as R from 'remeda';
import { Temporal } from 'temporal-polyfill';

type TFunctionDisplayName = TFunction<['common', 'scenarios'], undefined>;

interface AstNodeStringifierContext {
  t: TFunctionDisplayName;
  customLists: CustomList[];
}

export function getAstNodeDisplayName(
  astNode: AstNode,
  context: AstNodeStringifierContext,
): string {
  if (isConstant(astNode)) {
    return getConstantDisplayName(astNode.constant, context);
  }

  if (isCustomListAccess(astNode)) {
    const customList = R.pipe(
      context.customLists,
      R.find(({ id }) => id === astNode.namedChildren.customListId.constant),
    );
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

  if (isFuzzyMatchComparator(astNode)) {
    return getFuzzyMatchComparatorDisplayName(astNode, context);
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
    R.map(
      ([name, child]) => `${name}: ${getAstNodeDisplayName(child, context)}`,
    ),
    R.join(', '),
  );

  const args = R.pipe(
    [childrenArgs, namedChildrenArgs],
    R.filter((arg) => arg !== ''),
    R.join(', '),
  );

  return `${astNode.name}(${args})`;
}

function getConstantDisplayName(
  constant: ConstantType,
  context: { t: TFunctionDisplayName },
): string {
  if (R.isNullish(constant)) return '';

  if (R.isArray(constant)) {
    return `[${constant.map((constant) => getConstantDisplayName(constant, context)).join(', ')}]`;
  }

  if (R.isString(constant)) {
    //TODO(combobox): handle Timestamp here, if we do manipulate them as ISOstring
    return `"${constant.toString()}"`;
  }

  if (R.isNumber(constant)) {
    return constant.toString();
  }

  if (R.isBoolean(constant)) {
    return context.t(`common:${constant}`);
  }

  // Handle other cases when needed
  return JSON.stringify(
    R.mapValues(constant, (constant) =>
      getConstantDisplayName(constant, context),
    ),
  );
}

function getTimeAddDisplayName(
  astNode: TimeAddAstNode,
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

function getAggregatorDisplayName(
  astNode: AggregationAstNode,
  context: { t: TFunctionDisplayName },
) {
  const { aggregator, label } = astNode.namedChildren;
  if (label?.constant !== undefined && label?.constant !== '') {
    return label?.constant;
  }
  const aggregatorName = aggregator.constant;
  if (isAggregatorOperator(aggregatorName)) {
    return getOperatorName(context.t, aggregatorName);
  }
  // eslint-disable-next-line no-restricted-properties
  if (process.env.NODE_ENV === 'development') {
    console.warn('Unhandled aggregator', aggregatorName);
  }
  return aggregatorName;
}

function getFuzzyMatchComparatorDisplayName(
  astNode: FuzzyMatchComparatorAstNode,
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
