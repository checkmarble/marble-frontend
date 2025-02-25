import { type AstNode, NewEmptyTriggerAstNode } from '@app-builder/models';
import { useCurrentRuleValidationRule } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_layout';
import { useTriggerValidationFetcher } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/validate-with-given-trigger-or-rule';
import { useEditorMode } from '@app-builder/services/editor';
import {
  useAstNodeEditor,
  useValidateAstNode,
} from '@app-builder/services/editor/ast-editor';
import { useGetScenarioErrorMessage } from '@app-builder/services/validation';
import { useEffect } from 'react';
import { hasSubObject } from 'remeda';
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

export const FieldTrigger = ({
  type,
  trigger,
  scenarioId,
  iterationId,
  options,
  onChange,
  onBlur,
}: {
  type: 'rule' | 'sanction';
  trigger?: AstNode;
  onChange?: (node?: AstNode) => void;
  onBlur?: () => void;
  scenarioId: string;
  iterationId: string;
  options: AstBuilderProps['options'];
}) => {
  const editor = useEditorMode();

  const astEditorStore = useAstNodeEditor({
    initialAstNode: trigger ?? NewEmptyTriggerAstNode(),
  });

  const astNode = useStore(astEditorStore, (state) => state.rootAstNode);

  const { validate, validation } = useTriggerValidationFetcher(
    scenarioId,
    iterationId,
  );

  useValidateAstNode(astEditorStore, validate, validation);

  useEffect(() => {
    onChange?.(
      hasSubObject(NewEmptyTriggerAstNode(), astNode) ? undefined : astNode,
    );
  }, [astNode, onChange]);

  return (
    <div onBlur={onBlur}>
      <AstBuilder
        viewOnly={editor === 'view'}
        astEditorStore={astEditorStore}
        options={options}
      />
      {type === 'rule' ? <EvaluationErrorsWrapper /> : null}
    </div>
  );
};
