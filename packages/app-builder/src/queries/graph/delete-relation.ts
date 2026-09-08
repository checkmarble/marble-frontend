import { type DeleteGraphRelationPayload } from '@app-builder/schemas/graph';
import { deleteGraphRelationFn } from '@app-builder/server-fns/graph';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { graphRelationsQueryKey } from './list-relations';

export function useDeleteGraphRelationMutation() {
  const deleteGraphRelation = useServerFn(deleteGraphRelationFn);
  const queryClient = useQueryClient();
  const { t } = useTranslation(['common']);

  return useMutation({
    mutationKey: ['graph', 'delete-relation'],
    mutationFn: async (payload: DeleteGraphRelationPayload) => deleteGraphRelation({ data: payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: graphRelationsQueryKey });
      toast.success(t('common:success.deleted'));
    },
    onError: (error) => {
      toast.error(error.message ?? t('common:errors.unknown'));
    },
  });
}
