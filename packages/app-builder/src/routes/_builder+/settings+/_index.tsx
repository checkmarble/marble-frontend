import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { type Namespace } from 'i18next';

import { getSettings } from './_layout';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService, featureAccessService } = serverServices;
  const { user } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const settings = getSettings(user, featureAccessService);
  const firstSetting = settings.at(0);

  if (firstSetting) {
    return redirect(firstSetting.to);
  }
  return redirect(getRoute('/'));
}
