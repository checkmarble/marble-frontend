import { deleteGraphRelationFn } from '@app-builder/server-fns/graph';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { graphRelationsQueryKey } from './list-relations';

/**
 * Deletes several relations at once, e.g. every relation sharing a label. The API
 * has no bulk endpoint, so this fans out one request per relation: a failure can
 * leave some of them deleted, which is why the list is invalidated either way.
 */
export function useDeleteGraphRelationsMutation() {
  const deleteGraphRelation = useServerFn(deleteGraphRelationFn);
  const queryClient = useQueryClient();
  const { t } = useTranslation(['common']);

  return useMutation({
    mutationKey: ['graph', 'delete-relations'],
    mutationFn: async (relationIds: string[]) => {
      await Promise.all(relationIds.map((relationId) => deleteGraphRelation({ data: { relationId } })));
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: graphRelationsQueryKey });
    },
    onSuccess: () => {
      toast.success(t('common:success.deleted'));
    },
    onError: (error) => {
      toast.error(error.message ?? t('common:errors.unknown'));
    },
  });
}
