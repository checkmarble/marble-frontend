import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function getAiSettingsLoader({ context }) {
    const settings = await context.authInfo.aiAssistSettings.getAiAssistSettings();
    return { settings };
  },
);
