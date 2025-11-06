import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isHttpError } from '@app-builder/models';
import { updateAllowedNetworksPayloadSchema } from '@app-builder/queries/settings/organization/update-allowed-networks';
import { initServerServices } from '@app-builder/services/init.server';
import { UNPROCESSABLE_ENTITY } from '@app-builder/utils/http/http-status-codes';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService, toastSessionService, i18nextService } = initServerServices(request);
  const { organization } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const organizationId = fromParams(params, 'organizationId');
  const [rawData, toastSession, t] = await Promise.all([
    request.json(),
    toastSessionService.getSession(request),
    i18nextService.getFixedT(request, ['common', 'settings']),
  ]);

  const payload = updateAllowedNetworksPayloadSchema.safeParse(rawData);

  if (!payload.success) {
    return Response.json({ success: false, errors: z.treeifyError(payload.error) });
  }

  try {
    const subnets = await organization.updateAllowedNetworks(organizationId, payload.data.allowedNetworks);

    setToastMessage(toastSession, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return Response.json(
      { success: true, data: { subnets } },
      { headers: { 'Set-Cookie': await toastSessionService.commitSession(toastSession) } },
    );
  } catch (error) {
    if (isHttpError(error) && error.status === UNPROCESSABLE_ENTITY) {
      setToastMessage(toastSession, {
        type: 'error',
        message: t('settings:ip_whitelisting.errors.ip_not_in_range'),
      });
    }

    return Response.json(
      { success: false, errors: [] },
      { headers: { 'Set-Cookie': await toastSessionService.commitSession(toastSession) } },
    );
  }
}
