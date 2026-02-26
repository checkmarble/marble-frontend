import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, t] = await Promise.all([
    getSession(request),
    getFixedT(request, ['common', 'data']),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  try {
    // Validate that the body is valid JSON
    await request.json();

    // TODO: Wire up to backend POST /org-import when available
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return json({ success: false }, { headers: { 'Set-Cookie': await commitSession(session) } });
  } catch {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return json({ success: false }, { headers: { 'Set-Cookie': await commitSession(session) } });
  }
}
