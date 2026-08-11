import { type CreateGraphRelationPayload } from '@app-builder/schemas/graph';
import { createGraphRelationFn } from '@app-builder/server-fns/graph';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { graphRelationsQueryKey } from './list-relations';

export function useCreateGraphRelationMutation() {
  const createGraphRelation = useServerFn(createGraphRelationFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateGraphRelationPayload) => createGraphRelation({ data: payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: graphRelationsQueryKey });
    },
  });
}
