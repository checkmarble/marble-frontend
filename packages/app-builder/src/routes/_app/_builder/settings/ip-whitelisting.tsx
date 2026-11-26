import { IpWhitelistingSettingsPage } from '@app-builder/components/Settings/IpWhitelisting/IpWhitelistingSettingsPage';
import { appConfigMiddleware } from '@app-builder/middlewares/app-config-middleware';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { getCurrentOrganization } from '@app-builder/server/organization';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const ipWhitelistingLoader = createServerFn()
  .middleware([authMiddleware, appConfigMiddleware])
  .handler(async function ipWhitelistingLoader({ context }) {
    const { api, user, appConfig } = context;

    if (!isAdmin(user) || !appConfig.isManagedMarble) {
      throw redirect({ to: '/app-router' });
    }

    const organization = await getCurrentOrganization(api, user.organizationId);

    return {
      allowedNetworks: organization.allowedNetworks,
      organizationId: organization.id,
    };
  });

export const Route = createFileRoute('/_app/_builder/settings/ip-whitelisting')({
  loader: () => ipWhitelistingLoader(),
  component: IpWhitelistingSettings,
});

function IpWhitelistingSettings() {
  const { allowedNetworks, organizationId } = Route.useLoaderData();

  return <IpWhitelistingSettingsPage organizationId={organizationId} allowedNetworks={allowedNetworks} />;
}
