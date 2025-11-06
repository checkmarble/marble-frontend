import { NewUndefinedAstNode } from '@app-builder/models';
import { isKnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { type StringTemplateAstNode } from '@app-builder/models/astNode/strings';
import { type ChangeEvent, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from 'ui-design-system';

import { EditionAstBuilderOperand } from '../../../EditionOperand';
import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { extractVariablesNamesFromTemplate } from './helpers';

export const StringTemplateForm = () => {
  const { t } = useTranslation(['scenarios', 'common']);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node as unknown as StringTemplateAstNode);
  const template = node.children[0].constant;
  const handleTemplateChange = (event: ChangeEvent<HTMLInputElement>) => {
    node.children[0].constant = event.target.value;
  };
  const variableNames = extractVariablesNamesFromTemplate(template);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {t('scenarios:edit_string_template.template_field.label')}
        <Input
          value={template}
          onChange={handleTemplateChange}
          placeholder={t('scenarios:edit_string_template.template_field.placeholder')}
        />
        {/* <EvaluationErrors errors={templateErrors.map(getCommonError)} /> */}
      </div>
      {variableNames.length > 0 ? (
        <div className="flex flex-col gap-4">
          {t('scenarios:edit_string_template.variables.label')}
          <div className="ml-8 grid grid-cols-[150px_1fr] gap-x-4 gap-y-2">
            {variableNames.map((name) => {
              const variable = node.namedChildren[name];
              return (
                <Fragment key={name}>
                  <div className="text-s bg-grey-98 text-purple-65 flex size-fit min-h-[40px] min-w-[40px] flex-wrap items-center justify-center gap-1 rounded-sm p-2 font-semibold">
                    <span className="max-w-[140px] truncate" title={name}>
                      {name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <EditionAstBuilderOperand
                      node={variable && isKnownOperandAstNode(variable) ? variable : NewUndefinedAstNode()}
                      onChange={(newNode) => {
                        if (isKnownOperandAstNode(newNode)) {
                          node.namedChildren[name] = newNode;
                        }
                      }}
                      optionsDataType={['String', 'Int', 'Float']}
                    />
                    {/* <EvaluationErrors
                    errors={adaptEvaluationErrorViewModels(
                      errors?.namedChildren[name]?.errors ?? [],
                    ).map(getCommonError)}
                  /> */}
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
