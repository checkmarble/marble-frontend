import { useValidateAstMutation } from '@app-builder/queries/validate-ast';
import { AstBuilderDataSharpFactory } from '@ast-builder/Provider';
import { type AstBuilderRootProps } from '@ast-builder/types';
import { useCallbackRef } from '@marble/shared';
import { useEffect, useRef } from 'react';

import {
  AstBuilderNodeSharpFactory,
  AstBuilderUpdateFn,
  type AstBuilderValidationFn,
} from '../node-store';

export function useRoot(props: AstBuilderRootProps, autoValidate = true) {
  const scenarioId = AstBuilderDataSharpFactory.select((s) => s.scenarioId);
  const onStoreChange = useCallbackRef(props.onStoreChange);
  const onValidationUpdate = useCallbackRef(props.onValidationUpdate);
  const onUpdate = useCallbackRef(props.onUpdate);

  const mutation = useValidateAstMutation({ scenarioId });
  const mutationAbortController = useRef<AbortController | null>(null);
  const validationFn = useCallbackRef<AstBuilderValidationFn>(async (node) => {
    if (mutationAbortController.current) {
      mutationAbortController.current.abort('VALIDATION_ABORTED');
    }

    mutationAbortController.current = new AbortController();
    const result = await mutation
      .mutateAsync({
        node,
        expectedReturnType: props.returnType,
        ac: mutationAbortController.current,
      })
      .finally(() => {
        mutationAbortController.current = null;
      });

    onValidationUpdate(result);

    return result;
  });
  const updateFn = useCallbackRef<AstBuilderUpdateFn>(async (node) => {
    onUpdate(node);
  });

  const nodeStore = AstBuilderNodeSharpFactory.createSharp({
    initialNode: props.node,
    initialValidation: props.validation ?? { errors: [], evaluation: [] },
    validationFn,
    updateFn,
  });

  // Setting a validation function as we are in edit mode
  useEffect(() => {
    if (autoValidate) {
      nodeStore.actions.validate();
    }
  }, [autoValidate, nodeStore, onValidationUpdate]);

  useEffect(() => {
    onStoreChange(nodeStore);
    return () => {
      onStoreChange(null);
    };
  }, [onStoreChange, nodeStore]);

  return nodeStore;
}
