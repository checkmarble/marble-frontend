import { initializeMarbleCoreAPIClient } from '@app-builder/infra/marblecore-api';
import { initServerServices } from '@app-builder/services/init.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { getRoute } from '@app-builder/utils/routes';
import { ActionFunctionArgs, redirect } from '@remix-run/node';

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService, authSessionService } = initServerServices(request);
  const authSession = await authSessionService.getSession(request);
  const token = authSession.get('authToken')?.access_token;

  if (!token) return redirect(getRoute('/sign-in'));

  await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const { ruleId } = params;
  const { instruction } = await request.json();

  try {
    // Initialize API client with the authenticated session token
    const { getMarbleCoreAPIClientWithAuth } = initializeMarbleCoreAPIClient({
      request,
      baseUrl: getServerEnv('MARBLE_API_URL'),
    });

    // Create a token service that returns the session token
    const apiClient = getMarbleCoreAPIClientWithAuth({
      getToken: async () => token,
      getUpdate: () => ({ status: false, marbleToken: null, refreshToken: null }),
      refreshToken: async () => {
        throw new Error('Token refresh not supported in server context');
      },
      tokenUpdated: false,
    });

    const result = await apiClient.generateScenarioIterationRule(ruleId || '', {
      instruction,
    });

    if ('error' in result) {
      return Response.json({ error: result.error }, { status: 500 });
    }

    return Response.json(result);
  } catch (error) {
    console.error('Rule generation error:', error);
    return Response.json({ error: 'Failed to generate rule' }, { status: 500 });
  }
}
