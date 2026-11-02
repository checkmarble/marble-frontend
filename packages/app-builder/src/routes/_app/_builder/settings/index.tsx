import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { roleManagerOptionalList } from '@app-builder/services/roles-access';
import { getSettingsAccess } from '@app-builder/services/settings-access';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const settingsIndexLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function settingsIndexLoader({ context }) {
    const { user, inbox } = context.authInfo;
    const appConfig = context.appConfig;

    const inboxes = await roleManagerOptionalList(inbox.listInboxes(), user.permissions.canManageRoles);
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
