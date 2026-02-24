import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { applyArchetypePayloadSchema } from '@app-builder/queries/data/apply-archetype';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, t, raw, { apiClient }] = await Promise.all([
    getSession(request),
    getFixedT(request, ['common', 'data']),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, data } = applyArchetypePayloadSchema.safeParse(raw);

  if (!success) return json({ success: false });

  try {
    await apiClient.applyArchetype({ name: data.name }, { seed: data.seed });

    setToastMessage(session, {
      type: 'success',
      message: t('data:apply_archetype.success'),
    });

    return json({ success: true }, { headers: { 'Set-Cookie': await commitSession(session) } });
  } catch {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return json({ success: false }, { headers: { 'Set-Cookie': await commitSession(session) } });
  }
}
