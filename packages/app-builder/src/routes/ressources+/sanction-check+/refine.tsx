import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs } from '@remix-run/node';

import { refineSearchSchema } from './search';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;

  const { sanctionCheck } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: refineSearchSchema });

  if (submission.status === 'success') {
    return await sanctionCheck.refineSanctionCheck(submission.value);
  }

  return submission.reply();
}
