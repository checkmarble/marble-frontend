import { initServerServices } from '@app-builder/services/init.server';
import { getSettingsAccess } from '@app-builder/services/settings-access';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { type Namespace } from 'i18next';

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
  const settings = getSettingsAccess(user, appConfig, inboxes);

  const firstSetting = Object.values(settings).find((s) => s.settings.length > 0)?.settings[0];

  if (firstSetting) {
    return redirect(firstSetting.to);
  }
  return redirect(getRoute('/'));
}
