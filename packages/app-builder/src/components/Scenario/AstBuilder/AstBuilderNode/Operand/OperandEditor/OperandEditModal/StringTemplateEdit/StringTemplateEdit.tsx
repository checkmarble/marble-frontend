import { Callout } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { type AstNode } from '@app-builder/models';
import {
  NewStringTemplateAstNode,
  type StringTemplateAstNode,
} from '@app-builder/models/astNode/strings';
import { stringTemplatingDocHref } from '@app-builder/services/documentation-href';
import {
  type AstNodeErrors,
  computeLineErrors,
} from '@app-builder/services/validation/ast-node-validation';
import { useEffect, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, ModalV2 } from 'ui-design-system';

import {
  extractVariablesNamesFromTemplate,
  useStringTemplateEditState,
} from './StringTemplateEdit.hook';
import { StringTemplateEditForm } from './StringTemplateEditForm';

export type StringTemplateEditProps = {
  initialNode: StringTemplateAstNode;
  initialErrors?: AstNodeErrors;
  onSave: (node: AstNode) => void;
  onEdit?: (node: AstNode) => void;
};

export const StringTemplateEdit = ({
  initialNode,
  initialErrors,
  onSave,
  onEdit,
}: StringTemplateEditProps) => {
  const { t } = useTranslation(['scenarios', 'common']);
  const state = useStringTemplateEditState(initialNode, initialErrors);
  const newNodeRef = useRef<AstNode>(initialNode);
  const hasErrors = initialErrors
    ? computeLineErrors(newNodeRef.current, initialErrors).length > 0
    : false;

  useEffect(() => {
    const template = state.template;
    const variableNames = extractVariablesNamesFromTemplate(template);
    const variables = R.pick(state.variables, variableNames);

    newNodeRef.current = NewStringTemplateAstNode(template, variables);

    onEdit?.(newNodeRef.current);
  }, [state.template, state.variables, onEdit]);

  const handleSave = () => {
    onSave(newNodeRef.current);
  };

  return (
    <>
      <ModalV2.Title>{t('scenarios:edit_string_template.title')}</ModalV2.Title>
      <div className="flex flex-col gap-9 p-6">
        <Callout variant="outlined">
          <ModalV2.Description>
            <Trans
              t={t}
              i18nKey="scenarios:edit_string_template.description"
              components={{
                DocLink: <ExternalLink href={stringTemplatingDocHref} />,
              }}
            />
          </ModalV2.Description>
        </Callout>
        <StringTemplateEditForm {...state} errors={initialErrors} />
        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close
            render={
              <Button className="flex-1" variant="secondary" name="cancel" />
            }
          >
            {t('common:cancel')}
          </ModalV2.Close>
          <Button
            disabled={hasErrors}
            className="flex-1"
            variant="primary"
            name="save"
            onClick={() => handleSave()}
          >
            {t('common:save')}
          </Button>
        </div>
      </div>
    </>
  );
};
