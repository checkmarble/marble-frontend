import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const massUpdateCasesPayloadSchema = z.union([
  z
    .object({
      action: z.enum(['close', 'reopen']),
      caseIds: z.array(z.string()),
    })
    .transform((data) => ({ case_ids: data.caseIds, action: data.action })),
  z
    .object({
      action: z.enum(['assign']),
      caseIds: z.array(z.string()),
      assigneeId: z.string(),
    })
    .transform((data) => ({
      case_ids: data.caseIds,
      action: data.action,
      assign: { assignee_id: data.assigneeId },
    })),
  z
    .object({
      action: z.enum(['move_to_inbox']),
      caseIds: z.array(z.string()),
      inboxId: z.string(),
    })
    .transform((data) => ({
      case_ids: data.caseIds,
      action: data.action,
      move_to_inbox: { inbox_id: data.inboxId },
    })),
]);

export type MassUpdateCasesPayload = z.input<typeof massUpdateCasesPayloadSchema>;

const endpoint = getRoute('/ressources/cases/mass-update');

export const useMassUpdateCasesMutation = () => {
  return useMutation({
    mutationKey: ['cases', 'mass-update'],
    mutationFn: async (payload: MassUpdateCasesPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
