import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { aiAssistSettings } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const settings = await aiAssistSettings.getAiAssistSettings();

  return Response.json({ settings });
}
