import { isNotFoundHttpError } from '@app-builder/models/http-errors';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);

  const { personalSettings } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  try {
    const unavailability = await personalSettings.getUnavailability();
    return Response.json(unavailability);
  } catch (error: unknown) {
    if (isNotFoundHttpError(error)) {
      return Response.json({ unavailableUntil: null }, { status: 200 });
    }
    return Response.json({ error: 'Failed to fetch unavailability' }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);

  const { personalSettings } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  if (request.method === 'DELETE') {
    await personalSettings.cancelUnavailability();
    return Response.json({ success: true });
  }

  return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 });
}
