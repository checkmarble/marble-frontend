import { type FuzzyMatchFilterOptionsAstNode } from '@app-builder/models/astNode/aggregation';
import { isKnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import {
  adaptFuzzyMatchComparatorLevel,
  adaptFuzzyMatchComparatorThreshold,
  defaultFuzzyMatchComparatorThreshold,
} from '@app-builder/models/fuzzy-match';
import { computed } from '@preact/signals-react';
import { useTranslation } from 'react-i18next';

import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { OperandEditModalContainer } from '../../Container';
import { type OperandEditModalProps } from '../../EditModal';
import { InnerEditFuzzyMatchModal } from './InnerFuzzyMatchModal';

export function EditFuzzyMatchAggregation(props: Omit<OperandEditModalProps, 'node'>) {
  const { t } = useTranslation(['scenarios']);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const fuzzyMatchNode = nodeSharp.select((s) => s.node as FuzzyMatchFilterOptionsAstNode);
  const algorithmNode = fuzzyMatchNode.namedChildren.algorithm;
  const thresholdNode = fuzzyMatchNode.namedChildren.threshold;
  const thresholdField = computed(() => {
    const thresholdValue = thresholdNode.constant ?? defaultFuzzyMatchComparatorThreshold;
    const level = adaptFuzzyMatchComparatorLevel(thresholdValue);
    return level !== undefined
      ? ({ mode: 'level', value: thresholdValue, level } as const)
      : ({ mode: 'threshold', value: thresholdValue } as const);
  });

  return (
    <OperandEditModalContainer
      {...props}
      title={t('scenarios:edit_fuzzy_match.title')}
      size="medium"
    >
      <InnerEditFuzzyMatchModal
        right={fuzzyMatchNode.namedChildren.value}
        algorithm={algorithmNode.constant}
        threshold={thresholdField.value}
        onRightChange={(newNode) => {
          nodeSharp.update(() => {
            if (isKnownOperandAstNode(newNode)) {
              fuzzyMatchNode.namedChildren.value = newNode;
            }
          });
          nodeSharp.actions.validate();
        }}
        onAlorithmChange={(algorithm) => {
          algorithmNode.constant = algorithm;
        }}
        onThresholdChange={(params) => {
          if (params.mode === 'threshold') {
            thresholdNode.constant = params.value;
          } else {
            thresholdNode.constant = adaptFuzzyMatchComparatorThreshold(params.level);
          }
        }}
      />
    </OperandEditModalContainer>
  );
}
