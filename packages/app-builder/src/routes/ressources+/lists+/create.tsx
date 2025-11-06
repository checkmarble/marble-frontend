import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { isStatusConflictHttpError } from '@app-builder/models';
import { createListPayloadSchema } from '@app-builder/schemas/lists';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { redirect } from '@remix-run/node';
import { z } from 'zod/v4';

type CreateListResourceActionResult = ServerFnResult<Response | { success: boolean; errors: any }>;

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function createListResourceAction({ request, context }): CreateListResourceActionResult {
    const { toastSessionService } = context.services;
    const toastSession = await toastSessionService.getSession(request);
    const rawPayload = await request.json();

    const createListPayload = createListPayloadSchema.safeParse(rawPayload);
    if (!createListPayload.success) {
      return { success: false, errors: z.treeifyError(createListPayload.error) };
    }

    try {
      const result = await context.authInfo.customListsRepository.createCustomList(createListPayload.data);
      return redirect(getRoute('/lists/:listId', { listId: fromUUIDtoSUUID(result.id) }));
    } catch (error) {
      setToastMessage(toastSession, {
        type: 'error',
        messageKey: isStatusConflictHttpError(error)
          ? 'common:errors.list.duplicate_list_name'
          : 'common:errors.unknown',
      });

      return data({ success: false, errors: [] }, [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
      ]);
    }
  },
);
