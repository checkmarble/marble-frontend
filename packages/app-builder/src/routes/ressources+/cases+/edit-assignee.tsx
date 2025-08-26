import { editAssigneePayloadSchema } from '@app-builder/queries/cases/edit-assignee';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);

  const [raw, { cases }] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, data, error } = editAssigneePayloadSchema.safeParse(raw);

  if (!success) return { success: false, errors: z.treeifyError(error) };

  if (data.assigneeId) {
    await cases.assignUser({
      caseId: data.caseId,
      userId: data.assigneeId,
    });
  } else {
    await cases.unassignUser({
      caseId: data.caseId,
    });
  }

  return { success: true, errors: [] };
}
