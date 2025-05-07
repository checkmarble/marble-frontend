import {
  type ComparatorFuzzyMatchAlgorithms,
  createBaseFuzzyMatchConfig,
} from './baseFuzzyMatchConfig';

/**
 * ComparatorFuzzyMatchConfig is a configuration object for fuzzy matching algorithms.
 * It defines the available algorithms, their default settings, and thresholds for matching levels.
 * This configuration is specifically used for the string similarity function.
 *
 * @type {BaseFuzzyMatchConfig}
 */
export const ComparatorFuzzyMatchConfig =
  createBaseFuzzyMatchConfig<ComparatorFuzzyMatchAlgorithms>({
    algorithms: new Set(['ratio', 'token_set_ratio', 'bag_of_words_similarity']),
    defaultAlgorithm: 'ratio',
    editablesAlgorithms: new Set(['ratio', 'token_set_ratio']),
    defaultEditableAlgorithm: 'token_set_ratio',

    thresholds: {
      medium: 70,
      high: 85,
    },
    defaultLevel: 'high',

    examples: [
      {
        left: 'Mr Mrs John Jane OR Doe Smith',
        right: 'John Doe',
        resultsScores: {
          ratio: 43,
          token_set_ratio: 100,
        },
      },
      {
        left: 'the dog was walking on the sidewalk',
        right: "the d og as walkin' on the side alk",
        resultsScores: {
          ratio: 91,
          token_set_ratio: 72,
        },
      },
    ],
  });
