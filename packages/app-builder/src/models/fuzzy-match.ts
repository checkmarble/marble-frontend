import { type TFunction } from 'i18next';
import { assertNever } from 'typescript-utils';

export const fuzzyMatchAlgorithms = [
  'ratio',
  'partial_ratio',
  'token_sort_ratio',
  'partial_token_sort_ratio',
  'token_set_ratio',
  'partial_token_set_ratio',
] as const;
export type FuzzyMatchAlgorithm = (typeof fuzzyMatchAlgorithms)[number];

export function isFuzzyMatchAlgorithm(
  value: string,
): value is FuzzyMatchAlgorithm {
  return (fuzzyMatchAlgorithms as ReadonlyArray<string>).includes(value);
}

export function getFuzzyMatchAlgorithmName(
  t: TFunction<['common', 'scenarios'], undefined>,
  fuzzyMatchAlgorithm: string,
) {
  if (isFuzzyMatchAlgorithm(fuzzyMatchAlgorithm)) {
    switch (fuzzyMatchAlgorithm) {
      case 'ratio':
        return 'ratio';
      case 'partial_ratio':
        return 'partial_ratio';
      case 'token_sort_ratio':
        return 'token_sort_ratio';
      case 'partial_token_sort_ratio':
        return 'partial_token_sort_ratio';
      case 'token_set_ratio':
        return 'token_set_ratio';
      case 'partial_token_set_ratio':
        return 'partial_token_set_ratio';
      default:
        assertNever('Untranslated fuzzy match algorithm', fuzzyMatchAlgorithm);
    }
  }
  // eslint-disable-next-line no-restricted-properties
  if (process.env.NODE_ENV === 'development') {
    console.warn('Unhandled fuzzy match algorithm', fuzzyMatchAlgorithm);
  }
  return fuzzyMatchAlgorithm;
}

export const editableFuzzyMatchAlgorithms = [
  'ratio',
  'token_set_ratio',
] satisfies FuzzyMatchAlgorithm[];
type EditableFuzzyMatchAlgorithm =
  (typeof editableFuzzyMatchAlgorithms)[number];

export function isEditableFuzzyMatchAlgorithm(
  value: string,
): value is EditableFuzzyMatchAlgorithm {
  return (editableFuzzyMatchAlgorithms as ReadonlyArray<string>).includes(
    value,
  );
}

export const defaultEditableFuzzyMatchAlgorithm = 'token_set_ratio';

export const defaultFuzzyMatchComparatorThreshold = 85;

export const fuzzyMatchComparatorLevelData = [
  { level: 'medium', threshold: 70 },
  { level: 'high', threshold: 85 },
] as const;
export type FuzzyMatchComparatorLevel =
  (typeof fuzzyMatchComparatorLevelData)[number]['level'];

export function adaptFuzzyMatchComparatorLevel(threshold: number) {
  return fuzzyMatchComparatorLevelData.find(
    (data) => data.threshold === threshold,
  )?.level;
}

export function adaptFuzzyMatchComparatorThreshold(
  level: FuzzyMatchComparatorLevel,
) {
  return (
    fuzzyMatchComparatorLevelData.find((data) => data.level === level)
      ?.threshold ?? defaultFuzzyMatchComparatorThreshold
  );
}
