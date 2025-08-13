import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusConflictHttpError } from '@app-builder/models';
import { createFieldValueSchema } from '@app-builder/queries/data/create-field';
import { initServerServices } from '@app-builder/services/init.server';
import { captureUnexpectedRemixError } from '@app-builder/services/monitoring';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, t, raw, { dataModelRepository }] = await Promise.all([
    getSession(request),
    getFixedT(request, ['common']),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = createFieldValueSchema.safeParse(raw);

  if (!success) return json({ success: 'false', errors: z.treeifyError(error) });
  const { name, description, type, required, tableId, isEnum, isUnique } = data;

  try {
    await dataModelRepository.postDataModelTableField(tableId, {
      name: name,
      description: description,
      type,
      nullable: required === 'optional',
      isEnum,
      isUnique,
    });

    return json({ success: 'true' });
  } catch (error) {
    if (isStatusConflictHttpError(error)) {
      setToastMessage(session, {
        type: 'error',
        message: t('common:errors.data.duplicate_field_name'),
      });

      return json(
        { success: 'false', errors: [] },
        { headers: { 'Set-Cookie': await commitSession(session) } },
      );
    } else {
      setToastMessage(session, {
        type: 'error',
        message: t('common:errors.unknown'),
      });

      captureUnexpectedRemixError(error, 'createField@action', request);

      return json(
        { success: 'false', errors: [] },
        { headers: { 'Set-Cookie': await commitSession(session) } },
      );
    }
  }
}
