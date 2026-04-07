import { type ReviewScreeningMatchPayload, reviewScreeningMatchPayloadSchema } from '@app-builder/schemas/cases';
import { reviewScreeningMatchFn } from '@app-builder/server-fns/cases';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { reviewScreeningMatchPayloadSchema, type ReviewScreeningMatchPayload };

export const useReviewScreeningMatchMutation = () => {
  const reviewScreeningMatch = useServerFn(reviewScreeningMatchFn);

  return useMutation({
    mutationFn: async (payload: ReviewScreeningMatchPayload) => reviewScreeningMatch({ data: payload }),
  });
};
