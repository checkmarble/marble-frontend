import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import type { ActionFunctionArgs } from '@remix-run/node';
import { decode as decodeFormdata } from 'decode-formdata';

import { refineSearchSchema } from './search';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);

  const { screening } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const data = decodeFormdata(await request.formData());
  const submission = refineSearchSchema.safeParse(data);

  if (submission.success) {
    return {
      success: true,
      data: await screening.refineScreening(submission.data),
    };
  }

  return { success: false, error: submission.error } as const;
}
