import {
  type AggregationFuzzyMatchAlgorithms,
  createBaseFuzzyMatchConfig,
} from './baseFuzzyMatchConfig';

/**
 * AggregationFuzzyMatchConfig is a configuration object for fuzzy matching algorithms.
 * It defines the available algorithms, their default settings, and thresholds for matching levels.
 * This configuration is specifically used for the aggregate filter.
 *
 * @type {BaseFuzzyMatchConfig}
 */

export const AggregationFuzzyMatchConfig =
  createBaseFuzzyMatchConfig<AggregationFuzzyMatchAlgorithms>({
    algorithms: new Set(['bag_of_words_similarity_db', 'direct_string_similarity_db']),
    defaultAlgorithm: 'bag_of_words_similarity_db',
    editablesAlgorithms: new Set(['bag_of_words_similarity_db', 'direct_string_similarity_db']),
    defaultEditableAlgorithm: 'bag_of_words_similarity_db',
    thresholds: {
      medium: 65,
      high: 80,
    },
    defaultLevel: 'medium',
    examples: [
      {
        left: 'Mr Mrs John Jane OR Doe Smith',
        right: 'John Doe',
        resultsScores: {
          bag_of_words_similarity_db: 43,
          direct_string_similarity_db: 100,
        },
      },
      {
        left: 'the dog was walking on the sidewalk',
        right: "the d og as walkin' on the side alk",
        resultsScores: {
          bag_of_words_similarity_db: 91,
          direct_string_similarity_db: 72,
        },
      },
    ],
  });
