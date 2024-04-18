import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;

  return authService.isAuthenticated(request, {
    successRedirect: getRoute('/data/list'),
    failureRedirect: getRoute('/sign-in'),
  });
}
