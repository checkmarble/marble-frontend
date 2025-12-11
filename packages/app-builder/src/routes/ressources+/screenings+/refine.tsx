import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { refineScreeningPayloadSchema } from '@app-builder/queries/screening/schemas';

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function screeningRefineAction({ request, context }) {
    const { screening } = context.authInfo;

    const rawPayload = await request.json();
    const submission = refineScreeningPayloadSchema.safeParse(rawPayload);

    if (submission.success) {
      return {
        success: true,
        data: await screening.refineScreening(submission.data),
      };
    }

    return { success: false, error: submission.error } as const;
  },
);
