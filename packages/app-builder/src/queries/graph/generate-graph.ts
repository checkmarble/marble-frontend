import { type GenerateGraphPayload } from '@app-builder/schemas/graph';
import { generateGraphFn } from '@app-builder/server-fns/graph';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useGenerateGraphMutation() {
  const generateGraph = useServerFn(generateGraphFn);
  const { t } = useTranslation(['common']);

  return useMutation({
    mutationKey: ['graph', 'generate'],
    mutationFn: async (payload: GenerateGraphPayload) => generateGraph({ data: payload }),
    onError: (error) => {
      toast.error(error.message ?? t('common:errors.unknown'));
    },
  });
}
