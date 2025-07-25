import { OperandEditModalContainer } from '@app-builder/components/AstBuilder/edition/EditModal/Container';
import { InnerEditFuzzyMatchModal } from '@app-builder/components/AstBuilder/edition/EditModal/modals/FuzzyMatchComparator/InnerFuzzyMatchModal';
import { type FuzzyMatchFilterOptionsAstNode } from '@app-builder/models/astNode/aggregation';
import { isKnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { AggregationFuzzyMatchConfig } from '@app-builder/models/fuzzy-match/aggregationFuzzyMatchConfig';
import { type BaseFuzzyMatchConfig } from '@app-builder/models/fuzzy-match/baseFuzzyMatchConfig';
import { computed } from '@preact/signals-react';
import { useTranslation } from 'react-i18next';

import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { type OperandEditModalProps } from '../../EditModal';

const fuzzyMatchConfig: BaseFuzzyMatchConfig = AggregationFuzzyMatchConfig;

export function EditFuzzyMatchAggregation(props: Omit<OperandEditModalProps, 'node'>) {
  const defaultAlgorithm = fuzzyMatchConfig.defaultAlgorithm;
  const defaultThreshold = fuzzyMatchConfig.getDefaultThreshold();

  const { t } = useTranslation(['scenarios']);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const fuzzyMatchNode = nodeSharp.select((s) => s.node as FuzzyMatchFilterOptionsAstNode);
  const algorithmNode = fuzzyMatchNode.namedChildren.algorithm;
  const thresholdNode = fuzzyMatchNode.namedChildren.threshold;
  const thresholdField = computed(() => {
    const thresholdValue = thresholdNode.constant ?? defaultThreshold;
    const level = fuzzyMatchConfig.adaptLevel(thresholdValue);
    return level !== undefined
      ? ({ mode: 'level', value: thresholdValue, level } as const)
      : ({ mode: 'threshold', value: thresholdValue } as const);
  });

  return (
    <OperandEditModalContainer
      {...props}
      title={t('scenarios:edit_fuzzy_match.title.aggregation')}
      size="medium"
    >
      <InnerEditFuzzyMatchModal
        fuzzMatchConfig={fuzzyMatchConfig}
        right={fuzzyMatchNode.namedChildren.value}
        algorithm={algorithmNode.constant ?? defaultAlgorithm}
        threshold={thresholdField.value}
        rightOperandFilter={(option) =>
          ['String', 'String[]'].includes(option.dataType) && option.operandType === 'Field'
        }
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
            thresholdNode.constant = fuzzyMatchConfig.adaptThreshold(params.level);
          }
        }}
      />
    </OperandEditModalContainer>
  );
}
