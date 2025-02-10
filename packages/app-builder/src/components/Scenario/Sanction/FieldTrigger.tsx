import { type AstNode, NewEmptyTriggerAstNode } from '@app-builder/models';
import { useTriggerValidationFetcher } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/validate-with-given-trigger-or-rule';
import {
  useAstNodeEditor,
  useValidateAstNode,
} from '@app-builder/services/editor/ast-editor';
import { type ChangeEvent, useEffect, useRef } from 'react';
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
  onChange?: (node: string) => void;
  onBlur?: () => void;
  scenarioId: string;
  iterationId: string;
  options: AstBuilderProps['options'];
}) => {
  const ref = useRef<HTMLInputElement>(null);

  const astEditorStore = useAstNodeEditor({
    initialAstNode: trigger ?? NewEmptyTriggerAstNode(),
  });

  const astNode = useStore(astEditorStore, (state) => state.rootAstNode);

  const { validate, validation } = useTriggerValidationFetcher(
    scenarioId,
    iterationId,
  );

  // Thx React... https://github.com/facebook/react/issues/27283
  useEffect(() => {
    if (ref.current) {
      ref.current.onchange = (e) => {
        onChange?.(
          (e as unknown as ChangeEvent<HTMLInputElement>).currentTarget?.value,
        );
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ref.current) {
      ref.current.value = JSON.stringify(astNode);
      ref.current?.dispatchEvent(new Event('change'));
    }
  }, [astNode]);

  useValidateAstNode(astEditorStore, validate, validation);

  return (
    <>
      <input
        name={name}
        ref={ref}
        defaultValue={JSON.stringify(trigger)}
        className="sr-only"
        tabIndex={-1}
        onBlur={onBlur}
      />
      <AstBuilder astEditorStore={astEditorStore} options={options} />
    </>
  );
};
