import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from '@app-builder/hooks/useFormDropzone';
import { type SuspiciousActivityReport } from '@app-builder/models/cases';
import { editSuspicionPayloadSchema } from '@app-builder/queries/cases/edit-suspicion';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import {
  type ActionFunctionArgs,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { decode } from 'decode-formdata';
import { tryit } from 'radash';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [err, raw] = await tryit(unstable_parseMultipartFormData)(
    request,
    unstable_createMemoryUploadHandler({
      maxPartSize: MAX_FILE_SIZE,
    }),
  );

  const [t, session, { cases }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  if (err) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:max_size_exceeded', { size: MAX_FILE_SIZE_MB }),
    });

    return Response.json({ success: false, errors: [] }, { headers: { 'Set-Cookie': await commitSession(session) } });
  }

  const { data, success, error } = editSuspicionPayloadSchema.safeParse(decode(raw));

  if (!success) return Response.json({ success, errors: z.treeifyError(error) });

  try {
    let sar: SuspiciousActivityReport | undefined = undefined;

    if (data.reportId && data.status === 'none') {
      await cases.deleteSuspiciousActivityReport({
        caseId: data.caseId,
        reportId: data.reportId,
      });
    } else if (data.reportId && data.status !== 'none') {
      sar = await cases.updateSuspiciousActivityReport({
        caseId: data.caseId,
        reportId: data.reportId,
        body: {
          status: data.status,
          ...(data.file && { file: data.file }),
        },
      });
    } else if (!data.reportId && data.status !== 'none') {
      sar = await cases.createSuspiciousActivityReport({
        caseId: data.caseId,
        body: {
          status: data.status,
          ...(data.file && { file: data.file }),
        },
      });
    } else {
      throw new Error('Should not happen');
    }

    return Response.json({ success, errors: [], data: sar });
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: t('common:errors.unknown'),
    });

    return Response.json(
      { success: false, errors: [(error as Error).message] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}
