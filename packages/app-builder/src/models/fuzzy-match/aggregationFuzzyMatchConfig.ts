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
      low: 35,
      medium: 55,
      high: 70,
    },
    defaultLevel: 'medium',
    examples: [
      {
        left: 'Cabinet Dupond',
        right: 'Jean-Charles Dupond',
        resultsScores: {
          bag_of_words_similarity_db: 47,
          direct_string_similarity_db: 29,
        },
      },
      {
        left: 'Mr Mrs John Jane OR Doe Smith',
        right: 'John Doe',
        resultsScores: {
          bag_of_words_similarity_db: 33,
          direct_string_similarity_db: 33,
        },
      },
      {
        left: 'the dog was walking on the sidewalk',
        right: "the d og as walkin' on the side alk",
        resultsScores: {
          bag_of_words_similarity_db: 62,
          direct_string_similarity_db: 62,
        },
      },
    ],
  });
