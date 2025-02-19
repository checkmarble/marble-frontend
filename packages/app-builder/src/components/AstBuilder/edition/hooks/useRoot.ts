import { useValidateAstMutation } from '@app-builder/queries/validate-ast';
import { useCallbackRef } from '@marble/shared';
import { useEffect, useRef } from 'react';

import { AstBuilderDataSharpFactory, type AstBuilderValidationFn } from '../../Provider';
import { type AstBuilderRootProps } from '../../types';
import { AstBuilderNodeSharpFactory } from '../node-store';

export function useRoot(props: AstBuilderRootProps) {
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const onStoreInit = useCallbackRef(props.onStoreInit);
  const nodeStore = AstBuilderNodeSharpFactory.createSharp({
    initialNode: props.node,
    initialEvaluation: props.evaluation ?? [],
  });

  const mutation = useValidateAstMutation({ scenarioId: dataSharp.value.scenarioId });
  const mutationAbortController = useRef<AbortController | null>(null);
  const validateFn = useCallbackRef<AstBuilderValidationFn>((node) => {
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

  // Setting a validation function as we are in edit mode
  useEffect(() => {
    dataSharp.value.validateFn = validateFn;
    nodeStore.actions.validate(validateFn);
  }, [nodeStore, dataSharp, validateFn]);

  useEffect(() => {
    onStoreInit(nodeStore);
  }, [onStoreInit, nodeStore]);

  return nodeStore;
}
