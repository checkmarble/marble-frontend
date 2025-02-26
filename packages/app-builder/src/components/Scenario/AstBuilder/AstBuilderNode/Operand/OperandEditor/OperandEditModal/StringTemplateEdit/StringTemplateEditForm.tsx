import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';
import { type AstNodeErrors } from '@app-builder/services/validation/ast-node-validation';
import { type ChangeEvent, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from 'ui-design-system';

import { VariableOperand } from './VariableOperand';

export type StringTemplateEditFormProps = {
  template: string;
  setTemplate: (template: string) => void;
  variables: Record<string, AstNode>;
  setVariable: (name: string, data: AstNode) => void;
  variableNames: string[];
  errors?: AstNodeErrors;
};

export const StringTemplateEditForm = ({
  template,
  setTemplate,
  variables,
  setVariable,
  variableNames,
  errors,
}: StringTemplateEditFormProps) => {
  const { t } = useTranslation(['scenarios', 'common']);
  const handleTemplateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTemplate(event.target.value);
  };
  const getCommonError = useGetNodeEvaluationErrorMessage();
  const templateErrors = adaptEvaluationErrorViewModels(
    errors?.errors.filter((e) => e.argumentIndex === 0) ?? [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {t('scenarios:edit_string_template.template_field.label')}
        <Input
          value={template}
          onChange={handleTemplateChange}
          placeholder={t('scenarios:edit_string_template.template_field.placeholder')}
        />
        <EvaluationErrors errors={templateErrors.map(getCommonError)} />
      </div>
      {variableNames.length > 0 ? (
        <div className="flex flex-col gap-4">
          {t('scenarios:edit_string_template.variables.label')}
          <div className="ml-8 grid grid-cols-[150px_1fr] gap-x-4 gap-y-2">
            {variableNames.map((name) => (
              <Fragment key={name}>
                <div className="text-s bg-grey-98 text-purple-65 flex size-fit min-h-[40px] min-w-[40px] flex-wrap items-center justify-center gap-1 rounded p-2 font-semibold">
                  <span className="max-w-[140px] truncate" title={name}>
                    {name}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <VariableOperand
                    astNode={variables[name] ?? NewUndefinedAstNode()}
                    astNodeErrors={undefined}
                    validationStatus="valid"
                    onChange={(node) => setVariable(name, node)}
                  />
                  <EvaluationErrors
                    errors={adaptEvaluationErrorViewModels(
                      errors?.namedChildren[name]?.errors ?? [],
                    ).map(getCommonError)}
                  />
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
