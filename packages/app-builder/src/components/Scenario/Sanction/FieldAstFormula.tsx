import { AstBuilder } from '@app-builder/components/AstBuilder';
import { type AstBuilderNodeStore } from '@app-builder/components/AstBuilder/edition/node-store';
import { type AstNode, isUndefinedAstNode, NewEmptyTriggerAstNode } from '@app-builder/models';
import { useCurrentRuleValidationRule } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_layout';
import { type BuilderOptionsResource } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/builder-options';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import { useGetScenarioErrorMessage } from '@app-builder/services/validation';
import { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';

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
  astNode,
  scenarioId,
  options,
  onChange,
  onBlur,
  defaultValue,
}: {
  type: 'rule' | 'sanction';
  astNode?: AstNode;
  onChange?: (node?: AstNode) => void;
  onBlur?: () => void;
  scenarioId: string;
  options: BuilderOptionsResource;
  defaultValue: AstNode;
}) => {
  const { t } = useTranslation(['scenarios']);
  const editor = useEditorMode();

  const [formula, setFormula] = useState(astNode ?? defaultValue);
  const isAstNull = isUndefinedAstNode(formula);
  const nodeStoreRef = useRef<AstBuilderNodeStore | null>(null);

  useEffect(() => {
    onChange?.(nodeStoreRef.current ? nodeStoreRef.current.value.node : formula);
  }, [onChange, formula]);

  const handleAddTrigger = () => {
    setFormula(NewEmptyTriggerAstNode());
  };

  const handleDeleteTrigger = () => {
    setFormula(defaultValue);
  };

  return (
    <div onBlur={onBlur} className="flex flex-col gap-4">
      {isAstNull ? (
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
        <AstBuilder.Provider scenarioId={scenarioId} initialData={options} mode={editor}>
          <AstBuilder.Root
            node={formula}
            onStoreChange={(nodeStore) => {
              nodeStoreRef.current = nodeStore;
            }}
            returnType="bool"
          />
        </AstBuilder.Provider>
      )}
      {type === 'rule' ? (
        <EvaluationErrorsWrapper />
      ) : editor === 'edit' ? (
        <div className="flex justify-end">
          {isAstNull ? (
            <Button type="button" variant="secondary" onClick={handleAddTrigger}>
              {t('scenarios:trigger.trigger_object.add_trigger')}
            </Button>
          ) : (
            <Button type="button" variant="secondary" onClick={handleDeleteTrigger}>
              {t('scenarios:trigger.trigger_object.delete_trigger')}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
};
