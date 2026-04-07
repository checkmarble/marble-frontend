import { dismissContinuousScreeningFn } from '@app-builder/server-fns/continuous-screening';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useDismissContinuousScreeningMutation = () => {
  const dismissContinuousScreening = useServerFn(dismissContinuousScreeningFn);

  return useMutation({
    mutationFn: async (screeningId: string) => {
      await dismissContinuousScreening({ data: { screeningId } });
    },
  });
};
