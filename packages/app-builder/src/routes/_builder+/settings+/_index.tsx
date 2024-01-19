import { isAdmin } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { user } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  if (!isAdmin(user)) {
    return redirect(getRoute('/'));
  }

  return redirect(getRoute('/settings/users'));
}
