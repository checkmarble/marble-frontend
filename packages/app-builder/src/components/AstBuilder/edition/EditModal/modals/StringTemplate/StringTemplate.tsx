import { Callout } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { stringTemplatingDocHref } from '@app-builder/services/documentation-href';
import { Trans, useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';

import { OperandEditModalContainer } from '../../Container';
import { type OperandEditModalProps } from '../../EditModal';
import { StringTemplateForm } from './StringTemplateForm';

export function EditStringTemplate(props: Omit<OperandEditModalProps, 'node'>) {
  const { t } = useTranslation(['scenarios', 'common']);

  return (
    <OperandEditModalContainer
      {...props}
      title={t('scenarios:edit_string_template.title')}
      size="medium"
    >
      <Callout variant="outlined">
        <Modal.Description>
          <Trans
            t={t}
            i18nKey="scenarios:edit_string_template.description"
            components={{
              DocLink: <ExternalLink href={stringTemplatingDocHref} />,
            }}
          />
        </Modal.Description>
      </Callout>
      <StringTemplateForm />
    </OperandEditModalContainer>
  );
}
