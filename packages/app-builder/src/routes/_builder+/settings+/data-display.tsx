import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type DataModel } from '@app-builder/models';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { protectArray } from '@app-builder/utils/schema/helpers/array';
import { type ActionFunctionArgs } from '@remix-run/node';
import { Dict } from '@swan-io/boxed';
import * as R from 'remeda';
import { z } from 'zod/v4';

function createTableOptionSchema(dataModel: DataModel) {
  return z.object(
    R.pipe(
      dataModel,
      R.map(
        (table) =>
          [
            table.id,
            z.object({
              displayedFields: protectArray(z.array(z.string())).default([]),
              fieldOrder: protectArray(z.array(z.string())),
            }),
          ] as const,
      ),
      R.fromEntries(),
    ),
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);
  const { dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const dataModel = await dataModelRepository.getDataModel();

  const schema = createTableOptionSchema(dataModel);
  const data = await request.json();
  const submission = schema.safeParse(data);

  const session = await getSession(request);

  if (!submission.success) {
    return { success: false, errors: z.treeifyError(submission.error) };
  }

  try {
    const payloadEntries = Dict.entries(submission.data);

    await Promise.all(
      payloadEntries.map(([tableId, body]) =>
        dataModelRepository.setDataModelTableOptions(tableId, {
          ...body,
          displayedFields: body.displayedFields ?? [],
        }),
      ),
    );

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return Response.json({ success: true }, { headers: { 'Set-Cookie': await commitSession(session) } });
  } catch (_err) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return Response.json({ status: 'error', errors: [] }, { headers: { 'Set-Cookie': await commitSession(session) } });
  }
}
