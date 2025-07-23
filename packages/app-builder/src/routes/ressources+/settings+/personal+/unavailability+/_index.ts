import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);

  const { personalSettings } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const unavailability = await personalSettings.getUnavailability();

  console.log('->unavailability', unavailability);

  return Response.json(unavailability);
}
