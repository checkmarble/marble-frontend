import { initServerServices } from '@app-builder/services/init.server';
import { internalServerError } from '@app-builder/utils/http/http-responses';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  if (request.headers.get('x-referer-app') === 'marble-frontend') {
    throw internalServerError('Detected marble app self call');
  }

  const { authService } = initServerServices(request);
  await authService.isAuthenticated(request, {
    successRedirect: getRoute('/app-router'),
    failureRedirect: getRoute('/sign-in'),
  });
}
