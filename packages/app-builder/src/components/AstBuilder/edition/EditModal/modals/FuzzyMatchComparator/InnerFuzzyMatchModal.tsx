import { Callout } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { type AstNode, type DataType } from '@app-builder/models';
import { type KnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import {
  type BaseFuzzyMatchConfig,
  type FuzzyMatchAlgorithm,
  type Level,
} from '@app-builder/models/fuzzy-match/baseFuzzyMatchConfig';
import { fuzzyMatchingDocHref } from '@app-builder/services/documentation-href';
import { Trans, useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';

import { EditionAstBuilderOperand } from '../../../EditionOperand';
import { type EnrichedMenuOption, getValidationStatus } from '../../../helpers';
import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { EditAlgorithm } from './EditAlgorithm';
import { EditLevel } from './EditLevel';
import { EditThreshold } from './EditThreshold';
import { Examples } from './Examples';

export type ThresholdField =
  | {
      readonly mode: 'level';
      readonly value: number;
      readonly level: Level;
    }
  | {
      readonly mode: 'threshold';
      readonly value: number;
      readonly level?: undefined;
    };

export type InnerEditFuzzyMatchModalProps = {
  fuzzMatchConfig: BaseFuzzyMatchConfig;
  operatorDisplay?: string;
  left?: AstNode;
  onLeftChange?: (node: AstNode) => void;
  right: AstNode;
  onRightChange: (node: AstNode) => void;
  threshold: ThresholdField;
  onThresholdChange: (
    options:
      | { mode: 'level'; level: 'low' | 'medium' | 'high' }
      | { mode: 'threshold'; value: number },
  ) => void;
  algorithm: FuzzyMatchAlgorithm;
  onAlorithmChange: (algorithm: FuzzyMatchAlgorithm) => void;
  rightOperandFilter?: DataType[] | ((o: EnrichedMenuOption) => boolean);
};

export function InnerEditFuzzyMatchModal(props: InnerEditFuzzyMatchModalProps) {
  const { t } = useTranslation(['scenarios']);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const evaluation = nodeSharp.select((s) => s.validation);

  console.log(props.threshold); //RM
  return (
    <>
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
            fuzzyMatchConfig={props.fuzzMatchConfig}
            algorithm={props.algorithm}
            onChange={(value) => {
              props.onAlorithmChange(value);
            }}
          />
          {props.threshold.mode === 'level' ? (
            <EditLevel
              config={props.fuzzMatchConfig}
              level={props.threshold.level}
              setLevel={(level) => {
                props.onThresholdChange({ mode: 'level', level });
              }}
            />
          ) : (
            <EditThreshold
              threshold={props.threshold.value}
              setThreshold={(newValue) => {
                props.onThresholdChange({ mode: 'threshold', value: newValue });
              }}
            />
          )}
        </div>
        <Examples
          config={props.fuzzMatchConfig}
          algorithm={props.algorithm}
          threshold={props.threshold.value}
        />
      </div>
      <div className="flex flex-col gap-2">
        <p id="level" className="text-m text-grey-00 font-normal">
          {t('scenarios:edit_fuzzy_match.operands.label')}
        </p>
        <div className="flex gap-2">
          {props.left ? (
            <>
              <EditionAstBuilderOperand
                node={props.left as KnownOperandAstNode}
                coerceDataType={['String']}
                optionsDataType={['String']}
                onChange={(newNode) => {
                  props.onLeftChange?.(newNode);
                }}
                validationStatus={getValidationStatus(evaluation, props.left.id)}
              />
              <div className="border-grey-90 bg-grey-98 flex h-10 w-fit min-w-[40px] items-center justify-center rounded border p-2 text-center">
                <span className="text-s text-grey-00 font-medium">{props.operatorDisplay}</span>
              </div>
            </>
          ) : null}
          <EditionAstBuilderOperand
            node={props.right as KnownOperandAstNode}
            coerceDataType={['String', 'String[]']}
            optionsDataType={props.rightOperandFilter}
            onChange={(newNode) => {
              props.onRightChange(newNode);
            }}
            validationStatus={getValidationStatus(evaluation, props.right.id)}
          />
        </div>
      </div>
    </>
  );
}
