import {
  type AstNode,
  NewStringTemplateAstNode,
  type StringTemplateAstNode,
} from '@app-builder/models';
import { type AstNodeErrors } from '@app-builder/services/validation/ast-node-validation';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, ModalV2 } from 'ui-design-system';

import { useStringTemplateEditState } from './StringTemplateEdit.hook';
import { StringTemplateEditForm } from './StringTemplateEditForm';

export type StringTemplateEditProps = {
  cleanable?: boolean;
  initialNode: StringTemplateAstNode;
  initialErrors?: AstNodeErrors;
  onSave: (node: AstNode) => void;
};

export const StringTemplateEdit = ({
  cleanable = false,
  initialNode,
  initialErrors,
  onSave,
}: StringTemplateEditProps) => {
  const { t } = useTranslation(['scenarios', 'common']);
  const state = useStringTemplateEditState(initialNode, initialErrors);

  const handleSave = () => {
    const template = state.template;
    const variables = R.pick(state.variables, state.variableNames);

    onSave(NewStringTemplateAstNode(template, variables));
  };

  return (
    <>
      <ModalV2.Title>{t('scenarios:edit_string_template.title')}</ModalV2.Title>
      <div className="flex flex-col gap-9 p-6">
        <StringTemplateEditForm {...state} />
        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close
            render={
              <Button className="flex-1" variant="secondary" name="cancel" />
            }
          >
            {t('common:cancel')}
          </ModalV2.Close>
          <Button
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
