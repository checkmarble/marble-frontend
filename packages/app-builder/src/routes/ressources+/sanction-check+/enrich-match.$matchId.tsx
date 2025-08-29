import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusConflictHttpError } from '@app-builder/models';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs } from '@remix-run/node';

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);
  const { sanctionCheck } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const matchId = fromParams(params, 'matchId');

  const session = await getSession(request);
  const t = await getFixedT(request, ['common', 'sanctions']);

  try {
    await sanctionCheck.enrichMatch({ matchId });

    setToastMessage(session, {
      type: 'success',
      message: t('sanctions:success.match_enriched'),
    });

    return Response.json(
      {},
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  } catch (error) {
    let message: string;
    if (isStatusConflictHttpError(error)) {
      message = t('sanctions:error.match_already_enriched');
    } else {
      message = t('common:errors.unknown');
    }

    setToastMessage(session, {
      type: 'error',
      message,
    });

    return Response.json(
      {},
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}
