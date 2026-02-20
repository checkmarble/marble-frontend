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
    const backendUrl = `${getServerEnv('MARBLE_API_URL')}/scenario-iteration-rules/${ruleId}/generate`;
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ instruction }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: `Backend error: ${errorText}` }, { status: response.status });
    }

    const result = await response.json();
    return Response.json(result);
  } catch (error) {
    console.error('Rule generation error:', error);
    return Response.json({ error: 'Failed to generate rule' }, { status: 500 });
  }
}
