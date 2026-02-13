import { Page } from '@app-builder/components';
import { SettingsNavigationTabs } from '@app-builder/components/Settings/Navigation/Tabs';
import { isAnalyst } from '@app-builder/models/user';
import { initServerServices } from '@app-builder/services/init.server';
import { getSettingsAccess } from '@app-builder/services/settings-access';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: ['navigation', 'settings'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService, appConfigRepository } = initServerServices(request);
  const { user, entitlements, inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  if (isAnalyst(user)) {
    return redirect(getRoute('/cases'));
  }

  const appConfig = await appConfigRepository.getAppConfig();
  const inboxes = await inbox.listInboxes();

  const sections = getSettingsAccess(user, appConfig, inboxes);

  return { sections, entitlements };
}

export default function Settings() {
  const { sections } = useLoaderData<typeof loader>();

  return (
    <Page.Main>
      <div className="p-v2-lg pb-0">
        <SettingsNavigationTabs sections={sections} />
      </div>
      <Outlet />
    </Page.Main>
  );
}
