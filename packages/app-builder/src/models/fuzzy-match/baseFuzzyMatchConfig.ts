import type { TFunction } from 'i18next';
import { assertNever } from 'typescript-utils';

export type ComparatorFuzzyMatchAlgorithms =
  | 'ratio'
  | 'token_set_ratio'
  | 'bag_of_words_similarity';

export type AggregationFuzzyMatchAlgorithms =
  | 'bag_of_words_similarity_db'
  | 'direct_string_similarity_db';

export type FuzzyMatchAlgorithm = ComparatorFuzzyMatchAlgorithms | AggregationFuzzyMatchAlgorithms;

export type Level = 'medium' | 'high';

export type FuzzyMatchExampleCase = {
  left: string;
  right: string;
  resultsScores: Partial<Record<FuzzyMatchAlgorithm, number>>;
};

export interface BaseFuzzyMatchConfig {
  readonly algorithms: ReadonlySet<FuzzyMatchAlgorithm>;
  readonly defaultAlgorithm: FuzzyMatchAlgorithm;
  readonly editablesAlgorithms: ReadonlySet<FuzzyMatchAlgorithm>;
  readonly defaultEditableAlgorithm: FuzzyMatchAlgorithm;
  readonly thresholds: Record<Level, number>;
  readonly defaultLevel: Level;
  readonly examples: FuzzyMatchExampleCase[];

  getLevels(): Level[];
  getDefaultThreshold(): number;
  isAlgorithm(value: string): boolean;
  isEditableAlgorithm(value: string): boolean;
  getAlgorithmName(
    t: TFunction<['common', 'scenarios'], undefined>,
    algorithm: FuzzyMatchAlgorithm,
  ): string;
  adaptLevel(threshold: number): Level | undefined;
  adaptThreshold(level: Level): number;
}

type FuzzyMatchConfigParams<T extends FuzzyMatchAlgorithm> = {
  readonly algorithms: ReadonlySet<T>;
  readonly defaultAlgorithm: T;
  readonly editablesAlgorithms: ReadonlySet<T>;
  readonly defaultEditableAlgorithm: T;
  readonly thresholds: Record<Level, number>;
  readonly defaultLevel: Level;
  readonly examples: FuzzyMatchExampleCase[];
};

export function createBaseFuzzyMatchConfig<T extends FuzzyMatchAlgorithm>(
  config: FuzzyMatchConfigParams<T>,
): BaseFuzzyMatchConfig {
  if (!config.algorithms.has(config.defaultAlgorithm)) {
    throw new Error(
      `Invalid configuration: defaultAlgorithm "${String(config.defaultAlgorithm)}" is not a member of algorithms.`,
    );
  }

  if (![...config.editablesAlgorithms].every((editable) => config.algorithms.has(editable))) {
    throw new Error(
      'Invalid configuration: editablesAlgorithms contains values that are not members of algorithms.',
    );
  }

  if (!config.editablesAlgorithms.has(config.defaultEditableAlgorithm)) {
    throw new Error(
      `Invalid configuration: defaultEditableAlgorithm "${String(config.defaultEditableAlgorithm)}" is not a member of editablesAlgorithms.`,
    );
  }

  if (!(config.defaultLevel in config.thresholds)) {
    throw new Error(
      `Invalid configuration: defaultLevel "${config.defaultLevel}" is not a key of thresholds.`,
    );
  }

  return {
    ...config,
    getDefaultThreshold: (): number => config.thresholds[config.defaultLevel],
    getLevels: (): Level[] => Object.keys(config.thresholds) as Level[],
    isAlgorithm: (value: string): boolean => config.algorithms.has(value as T),
    isEditableAlgorithm: (value: string): boolean => config.editablesAlgorithms.has(value as T),
    getAlgorithmName: (
      t: TFunction<['common', 'scenarios'], undefined>,
      fuzzyMatchAlgorithm: T,
    ): string => {
      switch (fuzzyMatchAlgorithm) {
        case 'ratio':
          return t('scenarios:edit_fuzzy_match.algorithm.ratio');
        case 'token_set_ratio':
        case 'bag_of_words_similarity':
          return t('scenarios:edit_fuzzy_match.algorithm.token_set_ratio');
        case 'bag_of_words_similarity_db':
          return t('scenarios:edit_fuzzy_match.algorithm.bag_of_words_similarity_db');
        case 'direct_string_similarity_db':
          return t('scenarios:edit_fuzzy_match.algorithm.direct_string_similarity_db');
        default:
          return assertNever('Untranslated fuzzy match algorithm', fuzzyMatchAlgorithm);
      }
    },
    adaptLevel: (threshold: number): Level | undefined =>
      (Object.entries(config.thresholds).find(([_, value]) => value === threshold)?.[0] as Level) ||
      undefined,
    adaptThreshold: (level: Level): number =>
      config.thresholds[level] ?? config.thresholds[config.defaultLevel],
  };
}
