import { type ExportedFields } from '@app-builder/models/data-model';
import { isAdmin } from '@app-builder/models/user';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { user, dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  if (!isAdmin(user)) {
    return redirect(getRoute('/'));
  }

  // * GET * //

  if (request.method === 'GET') {
    try {
      const dataModel = await dataModelRepository.getDataModel();

      const exportedEntries = await Promise.all(
        dataModel.map(async (table) => {
          const exported = await dataModelRepository.getDataModelTableExportedFields(table.id);
          return [table.id, exported] as const;
        }),
      );
      const exportedFieldsByTable = Object.fromEntries(exportedEntries) as Record<
        string,
        ExportedFields
      >;

      return Response.json({ success: true, exportedFieldsByTable });
    } catch (err) {
      console.error(err);
      return Response.json(
        { success: false, error: 'Failed to get exported fields' },
        { status: 500 },
      );
    }
  }

  return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 });
}
