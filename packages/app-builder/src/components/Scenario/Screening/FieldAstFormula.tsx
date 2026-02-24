import { AstBuilder } from '@app-builder/components/AstBuilder';
import { type AstBuilderNodeStore } from '@app-builder/components/AstBuilder/edition/node-store';
import { type AstNode, isUndefinedAstNode, NewEmptyTriggerAstNode, NewUndefinedAstNode } from '@app-builder/models';
import { type BuilderOptionsResource } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/builder-options';
import { type FlatAstValidation } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/validate-ast';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import { useGetScenarioErrorMessage } from '@app-builder/services/validation';
import { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';

import { EvaluationErrors } from '../ScenarioValidationError';

const EvaluationErrorsWrapper = ({
  errors,
  evaluation,
}: {
  errors: FlatAstValidation['errors'];
  evaluation?: FlatAstValidation['evaluation'];
}) => {
  const getScenarioErrorMessage = useGetScenarioErrorMessage();

  // Check if there are meaningful evaluation errors that should take precedence over return type errors
  // Only show return type error if there are NO other errors in the formula
  const hasMeaningfulErrors = evaluation
    ? evaluation?.some((node) => node.errors.filter((err) => err.error != 'ARGUMENT_MUST_BE_BOOLEAN').length > 0)
    : false;

  // Filter out errors that should not be shown:
  // - RULE_FORMULA_REQUIRED: always filter out
  // - FORMULA_MUST_RETURN_BOOLEAN and FORMULA_INCORRECT_RETURN_TYPE: filter out if there are more meaningful errors
  const filteredErrors = errors.filter((error) => {
    if (error === 'RULE_FORMULA_REQUIRED') return false;
    if (error === 'FORMULA_MUST_RETURN_BOOLEAN' || error.startsWith('FORMULA_INCORRECT_RETURN_TYPE')) {
      // Hide return type errors if there are more meaningful nested errors
      return !hasMeaningfulErrors;
    }
    return true;
  });

  return <EvaluationErrors errors={filteredErrors.map(getScenarioErrorMessage)} />;
};

export const FieldAstFormula = ({
  type,
  astNode,
  scenarioId,
  options,
  onChange,
  onBlur,
  defaultValue,
}: {
  type: 'rule' | 'screening';
  astNode?: AstNode;
  onChange?: (node?: AstNode) => void;
  onBlur?: () => void;
  scenarioId: string;
  options: BuilderOptionsResource;
  defaultValue: AstNode;
}) => {
  const { t } = useTranslation(['scenarios']);
  const editor = useEditorMode();

  const formula = astNode ?? defaultValue;
  const isAstNull = isUndefinedAstNode(formula);
  const nodeStoreRef = useRef<AstBuilderNodeStore | null>(null);
  const [validationErrors, setValidationErrors] = useState<FlatAstValidation['errors']>([]);
  const [validationEvaluation, setValidationEvaluation] = useState<FlatAstValidation['evaluation']>([]);

  const handleAddTrigger = () => {
    onChange?.(NewEmptyTriggerAstNode());
  };

  const handleDeleteTrigger = () => {
    onChange?.(NewUndefinedAstNode());
  };

  return (
    <div onBlur={onBlur} className="flex flex-col gap-4">
      {isAstNull ? (
        <div className="border-blue-58 bg-blue-96 text-blue-58 text-s flex items-center rounded-sm border p-2 dark:bg-transparent">
          <span>
            <Trans
              t={t}
              i18nKey="scenarios:trigger.trigger_object.no_trigger"
              values={{ objectType: options.triggerObjectType }}
            />
          </span>
        </div>
      ) : (
        <AstBuilder.Provider scenarioId={scenarioId} initialData={options} mode={editor}>
          <AstBuilder.Root
            node={formula}
            onStoreChange={(nodeStore) => {
              nodeStoreRef.current = nodeStore;
            }}
            onValidationUpdate={(validation) => {
              setValidationErrors(validation.errors);
              setValidationEvaluation(validation.evaluation);
            }}
            onUpdate={onChange}
            returnType="bool"
          />
        </AstBuilder.Provider>
      )}
      {type === 'rule' ? (
        <EvaluationErrorsWrapper errors={validationErrors} evaluation={validationEvaluation} />
      ) : editor === 'edit' ? (
        <div className="flex justify-end">
          {isAstNull ? (
            <Button type="button" variant="secondary" onClick={handleAddTrigger}>
              <span className="text-xs">{t('scenarios:trigger.trigger_object.add_trigger')}</span>
            </Button>
          ) : (
            <Button type="button" variant="secondary" onClick={handleDeleteTrigger}>
              <span className="text-xs">{t('scenarios:trigger.trigger_object.delete_trigger')}</span>
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
};
