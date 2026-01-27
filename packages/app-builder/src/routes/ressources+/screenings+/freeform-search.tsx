import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { decode as decodeFormdata } from 'decode-formdata';
import { z } from 'zod/v4';

export const freeformSearchSchema = z.discriminatedUnion('entityType', [
  z.object({
    entityType: z.literal('Thing'),
    fields: z.object({
      name: z.string().min(1),
    }),
    datasets: z.array(z.string()).optional(),
    threshold: z.coerce.number().min(0).max(100).optional(),
    limit: z.coerce.number().min(10).max(50).optional(),
  }),
  z.object({
    entityType: z.literal('Person'),
    fields: z.object({
      name: z.string().min(1),
      birthDate: z.string().optional(),
      nationality: z.string().optional(),
      passportNumber: z.string().optional(),
      address: z.string().optional(),
    }),
    datasets: z.array(z.string()).optional(),
    threshold: z.coerce.number().min(0).max(100).optional(),
    limit: z.coerce.number().min(10).max(50).optional(),
  }),
  z.object({
    entityType: z.literal('Organization'),
    fields: z.object({
      name: z.string().min(1),
      country: z.string().optional(),
      registrationNumber: z.string().optional(),
      address: z.string().optional(),
    }),
    datasets: z.array(z.string()).optional(),
    threshold: z.coerce.number().min(0).max(100).optional(),
    limit: z.coerce.number().min(10).max(50).optional(),
  }),
  z.object({
    entityType: z.literal('Vehicle'),
    fields: z.object({
      name: z.string().min(1),
      registrationNumber: z.string().optional(),
    }),
    datasets: z.array(z.string()).optional(),
    threshold: z.coerce.number().min(0).max(100).optional(),
    limit: z.coerce.number().min(10).max(50).optional(),
  }),
]);

export type FreeformSearchInput = z.infer<typeof freeformSearchSchema>;

type FreeformSearchResult = ServerFnResult<
  { success: true; data: ScreeningMatchPayload[] } | { success: false; error: z.core.$ZodError | string[] }
>;

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function freeformSearchAction({ request, context }): FreeformSearchResult {
    const { toastSessionService, i18nextService } = context.services;
    const { screening } = context.authInfo;

    const formData = decodeFormdata(await request.formData(), {
      arrays: ['datasets'],
    });

    const submission = freeformSearchSchema.safeParse(formData);

    if (!submission.success) {
      return { success: false, error: submission.error };
    }

    try {
      const results = await screening.freeformSearch(submission.data);
      return { success: true, data: results };
    } catch {
      const toastSession = await toastSessionService.getSession(request);
      const t = await i18nextService.getFixedT(request, ['common', 'screenings']);

      const message = t('common:errors.unknown');

      setToastMessage(toastSession, {
        type: 'error',
        message,
      });

      return data({ success: false, error: [message] } as const, [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
      ]);
    }
  },
);
