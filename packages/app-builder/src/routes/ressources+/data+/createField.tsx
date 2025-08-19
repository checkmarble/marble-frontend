import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusConflictHttpError } from '@app-builder/models';
import { createFieldValueSchema } from '@app-builder/queries/data/create-field';
import { initServerServices } from '@app-builder/services/init.server';
import { captureUnexpectedRemixError } from '@app-builder/services/monitoring';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
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

  const { success, error, data } = createFieldValueSchema.safeParse(raw);

  if (!success) return Response.json({ success: false, errors: z.treeifyError(error) });
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

    return Response.json({ success: true });
  } catch (error) {
    if (isStatusConflictHttpError(error)) {
      return Response.json(
        {
          success: false,
          status: 409,
          message: 'Field name already exists',
          errors: [
            {
              field: 'name',
              message: 'data:create_field.name_conflict_error',
            },
          ],
        },
        {
          status: 409,
          headers: { 'Set-Cookie': await commitSession(session) },
        },
      );
    } else {
      setToastMessage(session, {
        type: 'error',
        message: 'common:errors.unknown',
      });

      captureUnexpectedRemixError(error, 'createField@action', request);

      return Response.json(
        { success: false, errors: [] },
        { headers: { 'Set-Cookie': await commitSession(session) } },
      );
    }
  }
}
