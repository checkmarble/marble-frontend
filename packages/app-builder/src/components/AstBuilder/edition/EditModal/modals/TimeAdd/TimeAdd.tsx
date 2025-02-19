import { Callout } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { isTimestampFieldAstNode, type TimeAddAstNode } from '@app-builder/models/astNode/time';
import { timeAddOperators } from '@app-builder/models/modale-operators';
import { dateDocHref } from '@app-builder/services/documentation-href';
import { computed } from '@preact/signals-react';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Temporal } from 'temporal-polyfill';
import { Input, Modal } from 'ui-design-system';

import { EditionAstBuilderOperand } from '../../../EditionOperand';
import { EditionEvaluationErrors } from '../../../EvaluationErrors';
import { getValidationStatus } from '../../../helpers';
import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { OperatorSelect } from '../../../OperatorSelect';
import { OperandEditModalContainer } from '../../Container';
import { type OperandEditModalProps } from '../../EditModal';
import { type DurationUnit, DurationUnitSelect } from './DurationUnitSelect';
import { adaptDurationAndUnitFromTemporalDuration } from './helpers';

export const defaultISO8601Duration = 'PT0S';
function getTemporalDuration(duration: number, durationUnit: DurationUnit) {
  return Temporal.Duration.from({ [durationUnit]: duration }).toString();
}

export function EditTimeAdd(props: Omit<OperandEditModalProps, 'node'>) {
  const { t } = useTranslation(['scenarios']);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node as TimeAddAstNode);
  const evaluation = nodeSharp.select((s) => s.evaluation);
  const durationData = computed(() => {
    const durationNode = node.namedChildren.duration;
    const iso8601Duration =
      durationNode.constant !== '' ? durationNode.constant : defaultISO8601Duration;
    const temporalDuration = Temporal.Duration.from(iso8601Duration).round('seconds');
    return adaptDurationAndUnitFromTemporalDuration(temporalDuration);
  });
  const [selectedDurationUnit, setSelectedDurationUnit] = useState<DurationUnit>(
    durationData.value.durationUnit,
  );

  useEffect(() => {
    node.namedChildren.duration.constant = getTemporalDuration(
      durationData.value.duration,
      selectedDurationUnit,
    );
    nodeSharp.actions.validate();
  }, [nodeSharp, node, durationData.value.duration, selectedDurationUnit]);

  return (
    <OperandEditModalContainer {...props} title={t('scenarios:edit_date.title')} size="small">
      <Callout variant="outlined">
        <Modal.Description className="whitespace-pre text-wrap">
          <Trans
            t={t}
            i18nKey="scenarios:edit_date.description"
            components={{
              DocLink: <ExternalLink href={dateDocHref} />,
            }}
          />
        </Modal.Description>
      </Callout>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <EditionAstBuilderOperand
            node={node.namedChildren.timestampField}
            onChange={(newNode) => {
              if (isTimestampFieldAstNode(newNode)) {
                node.namedChildren.timestampField = newNode;
                nodeSharp.actions.validate();
              }
            }}
            coerceDataType={['Timestamp']}
            optionsDataType={['Timestamp']}
            validationStatus={getValidationStatus(evaluation, node.namedChildren.timestampField.id)}
          />
          <OperatorSelect
            options={timeAddOperators}
            operator={node.namedChildren.sign.constant}
            onOperatorChange={(sign) => {
              node.namedChildren.sign.constant = sign;
              nodeSharp.actions.validate();
            }}
            validationStatus={getValidationStatus(evaluation, node.namedChildren.sign.id)}
          />
          <Input
            value={durationData.value.duration ?? undefined}
            onChange={(e) => {
              node.namedChildren.duration.constant = getTemporalDuration(
                e.target.valueAsNumber,
                durationData.value.durationUnit,
              );
              nodeSharp.actions.validate();
            }}
            min="0"
            placeholder="0"
            type="number"
            className="basis-[60px]"
          />
          <DurationUnitSelect value={selectedDurationUnit} onChange={setSelectedDurationUnit} />
        </div>
        <EditionEvaluationErrors id={node.id} filterOut={['FUNCTION_ERROR']} />
      </div>
    </OperandEditModalContainer>
  );
}
