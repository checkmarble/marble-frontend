import { ScreeningProvidersSettingsPage } from '@app-builder/components/Settings/ScreeningProviders/ScreeningProvidersSettingsPage';
import { appConfigMiddleware } from '@app-builder/middlewares/app-config-middleware';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { type ScreeningProvider } from '@app-builder/models/organization';
import { getCurrentOrganization } from '@app-builder/server/organization';
import { isLexisNexisAvailable } from '@app-builder/services/feature-access';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const screeningProvidersLoader = createServerFn()
  .middleware([authMiddleware, appConfigMiddleware])
  .handler(async function screeningProvidersLoader({ context }) {
    const { api, user, entitlements, appConfig } = context;

    if (!isAdmin(user) || appConfig.isManagedMarble) {
      // not in SaaS
      throw redirect({ to: '/settings' });
    }

    const organization = await getCurrentOrganization(api, user.organizationId);

    const availableProviders: ScreeningProvider[] = ['opensanctions'];
    if (isLexisNexisAvailable(entitlements)) availableProviders.push('lexisnexis');

    return {
      providers: organization.screeningProviders,
      organizationId: organization.id,
      availableProviders,
    };
  });

export const Route = createFileRoute('/_app/_builder/settings/screening-providers')({
  loader: () => screeningProvidersLoader(),
  component: ScreeningProvidersSettings,
});

function ScreeningProvidersSettings() {
  const { providers, organizationId, availableProviders } = Route.useLoaderData();

  return (
    <ScreeningProvidersSettingsPage
      organizationId={organizationId}
      providers={providers}
      availableProviders={availableProviders}
    />
  );
}
