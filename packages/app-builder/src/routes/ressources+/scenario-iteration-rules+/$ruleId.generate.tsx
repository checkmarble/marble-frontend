import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import invariant from 'tiny-invariant';
import { z } from 'zod/v4';

const generateRuleBodySchema = z.object({
  instruction: z.string().min(1),
});

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function generateRuleAction({ request, context, params }) {
    const { scenarioIterationRuleRepository } = context.authInfo;
    const {
      i18nextService: { getFixedT },
      toastSessionService: { getSession, commitSession },
    } = context.services;
    const ruleId = params['ruleId'];
    invariant(ruleId, 'ruleId is required');

    const [toastSession, t, raw] = await Promise.all([
      getSession(request),
      getFixedT(request, ['common', 'scenarios']),
      request.json(),
    ]);

    const parsed = generateRuleBodySchema.safeParse(raw);

    if (!parsed.success) {
      setToastMessage(toastSession, {
        type: 'error',
        message: t('common:errors.unknown'),
      });
      return data({ success: false }, [['Set-Cookie', await commitSession(toastSession)]]);
    }

    try {
      const result = await scenarioIterationRuleRepository.generateRuleAst({
        ruleId,
        instruction: parsed.data.instruction,
      });
      return data({ success: true, ...result });
    } catch {
      setToastMessage(toastSession, {
        type: 'error',
        message: t('scenarios:rules.ai_generate.error_generating'),
      });
      return data({ success: false }, [['Set-Cookie', await commitSession(toastSession)]]);
    }
  },
);
