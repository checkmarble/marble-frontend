import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import { Callout } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { type KnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { type FuzzyMatchComparatorAstNode } from '@app-builder/models/astNode/strings';
import {
  adaptFuzzyMatchComparatorLevel,
  adaptFuzzyMatchComparatorThreshold,
  defaultFuzzyMatchComparatorThreshold,
} from '@app-builder/models/fuzzy-match';
import { getAstNodeDataType } from '@app-builder/services/ast-node/getAstNodeDataType';
import { fuzzyMatchingDocHref } from '@app-builder/services/documentation-href';
import { computed } from '@preact/signals-react';
import { Trans, useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';

import { EditionAstBuilderOperand } from '../../../EditionOperand';
import { EditionEvaluationErrors } from '../../../EvaluationErrors';
import { getValidationStatus } from '../../../helpers';
import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { OperandEditModalContainer } from '../../Container';
import { type OperandEditModalProps } from '../../EditModal';
import { EditAlgorithm } from './EditAlgorithm';
import { EditLevel } from './EditLevel';
import { EditThreshold } from './EditThreshold';
import { Examples } from './Examples';
import { funcNameTKeys } from './helpers';

export function EditFuzzyMatchComparator(props: Omit<OperandEditModalProps, 'node'>) {
  const { t } = useTranslation(['scenarios']);
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const dataModel = dataSharp.select((s) => s.data.dataModel);
  const triggerObjectTable = dataSharp.computed.triggerObjectTable;
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node as FuzzyMatchComparatorAstNode);
  const evaluation = nodeSharp.select((s) => s.evaluation);
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
      <Callout variant="outlined">
        <Modal.Description>
          <Trans
            t={t}
            i18nKey="scenarios:edit_fuzzy_match.description"
            components={{
              DocLink: <ExternalLink href={fuzzyMatchingDocHref} />,
            }}
          />
        </Modal.Description>
      </Callout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-4">
          <EditAlgorithm
            node={algorithmNode}
            onChange={(value) => {
              algorithmNode.constant = value;
              nodeSharp.actions.validate();
            }}
          />
          {thresholdField.value.mode === 'level' ? (
            <EditLevel
              level={thresholdField.value.level}
              setLevel={(level) => {
                thresholdNode.constant = adaptFuzzyMatchComparatorThreshold(level);
                nodeSharp.actions.validate();
              }}
            />
          ) : (
            <EditThreshold
              threshold={thresholdField.value.value}
              setThreshold={(newValue) => {
                thresholdNode.constant = newValue;
                nodeSharp.actions.validate();
              }}
            />
          )}
        </div>
        <Examples algorithm={algorithmNode.constant} threshold={thresholdNode.constant} />
      </div>
      <div className="flex flex-col gap-2">
        <p id="level" className="text-m text-grey-00 font-normal">
          {t('scenarios:edit_fuzzy_match.operands.label')}
        </p>
        <div className="flex gap-2">
          <EditionAstBuilderOperand
            node={fuzzyMatchNode.children[0] as KnownOperandAstNode}
            coerceDataType={['String']}
            optionsDataType={['String']}
            onChange={(newNode) => {
              fuzzyMatchNode.children[0] = newNode;
              nodeSharp.actions.validate();
            }}
            validationStatus={getValidationStatus(evaluation, fuzzyMatchNode.children[0].id)}
          />
          <div className="border-grey-90 bg-grey-98 flex h-10 w-fit min-w-[40px] items-center justify-center rounded border p-2 text-center">
            <span className="text-s text-grey-00 font-medium">
              {t(funcNameTKeys[fuzzyMatchNode.name])}
            </span>
          </div>
          <EditionAstBuilderOperand
            node={fuzzyMatchNode.children[1] as KnownOperandAstNode}
            coerceDataType={['String', 'String[]']}
            optionsDataType={(option) => {
              return (
                option.operandType === 'CustomList' ||
                ['String', 'String[]'].includes(option.dataType)
              );
            }}
            onChange={(newNode) => {
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
            validationStatus={getValidationStatus(evaluation, fuzzyMatchNode.children[1].id)}
          />
        </div>
        <EditionEvaluationErrors id={fuzzyMatchNode.id} />
      </div>
    </OperandEditModalContainer>
  );
}
