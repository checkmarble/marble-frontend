import { type AstNode, isUndefinedAstNode, NewEmptyTriggerAstNode } from '@app-builder/models';
import { useCurrentRuleValidationRule } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_layout';
import { useTriggerValidationFetcher } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/validate-with-given-trigger-or-rule';
import { useEditorMode } from '@app-builder/services/editor';
import { useAstNodeEditor, useValidateAstNode } from '@app-builder/services/editor/ast-editor';
import { useGetScenarioErrorMessage } from '@app-builder/services/validation';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { useStore } from 'zustand';

import { AstBuilder, type AstBuilderProps } from '../AstBuilder';
import { EvaluationErrors } from '../ScenarioValidationError';

const EvaluationErrorsWrapper = () => {
  const ruleValidation = useCurrentRuleValidationRule();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();

  return (
    <EvaluationErrors
      errors={ruleValidation.errors
        .filter((error) => error != 'RULE_FORMULA_REQUIRED')
        .map(getScenarioErrorMessage)}
    />
  );
};

export const FieldAstFormula = ({
  type,
  trigger,
  scenarioId,
  iterationId,
  options,
  onChange,
  onBlur,
  defaultValue,
}: {
  type: 'rule' | 'sanction';
  trigger?: AstNode;
  onChange?: (node?: AstNode) => void;
  onBlur?: () => void;
  scenarioId: string;
  iterationId: string;
  options: AstBuilderProps['options'];
  defaultValue: AstNode;
}) => {
  const { t } = useTranslation(['scenarios']);
  const editor = useEditorMode();

  const astEditorStore = useAstNodeEditor({ initialAstNode: trigger ?? defaultValue });
  const isTriggerNull = isUndefinedAstNode(astEditorStore.getState().rootAstNode);

  const astNode = useStore(astEditorStore, (state) => state.rootAstNode);
  const { validate, validation } = useTriggerValidationFetcher(scenarioId, iterationId);

  useValidateAstNode(astEditorStore, validate, validation);

  useEffect(() => {
    onChange?.(astNode);
  }, [astNode, onChange]);

  const handleAddTrigger = () => {
    astEditorStore.setState({
      rootAstNode: NewEmptyTriggerAstNode(),
    });
  };

  const handleDeleteTrigger = () => {
    astEditorStore.setState({
      rootAstNode: defaultValue,
    });
  };

  return (
    <div onBlur={onBlur} className="flex flex-col gap-4">
      {isTriggerNull ? (
        <div className="border-blue-58 bg-blue-96 text-blue-58 text-s flex items-center rounded border p-2">
          <span>
            <Trans
              t={t}
              i18nKey="scenarios:trigger.trigger_object.no_trigger"
              values={{ objectType: options.triggerObjectType }}
            />
          </span>
        </div>
      ) : (
        <AstBuilder
          viewOnly={editor === 'view'}
          astEditorStore={astEditorStore}
          options={options}
        />
      )}
      {type === 'rule' ? (
        <EvaluationErrorsWrapper />
      ) : (
        <div className="flex justify-end">
          {isTriggerNull ? (
            <Button type="button" variant="secondary" onClick={handleAddTrigger}>
              {t('scenarios:trigger.trigger_object.add_trigger')}
            </Button>
          ) : (
            <Button type="button" variant="secondary" onClick={handleDeleteTrigger}>
              {t('scenarios:trigger.trigger_object.delete_trigger')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
