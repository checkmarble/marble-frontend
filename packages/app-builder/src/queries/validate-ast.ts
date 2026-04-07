import {
  type AstValidationPayload,
  type AstValidationReturnType,
  validateAstFn,
} from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export type { AstValidationPayload, AstValidationReturnType };

type UseValidateAstMutationParams = {
  scenarioId: string | undefined;
};
export function useValidateAstMutation(params: UseValidateAstMutationParams) {
  const validateAst = useServerFn(validateAstFn);

  return useMutation({
    mutationFn: async (payload: AstValidationPayload & { ac: AbortController }) => {
      if (!params.scenarioId) {
        return { errors: [], evaluation: [] };
      }
      const result = await validateAst({
        data: {
          scenarioId: params.scenarioId,
          node: payload.node,
          expectedReturnType: payload.expectedReturnType,
        },
      });
      return (result as AstValidationReturnType).flat;
    },
  });
}
