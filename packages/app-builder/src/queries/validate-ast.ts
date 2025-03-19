import {
  type AstValidationPayload,
  type AstValidationReturnType,
} from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/validate-ast';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { useMutation } from '@tanstack/react-query';

const endpoint = (scenarioId: string) =>
  getRoute('/ressources/scenarios/:scenarioId/validate-ast', {
    scenarioId,
  });

type UseValidateAstMutationParams = {
  scenarioId: string;
};
export function useValidateAstMutation(params: UseValidateAstMutationParams) {
  const scenarioNanoId = fromUUID(params.scenarioId);

  return useMutation({
    mutationFn: async (payload: AstValidationPayload & { ac: AbortController }) => {
      const response = await fetch(endpoint(scenarioNanoId), {
        method: 'POST',
        body: JSON.stringify(payload),
        signal: payload.ac.signal,
      });
      return ((await response.json()) as AstValidationReturnType).flat;
    },
  });
}
