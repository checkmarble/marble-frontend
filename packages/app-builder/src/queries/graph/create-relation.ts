import { type CreateGraphRelationPayload } from '@app-builder/schemas/graph';
import { createGraphRelationFn } from '@app-builder/server-fns/graph';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { graphRelationsQueryKey } from './list-relations';

export function useCreateGraphRelationMutation() {
  const createGraphRelation = useServerFn(createGraphRelationFn);
  const queryClient = useQueryClient();
  const { t } = useTranslation(['common']);

  return useMutation({
    mutationKey: ['graph', 'create-relation'],
    mutationFn: async (payload: CreateGraphRelationPayload) => createGraphRelation({ data: payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: graphRelationsQueryKey });
      toast.success(t('common:success.save'));
    },
    onError: (error) => {
      toast.error(error.message ?? t('common:errors.unknown'));
    },
  });
}
