import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const createInboxRedirectRouteOptions = [
  '/cases/inboxes/:inboxId',
  '/settings/inboxes/:inboxId',
  '/cases/overview',
] as const;

export const createInboxPayloadSchema = z.object({
  name: z.string().min(1),
  redirectRoute: z.enum(createInboxRedirectRouteOptions).optional(),
});

export type CreateInboxPayload = z.infer<typeof createInboxPayloadSchema>;

const endpoint = getRoute('/ressources/settings/inboxes/create');

export const useCreateInboxMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['settings', 'inboxes', 'create'],
    mutationFn: async (payload: CreateInboxPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }

      return result;
    },
  });
};
