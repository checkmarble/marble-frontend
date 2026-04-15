import { type SnoozeCasePayload, snoozeCasePayloadSchema } from '@app-builder/schemas/cases';
import { snoozeCaseFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { snoozeCasePayloadSchema, type SnoozeCasePayload };

export const useSnoozeCaseMutation = () => {
  const snoozeCase = useServerFn(snoozeCaseFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'snooze-case'],
    mutationFn: async (payload: SnoozeCasePayload) => snoozeCase({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};
