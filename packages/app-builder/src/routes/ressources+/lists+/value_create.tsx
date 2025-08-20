import { addValuePayloadSchema } from '@app-builder/schemas/lists';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { type Namespace } from 'i18next';
import { z } from 'zod/v4';

export const handle = {
  i18n: ['lists', 'navigation', 'common'] satisfies Namespace,
};

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);

  const [raw, { customListsRepository }] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = addValuePayloadSchema.safeParse(raw);

  if (!success) return json({ success: false as const, errors: z.treeifyError(error) });

  await customListsRepository.createCustomListValue(data.listId, {
    value: data.value,
  });

  return json({ success: true as const });
}
