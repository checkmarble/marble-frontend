import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { updateAutoAssignPayloadSchema } from '@app-builder/queries/cases/update-auto-assign';
import { z } from 'zod/v4';

type UpdateAutoAssignActionResult = ServerFnResult<Response | { success: boolean; errors?: unknown }>;

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function updateAutoAssignAction({ request, context }): UpdateAutoAssignActionResult {
    const { toastSessionService, i18nextService } = context.services;
    const [t, toastSession, rawData] = await Promise.all([
      i18nextService.getFixedT(request, ['cases', 'common']),
      toastSessionService.getSession(request),
      request.json(),
    ]);

    const payload = updateAutoAssignPayloadSchema.safeParse(rawData);

    if (!payload.success) {
      return { success: false, errors: z.treeifyError(payload.error) };
    }

    try {
      // Update inboxes auto-assign
      const inboxEntries = Object.entries(payload.data.inboxes) as [string, boolean][];
      await Promise.all(
        inboxEntries.map(async ([inboxId, autoAssignEnabled]) => {
          const inbox = await context.authInfo.inbox.getInbox(inboxId);
          return context.authInfo.inbox.updateInbox(inboxId, {
            name: inbox.name,
            escalationInboxId: inbox.escalationInboxId,
            autoAssignEnabled,
          });
        }),
      );

      // Update users auto-assignable
      const userEntries = Object.entries(payload.data.users) as [string, boolean][];
      await Promise.all(
        userEntries.map(([userId, autoAssignable]) =>
          context.authInfo.inbox.updateInboxUser(userId, { autoAssignable }),
        ),
      );

      setToastMessage(toastSession, {
        type: 'success',
        message: t('cases:overview.panel.auto_assignment.saved'),
      });

      return data({ success: true }, [['Set-Cookie', await toastSessionService.commitSession(toastSession)]]);
    } catch {
      setToastMessage(toastSession, {
        type: 'error',
        message: t('cases:overview.panel.auto_assignment.save_error'),
      });

      return data({ success: false, errors: [] }, [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
      ]);
    }
  },
);
