import { ReviewMatchPayload } from '@app-builder/schemas/continuous-screenings';
import { reviewContinuousScreeningMatchFn } from '@app-builder/server-fns/continuous-screening';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useReviewContinuousScreeningMatchMutation = () => {
  const reviewContinuousScreeningMatch = useServerFn(reviewContinuousScreeningMatchFn);

  return useMutation({
    mutationFn: async (payload: ReviewMatchPayload) => {
      await reviewContinuousScreeningMatch({ data: payload });
    },
  });
};
