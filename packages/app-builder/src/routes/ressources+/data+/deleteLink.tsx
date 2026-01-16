import { adaptDestroyDataModelReport, type DestroyDataModelReportDto } from '@app-builder/models/data-model';
import { isStatusConflictHttpError } from '@app-builder/models/http-errors';
import { deleteLinkPayloadSchema } from '@app-builder/queries/data/delete-link';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);

  const [raw, { apiClient }] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = deleteLinkPayloadSchema.safeParse(raw);

  if (!success) return json({ success: false as const, errors: z.treeifyError(error) });

  try {
    const result = await apiClient.deleteDataModelLink(data.linkId, {
      perform: data.perform,
    });

    return json({
      success: true as const,
      data: adaptDestroyDataModelReport(result as DestroyDataModelReportDto),
    });
  } catch (error) {
    // 409 Conflict is a valid response containing the DestroyDataModelReport with blocking conflicts
    if (isStatusConflictHttpError(error)) {
      return json({
        success: true as const,
        data: adaptDestroyDataModelReport(error.data as DestroyDataModelReportDto),
      });
    }
    console.error('deleteDataModelLink error:', error);
    return json({ success: false as const, errors: [], error: String(error) });
  }
}
