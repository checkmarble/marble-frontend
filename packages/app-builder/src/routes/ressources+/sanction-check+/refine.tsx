import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { decode as decodeFormdata } from 'decode-formdata';

import { refineSearchSchema } from './search';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);

  const { sanctionCheck } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const data = decodeFormdata(await request.formData());
  const submission = refineSearchSchema.safeParse(data);

  if (submission.success) {
    const sanction = await sanctionCheck.refineSanctionCheck(submission.data);

    return redirect(
      getRoute('/cases/:caseId/d/:decisionId/screenings/:screeningId', {
        caseId: submission.data.caseId,
        decisionId: sanction.decisionId,
        screeningId: sanction.id,
      }),
    );
  }

  return { success: false, error: submission.error } as const;
}
