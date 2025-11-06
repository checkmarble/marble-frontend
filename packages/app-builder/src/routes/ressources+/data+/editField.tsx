import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { editFieldPayloadSchema } from '@app-builder/queries/data/edit-field';
import { initServerServices } from '@app-builder/services/init.server';
import { captureUnexpectedRemixError } from '@app-builder/services/monitoring';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, raw, { dataModelRepository }] = await Promise.all([
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = editFieldPayloadSchema.safeParse(raw);

  if (!success) return json({ success: 'false', errors: z.treeifyError(error) });
  const { description, fieldId, isEnum, isUnique, required } = data;

  try {
    await dataModelRepository.patchDataModelField(fieldId, {
      description,
      isEnum,
      isUnique,
      isNullable: required === 'optional',
    });

    return json({ success: 'true', errors: [] });
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    captureUnexpectedRemixError(error, 'editField@action', request);

    return json({ success: 'false', errors: [] }, { headers: { 'Set-Cookie': await commitSession(session) } });
  }
}
