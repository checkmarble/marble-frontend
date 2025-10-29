import { isAdmin } from '@app-builder/models/user';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import z from 'zod';

const ingestedDataFieldSchema = z.object({
  path: z.array(z.string()),
  name: z.string(),
});

// Accept create payload: exactly one of the following
const exportedFieldSchema = z.union([
  z.object({ triggerObjectField: z.string() }),
  z.object({ ingestedDataField: ingestedDataFieldSchema }),
]);

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { user, dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  if (!isAdmin(user)) {
    return redirect(getRoute('/'));
  }

  const { tableId } = params;
  if (!tableId) {
    return Response.json({ error: 'Table ID is required' }, { status: 400 });
  }

  if (request.method === 'POST') {
    const body = await request.json();

    const parsedCreate = exportedFieldSchema.safeParse(body);
    if (!parsedCreate.success) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    try {
      const current = await dataModelRepository.getDataModelTableExportedFields(tableId);

      if ('triggerObjectField' in parsedCreate.data) {
        const field = parsedCreate.data.triggerObjectField;
        if (current.triggerObjectFields.includes(field)) {
          return Response.json(
            { success: false, error: 'Field already exported' },
            { status: 400 },
          );
        }
        const exportedFields = await dataModelRepository.updateDataModelTableExportedFields(
          tableId,
          {
            triggerObjectFields: [...current.triggerObjectFields, field],
            ingestedDataFields: current.ingestedDataFields,
          },
        );
        return Response.json({ success: true, exportedFields });
      }

      if ('ingestedDataField' in parsedCreate.data) {
        const field = parsedCreate.data.ingestedDataField;
        const exists = (current.ingestedDataFields ?? []).some(
          (f) => f.name === field.name && (f.path ?? []).join('.') === field.path.join('.'),
        );
        if (exists) {
          return Response.json(
            { success: false, error: 'Field already exported' },
            { status: 400 },
          );
        }
        const exportedFields = await dataModelRepository.updateDataModelTableExportedFields(
          tableId,
          {
            triggerObjectFields: current.triggerObjectFields,
            ingestedDataFields: [...current.ingestedDataFields, field],
          },
        );
        return Response.json({ success: true, exportedFields });
      }

      return Response.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    } catch (err) {
      console.error(err);
      return Response.json(
        { success: false, error: 'Failed to update exported fields' },
        { status: 500 },
      );
    }
  }
  if (request.method === 'GET') {
    try {
      const exportedFields = await dataModelRepository.getDataModelTableExportedFields(tableId);
      return Response.json({ success: true, exportedFields });
    } catch (err) {
      console.error(err);
      return Response.json(
        { success: false, error: 'Failed to get exported fields' },
        { status: 500 },
      );
    }
  }
  if (request.method === 'DELETE') {
    const body = await request.json();
    const parsedDelete = exportedFieldSchema.safeParse(body);
    if (!parsedDelete.success) {
      return Response.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }
    try {
      const current = await dataModelRepository.getDataModelTableExportedFields(tableId);
      if ('triggerObjectField' in parsedDelete.data) {
        const field = parsedDelete.data.triggerObjectField;
        const exists = (current.triggerObjectFields ?? []).includes(field);
        if (!exists) {
          return Response.json({ success: false, error: 'Field not found' }, { status: 404 });
        }
        const next = {
          triggerObjectFields: (current.triggerObjectFields ?? []).filter((f) => f !== field),
          ingestedDataFields: current.ingestedDataFields ?? [],
        };
        const exportedFields = await dataModelRepository.updateDataModelTableExportedFields(
          tableId,
          next,
        );
        return Response.json({ success: true, exportedFields });
      }
      if ('ingestedDataField' in parsedDelete.data) {
        const field = parsedDelete.data.ingestedDataField;
        const exists = (current.ingestedDataFields ?? []).some(
          (f) => f.name === field.name && (f.path ?? []).join('.') === field.path.join('.'),
        );
        if (!exists) {
          return Response.json({ success: false, error: 'Field not found' }, { status: 404 });
        }
        const next = {
          triggerObjectFields: current.triggerObjectFields ?? [],
          ingestedDataFields: (current.ingestedDataFields ?? []).filter(
            (f) => !(f.name === field.name && (f.path ?? []).join('.') === field.path.join('.')),
          ),
        };
        const exportedFields = await dataModelRepository.updateDataModelTableExportedFields(
          tableId,
          next,
        );
        return Response.json({ success: true, exportedFields });
      }
      return Response.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    } catch (err) {
      console.error(err);
      return Response.json(
        { success: false, error: 'Failed to update exported fields' },
        { status: 500 },
      );
    }
  }
  return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 });
}
