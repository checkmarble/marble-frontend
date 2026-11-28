import { appConfigMiddleware } from '@app-builder/middlewares/app-config-middleware';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { listInboxes } from '@app-builder/server/inboxes';
import { getSettingsAccess } from '@app-builder/services/settings-access';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const settingsIndexLoader = createServerFn()
  .middleware([authMiddleware, appConfigMiddleware])
  .handler(async function settingsIndexLoader({ context }) {
    const { user } = context;
    const appConfig = context.appConfig;

    const inboxes = await listInboxes(context.api);
    const settings = getSettingsAccess(user, appConfig, inboxes);
    const firstSetting = Object.values(settings).find((s) => s.settings.length > 0)?.settings[0];

    if (firstSetting) {
      throw redirect({ to: firstSetting.to });
    }
    throw redirect({ to: '/' });
  });

export const Route = createFileRoute('/_app/_builder/settings/')({
  loader: () => settingsIndexLoader(),
});
