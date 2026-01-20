import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { adaptDestroyDataModelReport, type DestroyDataModelReportDto } from '@app-builder/models/data-model';
import { isStatusConflictHttpError } from '@app-builder/models/http-errors';
import { deleteFieldPayloadSchema } from '@app-builder/queries/data/delete-field';
import { z } from 'zod/v4';

export const action = createServerFn([authMiddleware], async function deleteFieldAction({ request, context }) {
  const { apiClient } = context.authInfo;
  const raw = await request.json();

  const { success, error, data } = deleteFieldPayloadSchema.safeParse(raw);

  if (!success) return { success: false as const, errors: z.treeifyError(error) };

  try {
    const result = await apiClient.deleteDataModelField(data.fieldId, {
      perform: data.perform,
    });

    return {
      success: true as const,
      data: adaptDestroyDataModelReport(result as DestroyDataModelReportDto),
    };
  } catch (error) {
    // 409 Conflict is a valid response containing the DestroyDataModelReport with blocking conflicts
    if (isStatusConflictHttpError(error)) {
      return {
        success: true as const,
        data: adaptDestroyDataModelReport(error.data as DestroyDataModelReportDto),
      };
    }
    console.error('deleteDataModelField error:', error);
    return { success: false as const, errors: [], error: String(error) };
  }
});
