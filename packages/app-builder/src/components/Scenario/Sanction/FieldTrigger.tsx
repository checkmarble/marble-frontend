import { type AstNode, NewEmptyTriggerAstNode } from '@app-builder/models';
import { useTriggerValidationFetcher } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/validate-with-given-trigger-or-rule';
import {
  useAstNodeEditor,
  useValidateAstNode,
} from '@app-builder/services/editor/ast-editor';
import { useEffect } from 'react';
import { useStore } from 'zustand';

import { AstBuilder, type AstBuilderProps } from '../AstBuilder';

export const FieldTrigger = ({
  name,
  trigger,
  scenarioId,
  iterationId,
  options,
  onChange,
  onBlur,
}: {
  name?: string;
  trigger?: AstNode;
  onChange?: (node: AstNode | undefined) => void;
  onBlur?: () => void;
  scenarioId: string;
  iterationId: string;
  options: AstBuilderProps['options'];
}) => {
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
    onChange?.(astNode);
  }, [astNode, onChange]);

  return (
    <>
      <input name={name} className="sr-only" tabIndex={-1} onBlur={onBlur} />
      <AstBuilder astEditorStore={astEditorStore} options={options} />
    </>
  );
};
