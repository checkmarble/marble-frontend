import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { ActionFunctionArgs } from '@remix-run/server-runtime';

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { ruleId } = params;
  const { instruction } = await request.json();

  if (!ruleId || !instruction) {
    return Response.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const backendUrl = `${process.env['BACKEND_URL'] || 'http://localhost:8080'}/scenario-iteration-rules/${ruleId}/generate`;
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instruction }),
    });

    if (!response.ok) {
      return Response.json({ error: `Backend error: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Rule generation error:', error);
    return Response.json({ error: 'Failed to generate rule' }, { status: 500 });
  }
}
