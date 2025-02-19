import { useValidateAstMutation } from '@app-builder/queries/validate-ast';
import { AstBuilderDataSharpFactory, type AstBuilderValidationFn } from '@ast-builder/Provider';
import { type AstBuilderRootProps } from '@ast-builder/types';
import { useCallbackRef } from '@marble/shared';
import { useEffect, useRef } from 'react';

import { AstBuilderNodeSharpFactory } from '../node-store';

export function useRoot(props: AstBuilderRootProps, autoValidate = true) {
  const scenarioId = AstBuilderDataSharpFactory.select((s) => s.scenarioId);
  const onStoreChange = useCallbackRef(props.onStoreChange);

  const mutation = useValidateAstMutation({ scenarioId });
  const mutationAbortController = useRef<AbortController | null>(null);
  const validationFn = useCallbackRef<AstBuilderValidationFn>((node) => {
    if (mutationAbortController.current) {
      mutationAbortController.current.abort('VALIDATION_ABORTED');
    }

    mutationAbortController.current = new AbortController();
    return mutation
      .mutateAsync({
        node,
        expectedReturnType: props.returnType,
        ac: mutationAbortController.current,
      })
      .finally(() => {
        mutationAbortController.current = null;
      });
  });

  const nodeStore = AstBuilderNodeSharpFactory.createSharp({
    initialNode: props.node,
    initialEvaluation: props.evaluation ?? [],
    validationFn,
  });

  // Setting a validation function as we are in edit mode
  useEffect(() => {
    if (autoValidate) {
      nodeStore.actions.validate();
    }
  }, [autoValidate, nodeStore]);

  useEffect(() => {
    onStoreChange(nodeStore);
    return () => {
      onStoreChange(null);
    };
  }, [onStoreChange, nodeStore]);

  return nodeStore;
}
