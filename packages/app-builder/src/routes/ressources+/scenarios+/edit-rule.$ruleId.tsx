import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { editRulePayloadSchema } from '@app-builder/queries/scenarios/edit-rule';
import invariant from 'tiny-invariant';
import { z } from 'zod/v4';

export const actions = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function editRuleAction({ request, context, params }) {
    const { i18nextService, toastSessionService } = context.services;
    const { scenarioIterationRuleRepository } = context.authInfo;

    const [toastSession, rawPayload, t] = await Promise.all([
      toastSessionService.getSession(request),
      request.json(),
      i18nextService.getFixedT(request, ['common', 'scenarios']),
    ]);

    const ruleId = params['ruleId'];
    invariant(ruleId, 'Rule ID is required');

    const parsedPayload = editRulePayloadSchema.safeParse(rawPayload);

    if (!parsedPayload.success) {
      return data({ success: false, errors: z.treeifyError(parsedPayload.error) });
    }

    try {
      await scenarioIterationRuleRepository.updateRule({ ruleId, ...parsedPayload.data });

      setToastMessage(toastSession, { type: 'success', message: t('common:success.save') });
      return data({ success: true }, [['Set-Cookie', await toastSessionService.commitSession(toastSession)]]);
    } catch {
      setToastMessage(toastSession, { type: 'error', message: t('common:errors.unknown') });
      return data({ success: false, errors: [] }, [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
      ]);
    }
  },
);
