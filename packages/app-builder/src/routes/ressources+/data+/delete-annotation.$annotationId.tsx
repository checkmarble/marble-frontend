import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [t, session, { dataModelRepository }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const annotationId = params['annotationId'];
  invariant(annotationId, 'Expected annotationId param to be present in url');

  try {
    await dataModelRepository.deleteAnnotation(annotationId);

    setToastMessage(session, {
      type: 'success',
      message: t('common:success.deleted'),
    });

    return Response.json({ success: true }, { headers: { 'Set-Cookie': await commitSession(session) } });
  } catch (_err) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return Response.json({ success: false, errors: [] }, { headers: { 'Set-Cookie': await commitSession(session) } });
  }
}
