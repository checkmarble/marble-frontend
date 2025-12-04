import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { updateInboxWorkflowPayloadSchema } from '@app-builder/queries/cases/update-inbox-workflow';
import { z } from 'zod/v4';

type UpdateInboxWorkflowActionResult = ServerFnResult<Response | { success: boolean; errors?: unknown }>;

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function updateInboxWorkflowAction({ request, context }): UpdateInboxWorkflowActionResult {
    const { toastSessionService, i18nextService } = context.services;
    const [t, toastSession, rawData] = await Promise.all([
      i18nextService.getFixedT(request, ['cases', 'common']),
      toastSessionService.getSession(request),
      request.json(),
    ]);

    const payload = updateInboxWorkflowPayloadSchema.safeParse(rawData);

    if (!payload.success) {
      return { success: false, errors: z.treeifyError(payload.error) };
    }

    try {
      await Promise.all(
        payload.data.updates.map(async (update) => {
          const inbox = await context.authInfo.inbox.getInbox(update.inboxId);
          return context.authInfo.inbox.updateInbox(update.inboxId, {
            name: inbox.name,
            caseReviewManual: update.caseReviewManual,
            caseReviewOnCaseCreated: update.caseReviewOnCaseCreated,
            caseReviewOnEscalate: update.caseReviewOnEscalate,
          });
        }),
      );

      setToastMessage(toastSession, {
        type: 'success',
        message: t('cases:overview.panel.workflow.saved'),
      });

      return data({ success: true }, [['Set-Cookie', await toastSessionService.commitSession(toastSession)]]);
    } catch {
      setToastMessage(toastSession, {
        type: 'error',
        messageKey: 'common:errors.unknown',
      });

      return data({ success: false, errors: [] }, [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
      ]);
    }
  },
);
