import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { type Namespace } from 'i18next';

import { getSettings } from './_layout';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService, appConfigRepository } = initServerServices(request);
  const { user, inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const appConfig = await appConfigRepository.getAppConfig();

  const inboxes = await inbox.listInboxes();
  const settings = getSettings(user, appConfig, inboxes);
  const firstSettings = settings[0];

  if (firstSettings) {
    return redirect(firstSettings.to);
  }
  return redirect(getRoute('/'));
}
