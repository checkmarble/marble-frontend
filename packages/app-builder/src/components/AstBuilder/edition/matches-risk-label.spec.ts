import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import { isFuzzyMatchComparator, NewFuzzyMatchComparatorAstNode } from '@app-builder/models/astNode/strings';
import { ComparatorFuzzyMatchConfig } from '@app-builder/models/fuzzy-match/comparatorFuzzyMatchConfig';
import { getAstNodeDisplayName } from '@app-builder/services/ast-node/getAstNodeDisplayName';
import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';

import { AST_BUILDER_STATIC_OPTIONS } from './base-options';

describe('Matches risk label', () => {
  it('offers one fuzzy match function with an editable phrase_match algorithm', () => {
    const fuzzyFunctions = AST_BUILDER_STATIC_OPTIONS.map(({ astNode }) => astNode).filter(isFuzzyMatchComparator);

    expect(fuzzyFunctions).toHaveLength(1);
    expect(fuzzyFunctions[0]?.children[0].namedChildren.algorithm.constant).not.toBe('phrase_match');
    expect(ComparatorFuzzyMatchConfig.isAlgorithm('phrase_match')).toBe(true);
    expect(ComparatorFuzzyMatchConfig.isEditableAlgorithm('phrase_match')).toBe(true);
  });

  it('displays existing phrase_match nodes as ordinary string similarity functions', () => {
    const node = NewFuzzyMatchComparatorAstNode({
      funcName: 'FuzzyMatch',
      config: ComparatorFuzzyMatchConfig,
      algorithm: 'phrase_match',
    });
    const t = ((key: string) => key) as TFunction<['common', 'scenarios'], undefined>;
    const context = { t, language: 'en', customLists: [] };

    expect(getAstNodeDisplayName(node, context)).toBe('scenarios:edit_fuzzy_match.string_similarity');
    expect(ComparatorFuzzyMatchConfig.getAlgorithmName(t, 'phrase_match')).toBe(
      'scenarios:edit_fuzzy_match.algorithm.phrase_match',
    );

    node.children[0].children = [
      NewConstantAstNode({ constant: 'Payment for restricted goods' }),
      NewConstantAstNode({ constant: 'restricted goods' }),
    ];

    expect(getAstNodeDisplayName(node, context)).toBe('"Payment for restricted goods" ≈ "restricted goods"');
  });
});
