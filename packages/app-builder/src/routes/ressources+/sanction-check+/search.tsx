import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod';

export const refineSearchSchema = z.discriminatedUnion('entityType', [
  z.object({
    decisionId: z.string().uuid(),
    entityType: z.literal('LegalEntity'),
    fields: z.object({
      email: z.string().optional(),
    }),
  }),
  z.object({
    decisionId: z.string().uuid(),
    entityType: z.literal('Person'),
    fields: z.object({
      name: z.string().optional(),
      birthDate: z.string().optional(),
      nationality: z.string().optional(),
      idNumber: z.string().optional(),
      address: z.string().optional(),
    }),
  }),
  z.object({
    decisionId: z.string().uuid(),
    entityType: z.literal('Company'),
    fields: z.object({
      name: z.string().optional(),
      jurisdiction: z.string().optional(),
      registrationNumber: z.string().optional(),
      address: z.string().optional(),
      incorporationDate: z.string().optional(),
    }),
  }),
  z.object({
    decisionId: z.string().uuid(),
    entityType: z.literal('Organization'),
    fields: z.object({
      name: z.string().optional(),
      country: z.string().optional(),
      registrationNumber: z.string().optional(),
      address: z.string().optional(),
    }),
  }),
]);

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;

  const { sanctionCheck } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: refineSearchSchema });

  if (submission.status === 'success') {
    return {
      status: 'searchResults',
      value: await sanctionCheck.searchSanctionCheckMatches(submission.value),
    } as const;
  }

  return submission.reply();
}
