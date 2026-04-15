import { IpWhitelistingSettingsPage } from '@app-builder/components/Settings/IpWhitelisting/IpWhitelistingSettingsPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const ipWhitelistingLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function ipWhitelistingLoader({ context }) {
    const { organization: orgRepo, user } = context.authInfo;
    const { appConfig } = context;

    if (!isAdmin(user) || !appConfig.isManagedMarble) {
      throw redirect({ to: '/' });
    }

    const organization = await orgRepo.getCurrentOrganization();

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
