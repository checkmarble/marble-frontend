import { deleteListPayloadSchema } from '@app-builder/schemas/lists';
import { initServerServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { customListsRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const parsedForm = await parseFormSafe(request, deleteListPayloadSchema);
  if (!parsedForm.success) {
    // TODO check error
    return null;
  }
  const { listId } = parsedForm.data;
  await customListsRepository.deleteCustomList(listId);

  return { redirectTo: getRoute('/lists') };
}
