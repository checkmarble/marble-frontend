import { Callout } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import {
  isTimestampFieldAstNode,
  type TimestampExtractAstNode,
  validTimestampExtractParts,
} from '@app-builder/models/astNode/time';
import { dateDocHref } from '@app-builder/services/documentation-href';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { Trans, useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';

import { EditionAstBuilderOperand } from '../../../EditionOperand';
import { EditionEvaluationErrors } from '../../../EvaluationErrors';
import { getValidationStatus } from '../../../helpers';
import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { OperatorSelect } from '../../../OperatorSelect';
import { OperandEditModalContainer } from '../../Container';
import { type OperandEditModalProps } from '../../EditModal';
import { getNoTimezoneSetupWarning, returnTimestampExtractInformation } from './helpers';

export function EditTimestampExtract(props: Omit<OperandEditModalProps, 'node'>) {
  const { t } = useTranslation(['scenarios', 'common']);
  // TODO: I don't about calling a Remix service from here, we should find a way to rework this
  const { org, currentUser } = useOrganizationDetails();
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node as TimestampExtractAstNode);
  const evaluation = nodeSharp.select((s) => s.validation);

  return (
    <OperandEditModalContainer {...props} title={t('scenarios:edit_timestamp_extract.title')} size="medium">
      <Callout variant="outlined">
        <Modal.Description className="whitespace-pre-wrap">
          <Trans
            t={t}
            i18nKey="scenarios:edit_timestamp_extract.description"
            components={{
              DocLink: <ExternalLink href={dateDocHref} />,
            }}
          />
        </Modal.Description>
      </Callout>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="first-letter:uppercase">{t('scenarios:edit_timestamp_extract.extract_the')}</span>
          <OperatorSelect
            options={validTimestampExtractParts}
            operator={node.namedChildren.part.constant}
            onOperatorChange={(part) => {
              node.namedChildren.part.constant = part;
              nodeSharp.actions.validate();
            }}
          />
          <span>{t('scenarios:edit_timestamp_extract.from')}</span>
          <EditionAstBuilderOperand
            node={node.namedChildren.timestamp}
            // astNodeErrors={viewModel.timestampField.astNodeErrors}
            onChange={(newNode) => {
              if (isTimestampFieldAstNode(newNode)) {
                node.namedChildren.timestamp = newNode;
                nodeSharp.actions.validate();
              }
            }}
            optionsDataType={['Timestamp']}
            coerceDataType={['Timestamp']}
            validationStatus={getValidationStatus(evaluation, node.namedChildren.timestamp.id)}
          />
        </div>
        <EditionEvaluationErrors id={node.id} filterOut={['FUNCTION_ERROR']} />
      </div>
      <p>{returnTimestampExtractInformation(t, node.namedChildren.part.constant)}</p>
      <p>
        {org.defaultScenarioTimezone
          ? t('scenarios:edit_timestamp_extract.interpreted_in_timezone', {
              replace: { timezone: org.defaultScenarioTimezone },
            })
          : getNoTimezoneSetupWarning(currentUser, t)}
      </p>
    </OperandEditModalContainer>
  );
}
