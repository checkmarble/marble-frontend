import { type AstNode, NewEmptyTriggerAstNode } from '@app-builder/models';
import { useTriggerValidationFetcher } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/validate-with-given-trigger-or-rule';
import { useEditorMode } from '@app-builder/services/editor';
import {
  useAstNodeEditor,
  useValidateAstNode,
} from '@app-builder/services/editor/ast-editor';
import { useEffect } from 'react';
import { useStore } from 'zustand';

import { AstBuilder, type AstBuilderProps } from '../AstBuilder';

export const FieldTrigger = ({
  trigger,
  scenarioId,
  iterationId,
  options,
  onChange,
  onBlur,
}: {
  trigger?: AstNode;
  onChange?: (node: AstNode | undefined) => void;
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
    onChange?.(astNode);
  }, [astNode, onChange]);

  return (
    <div onBlur={onBlur}>
      <AstBuilder
        viewOnly={editor === 'view'}
        astEditorStore={astEditorStore}
        options={options}
      />
    </div>
  );
};
