import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import { type FuzzyMatchComparatorAstNode } from '@app-builder/models/astNode/strings';
import {
  adaptFuzzyMatchComparatorLevel,
  adaptFuzzyMatchComparatorThreshold,
  defaultFuzzyMatchComparatorThreshold,
} from '@app-builder/models/fuzzy-match';
import { getAstNodeDataType } from '@app-builder/services/ast-node/getAstNodeDataType';
import { computed } from '@preact/signals-react';
import { useTranslation } from 'react-i18next';

import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { OperandEditModalContainer } from '../../Container';
import { type OperandEditModalProps } from '../../EditModal';
import { funcNameTKeys } from './helpers';
import { InnerEditFuzzyMatchModal } from './InnerFuzzyMatchModal';

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
        operatorDisplay={t(funcNameTKeys[fuzzyMatchNode.name])}
        left={fuzzyMatchNode.children[0]}
        right={fuzzyMatchNode.children[1]}
        algorithm={algorithmNode.constant}
        threshold={thresholdField.value}
        rightOperandFilter={(option) =>
          ['String', 'String[]'].includes(
            getAstNodeDataType(fuzzyMatchNode.children[1], {
              dataModel,
              triggerObjectTable: triggerObjectTable.value,
            }),
          ) || option.operandType === 'CustomList'
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
            thresholdNode.constant = adaptFuzzyMatchComparatorThreshold(params.level);
          }
        }}
      />
    </OperandEditModalContainer>
  );
}
