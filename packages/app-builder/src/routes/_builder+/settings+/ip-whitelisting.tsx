import { IpWhitelistingSettingsPage } from '@app-builder/components/Settings/IpWhitelisting/IpWhitelistingSettingsPage';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const loader = createServerFn([authMiddleware], async function ipWhitelistingLoader({ context }) {
  const { organization: orgRepo, user } = context.authInfo;
  const { appConfig } = context;

  if (!isAdmin(user) || !appConfig.isManagedMarble) {
    return redirect(getRoute('/'));
  }

  const organization = await orgRepo.getCurrentOrganization();

  return {
    allowedNetworks: organization.allowedNetworks,
    organizationId: organization.id,
  };
});

export default function IpWhitelistingSettings() {
  const { allowedNetworks, organizationId } = useLoaderData<typeof loader>();

  return <IpWhitelistingSettingsPage organizationId={organizationId} allowedNetworks={allowedNetworks} />;
}
