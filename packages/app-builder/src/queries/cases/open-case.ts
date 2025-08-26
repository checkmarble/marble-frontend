import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const openCasePayloadSchema = z.object({
  caseId: z.string(),
  comment: z.string(),
});

export type OpenCasePayload = z.infer<typeof openCasePayloadSchema>;

const endpoint = getRoute('/ressources/cases/open-case');

export const useOpenCaseMutation = () => {
  return useMutation({
    mutationFn: async (payload: OpenCasePayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
