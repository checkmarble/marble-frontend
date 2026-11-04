import { TracfinSettingsPage } from '@app-builder/components/Tracfin/Settings/TracfinSettingsPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { assertTracfinConfigurationAccess } from '@app-builder/services/tracfin-access';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const tracfinSettingsLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function tracfinSettingsLoader({ context }) {
    assertTracfinConfigurationAccess(context.authInfo.user);
    return null;
  });

export const Route = createFileRoute('/_app/_builder/settings/tracfin')({
  loader: () => tracfinSettingsLoader(),
  component: TracfinSettingsPage,
});
