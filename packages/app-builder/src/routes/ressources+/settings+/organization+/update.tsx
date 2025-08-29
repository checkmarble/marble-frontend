import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { updateOrganizationPayloadSchema } from '@app-builder/queries/settings/organization/update-organization';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, rawData, { organization }] = await Promise.all([
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const payload = updateOrganizationPayloadSchema.safeParse(rawData);
  if (!payload.success) {
    return Response.json({ success: false, errors: z.treeifyError(payload.error) });
  }

  try {
    const { organizationId, autoAssignQueueLimit } = payload.data;
    await organization.updateOrganization({
      organizationId,
      changes: { autoAssignQueueLimit },
    });

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return Response.json(
      { success: true },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  } catch {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return Response.json(
      { success: false },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}
