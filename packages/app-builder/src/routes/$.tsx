import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  await authService.isAuthenticated(request, {
    successRedirect: getRoute('/app-rooter'),
    failureRedirect: getRoute('/sign-in'),
  });
}
