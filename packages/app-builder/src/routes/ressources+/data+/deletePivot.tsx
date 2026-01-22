import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type DestroyDataModelReport } from '@app-builder/models/data-model';
import { deletePivotPayloadSchema } from '@app-builder/queries/data/delete-pivot';
import { z } from 'zod/v4';

type DeletePivotActionResult = ServerFnResult<
  { success: true; data: DestroyDataModelReport } | { success: false; errors: unknown; error?: string }
>;

export const action = createServerFn(
  [authMiddleware],
  async function deletePivotAction({ request, context }): DeletePivotActionResult {
    const { toastSessionService, i18nextService } = context.services;
    const { dataModelRepository } = context.authInfo;

    const [t, toastSession, raw] = await Promise.all([
      i18nextService.getFixedT(request, ['common']),
      toastSessionService.getSession(request),
      request.json(),
    ]);

    const parsed = deletePivotPayloadSchema.safeParse(raw);

    if (!parsed.success) {
      return data({ success: false as const, errors: z.treeifyError(parsed.error) }, [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
      ]);
    }

    try {
      const result = await dataModelRepository.deletePivot(parsed.data.pivotId, {
        perform: parsed.data.perform,
      });

      if (result.performed) {
        setToastMessage(toastSession, {
          type: 'success',
          message: t('common:success.deleted'),
        });
      }

      return data({ success: true as const, data: result }, [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
      ]);
    } catch (error) {
      setToastMessage(toastSession, {
        type: 'error',
        message: t('common:errors.unknown'),
      });

      return data({ success: false as const, errors: [], error: String(error) }, [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
      ]);
    }
  },
);
