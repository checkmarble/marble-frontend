import { IpWhitelistingSettingsPage } from '@app-builder/components/Settings/IpWhitelisting/IpWhitelistingSettingsPage';
import { isAdmin } from '@app-builder/models';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs, redirect } from '@remix-run/server-runtime';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { authService, appConfigRepository } = initServerServices(request);
  const { organization: orgRepo, user } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const appConfig = await appConfigRepository.getAppConfig();

  if (!isAdmin(user) || !appConfig.isManagedMarble) {
    return redirect(getRoute('/'));
  }

  const organization = await orgRepo.getCurrentOrganization();

  return {
    allowedNetworks: organization.allowedNetworks,
    organizationId: organization.id,
  };
};

export default function IpWhitelistingSettings() {
  const { allowedNetworks, organizationId } = useLoaderData<typeof loader>();

  return <IpWhitelistingSettingsPage organizationId={organizationId} allowedNetworks={allowedNetworks} />;
}
