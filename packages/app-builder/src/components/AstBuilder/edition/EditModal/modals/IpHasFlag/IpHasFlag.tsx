import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import { Callout } from '@app-builder/components/Callout';
import { IpHasFlagAstNode, isIpFieldAstNode, validIpFlags } from '@app-builder/models/astNode/ip';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';
import { EditionAstBuilderOperand } from '../../../EditionOperand';
import { EditionEvaluationErrors } from '../../../EvaluationErrors';
import { getValidationStatus } from '../../../helpers';
import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { OperatorSelect } from '../../../OperatorSelect';
import { OperandEditModalContainer } from '../../Container';
import { type OperandEditModalProps } from '../../EditModal';

export function EditIpHasFlag(props: Omit<OperandEditModalProps, 'node'>) {
  const { t } = useTranslation(['scenarios', 'common']);
  const hasValidLicense = AstBuilderDataSharpFactory.select((s) => s.data.hasValidLicense);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node as IpHasFlagAstNode);
  const evaluation = nodeSharp.select((s) => s.validation);

  return (
    <OperandEditModalContainer
      {...props}
      saveDisabled={!hasValidLicense}
      title={t('scenarios:edit_ip_has_flag.title')}
      size="medium"
    >
      <Callout variant="outlined">
        <Modal.Description className="whitespace-pre-wrap">
          {t('scenarios:edit_ip_has_flag.description')}
        </Modal.Description>
      </Callout>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="first-letter:uppercase">{t('scenarios:edit_ip_has_flag.extract')}</span>
          <OperatorSelect
            options={validIpFlags}
            operator={node.namedChildren.flag.constant}
            onOperatorChange={(part) => {
              node.namedChildren.flag.constant = part;
              nodeSharp.actions.validate();
            }}
          />
          <span>{t('scenarios:edit_ip_has_flag.from')}</span>
          <EditionAstBuilderOperand
            node={node.namedChildren.ip}
            onChange={(newNode) => {
              if (isIpFieldAstNode(newNode)) {
                node.namedChildren.ip = newNode;
                nodeSharp.actions.validate();
              }
            }}
            optionsDataType={['IpAddress']}
            coerceDataType={['IpAddress']}
            validationStatus={getValidationStatus(evaluation, node.namedChildren.ip.id)}
          />
        </div>
        <EditionEvaluationErrors id={node.id} filterOut={['FUNCTION_ERROR']} />
      </div>
      {!hasValidLicense ? (
        <Callout icon="lock" variant="outlined" color="red">
          {t('scenarios:edit_ip_has_flag.premium_callout')}
        </Callout>
      ) : null}
    </OperandEditModalContainer>
  );
}
