import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { reviewScreeningMatchPayloadSchema } from '@app-builder/queries/screening/review-screening-match';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, t, raw, { screening }] = await Promise.all([
    getSession(request),
    getFixedT(request, ['common', 'cases']),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = reviewScreeningMatchPayloadSchema.safeParse(raw);

  if (!success) {
    return json({ success: false, errors: z.treeifyError(error) });
  }

  try {
    await screening.updateMatchStatus(data);
    return json({ success: true, errors: [] });
  } catch (_error) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return json({ success: false, errors: [] }, { headers: { 'Set-Cookie': await commitSession(session) } });
  }
}
