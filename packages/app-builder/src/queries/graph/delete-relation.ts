import { type DeleteGraphRelationPayload } from '@app-builder/schemas/graph';
import { deleteGraphRelationFn } from '@app-builder/server-fns/graph';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { graphRelationsQueryKey } from './list-relations';

export function useDeleteGraphRelationMutation() {
  const deleteGraphRelation = useServerFn(deleteGraphRelationFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DeleteGraphRelationPayload) => deleteGraphRelation({ data: payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: graphRelationsQueryKey });
    },
  });
}
