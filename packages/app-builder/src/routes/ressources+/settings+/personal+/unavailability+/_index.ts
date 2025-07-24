import { isMarbleError, isNotFoundHttpError } from '@app-builder/models/http-errors';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { HttpError } from '@oazapfts/runtime';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';

function handleError(error: unknown) {
  const httpError = error as HttpError;
  if (isMarbleError(httpError)) {
    return Response.json({ error: httpError.data.message }, { status: httpError.status });
  }
  return Response.json({ error: 'Failed to fetch unavailability' }, { status: 500 });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);

  const { personalSettings } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  console.log('personalSettings ressource', request.method);

  try {
    const unavailability = await personalSettings.getUnavailability();
    return Response.json(unavailability);
  } catch (error: unknown) {
    if (isNotFoundHttpError(error)) {
      return Response.json({ until: null }, { status: 200 });
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
    try {
      await personalSettings.cancelUnavailability();
      return Response.json({ success: true });
    } catch (error: unknown) {
      return handleError(error);
    }
  }

  if (request.method === 'POST') {
    const unavailability = await request.json();
    try {
      await personalSettings.setUnavailability(unavailability);
      return Response.json({ success: true });
    } catch (error: unknown) {
      return handleError(error);
    }
  }

  return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 });
}
