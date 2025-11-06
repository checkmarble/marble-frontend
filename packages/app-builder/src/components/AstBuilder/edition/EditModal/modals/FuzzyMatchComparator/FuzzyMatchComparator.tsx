import { OperandEditModalContainer } from '@app-builder/components/AstBuilder/edition/EditModal/Container';
import { funcNameTKeys } from '@app-builder/components/AstBuilder/edition/EditModal/modals/FuzzyMatchComparator/helpers';
import { InnerEditFuzzyMatchModal } from '@app-builder/components/AstBuilder/edition/EditModal/modals/FuzzyMatchComparator/InnerFuzzyMatchModal';
import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import { type FuzzyMatchComparatorAstNode } from '@app-builder/models/astNode/strings';
import { type BaseFuzzyMatchConfig } from '@app-builder/models/fuzzy-match/baseFuzzyMatchConfig';
import { ComparatorFuzzyMatchConfig } from '@app-builder/models/fuzzy-match/comparatorFuzzyMatchConfig';
import { getAstNodeDataType } from '@app-builder/services/ast-node/getAstNodeDataType';
import { computed } from '@preact/signals-react';
import { useTranslation } from 'react-i18next';

import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { type OperandEditModalProps } from '../../EditModal';

const fuzzyMatchConfig: BaseFuzzyMatchConfig = ComparatorFuzzyMatchConfig;

export function EditFuzzyMatchComparator(props: Omit<OperandEditModalProps, 'node'>) {
  const { t } = useTranslation(['scenarios']);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();

  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const dataModel = dataSharp.select((s) => s.data.dataModel);
  const triggerObjectTable = dataSharp.computed.triggerObjectTable;
  const node = nodeSharp.select((s) => s.node as FuzzyMatchComparatorAstNode);
  const fuzzyMatchNode = node.children[0];
  const algorithmNode = fuzzyMatchNode.namedChildren.algorithm;
  const thresholdNode = node.children[1];
  const thresholdField = computed(() => {
    const thresholdValue = thresholdNode.constant ?? fuzzyMatchConfig.getDefaultThreshold();
    const level = fuzzyMatchConfig.adaptLevel(thresholdValue);
    return level !== undefined
      ? ({ mode: 'level', value: thresholdValue, level } as const)
      : ({ mode: 'threshold', value: thresholdValue } as const);
  });

  return (
    <OperandEditModalContainer {...props} title={t('scenarios:edit_fuzzy_match.title')} size="medium">
      <InnerEditFuzzyMatchModal
        fuzzMatchConfig={fuzzyMatchConfig}
        operatorDisplay={t(funcNameTKeys[fuzzyMatchNode.name])}
        left={fuzzyMatchNode.children[0]}
        right={fuzzyMatchNode.children[1]}
        algorithm={algorithmNode.constant ?? fuzzyMatchConfig.defaultAlgorithm}
        threshold={thresholdField.value}
        rightOperandFilter={(option) =>
          option.operandType === 'CustomList' || ['String', 'String[]'].includes(option.dataType)
        }
        onLeftChange={(newNode) => {
          fuzzyMatchNode.children[0] = newNode;
          nodeSharp.actions.validate();
        }}
        onRightChange={(newNode) => {
          nodeSharp.update(() => {
            fuzzyMatchNode.name =
              getAstNodeDataType(newNode, {
                dataModel,
                triggerObjectTable: triggerObjectTable.value,
              }) === 'String'
                ? 'FuzzyMatch'
                : 'FuzzyMatchAnyOf';
            fuzzyMatchNode.children[1] = newNode;
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
