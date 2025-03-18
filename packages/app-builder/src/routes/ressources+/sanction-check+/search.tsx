import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { decode as decodeFormdata } from 'decode-formdata';
import { z } from 'zod';

export const refineSearchSchema = z.discriminatedUnion('entityType', [
  z.object({
    decisionId: z.string().uuid(),
    entityType: z.literal('Thing'),
    fields: z.object({
      name: z.string().optional(),
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
    entityType: z.literal('Organization'),
    fields: z.object({
      name: z.string().optional(),
      country: z.string().optional(),
      registrationNumber: z.string().optional(),
      address: z.string().optional(),
    }),
  }),
  z.object({
    decisionId: z.string().uuid(),
    entityType: z.literal('Vehicle'),
    fields: z.object({
      name: z.string().optional(),
      registrationNumber: z.string().optional(),
    }),
  }),
]);

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const { sanctionCheck } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const data = decodeFormdata(await request.formData());
  const submission = refineSearchSchema.safeParse(data);

  if (submission.success) {
    try {
      return {
        success: true,
        data: await sanctionCheck.searchSanctionCheckMatches(submission.data),
      } as const;
    } catch {
      const session = await getSession(request);
      const t = await getFixedT(request, ['common', 'cases']);

      const message = t('common:errors.unknown');

      setToastMessage(session, {
        type: 'error',
        message,
      });

      return json({ success: false, error: [message] } as const, {
        headers: { 'Set-Cookie': await commitSession(session) },
      });
    }
  }

  return { success: false, error: submission.error } as const;
}
