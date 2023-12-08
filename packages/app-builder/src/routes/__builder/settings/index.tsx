import { isAdmin } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderArgs, redirect } from '@remix-run/node';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { user } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  if (!isAdmin(user)) {
    return redirect(getRoute('/'));
  }

  return redirect(getRoute('/settings/users'));
}
