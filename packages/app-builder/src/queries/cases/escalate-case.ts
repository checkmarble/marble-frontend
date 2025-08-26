import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const escalateCasePayloadSchema = z.object({ caseId: z.string(), inboxId: z.string() });

export const useEscalateCaseMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationFn: async (payload: z.infer<typeof escalateCasePayloadSchema>) => {
      const response = await fetch(getRoute('/ressources/cases/escalate-case'), {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.redirectTo) {
        navigate(result.redirectTo);
      }

      return result;
    },
  });
};
