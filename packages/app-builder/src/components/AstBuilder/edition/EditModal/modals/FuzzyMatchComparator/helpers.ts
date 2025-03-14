import {
  type fuzzyMatchAnyOfAstNodeName,
  type fuzzyMatchAstNodeName,
} from '@app-builder/models/astNode/strings';
import { type ParseKeys } from 'i18next';

export const funcNameTKeys = {
  FuzzyMatch: 'scenarios:edit_fuzzy_match.fuzzy_match',
  FuzzyMatchAnyOf: 'scenarios:edit_fuzzy_match.fuzzy_match_any_of',
} satisfies Record<
  typeof fuzzyMatchAnyOfAstNodeName | typeof fuzzyMatchAstNodeName,
  ParseKeys<['scenarios']>
>;
