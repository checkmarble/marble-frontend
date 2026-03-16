import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { applyArchetypePayloadSchema } from '@app-builder/queries/data/apply-archetype';

type ApplyArchetypeActionResult = ServerFnResult<{ success: boolean }>;

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function applyArchetypeAction({ request, context }): ApplyArchetypeActionResult {
    const { toastSessionService, i18nextService } = context.services;
    const { apiClient } = context.authInfo;

    const [session, t, raw] = await Promise.all([
      toastSessionService.getSession(request),
      i18nextService.getFixedT(request, ['common', 'data']),
      request.json(),
    ]);

    const parsed = applyArchetypePayloadSchema.safeParse(raw);

    if (!parsed.success) return { success: false };

    try {
      // User can't seed data from archetypes, that's why we pass {} as second argument
      await apiClient.applyArchetype({ name: parsed.data.name }, {});

      setToastMessage(session, {
        type: 'success',
        message: t('data:apply_archetype.success'),
      });

      return data({ success: true }, [['Set-Cookie', await toastSessionService.commitSession(session)]]);
    } catch {
      setToastMessage(session, {
        type: 'error',
        message: t('common:errors.unknown'),
      });

      return data({ success: false }, [['Set-Cookie', await toastSessionService.commitSession(session)]]);
    }
  },
);
