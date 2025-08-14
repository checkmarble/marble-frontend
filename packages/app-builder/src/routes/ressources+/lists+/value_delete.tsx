import { deleteValuePayloadSchema } from '@app-builder/schemas/lists';
import { initServerServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { customListsRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const parsedForm = await parseFormSafe(request, deleteValuePayloadSchema);
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      values: parsedForm.formData,
      error: z.treeifyError(parsedForm.error),
    });
  }
  const { listId, listValueId } = parsedForm.data;
  await customListsRepository.deleteCustomListValue(listId, listValueId);

  return json({
    success: true as const,
    values: parsedForm.data,
    error: null,
  });
}
