import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from '@app-builder/hooks/useFormDropzone';
import { addCommentPayloadSchema } from '@app-builder/queries/cases/add-comment';
import { initServerServices } from '@app-builder/services/init.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { getCaseFileUploadEndpoint } from '@app-builder/utils/files';
import { getRoute } from '@app-builder/utils/routes';
import {
  type ActionFunctionArgs,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { redirect } from '@remix-run/react';
import { decode } from 'decode-formdata';
import { tryit } from 'radash';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
    authSessionService: { getSession: getAuthSession },
  } = initServerServices(request);

  const [err, raw] = await tryit(unstable_parseMultipartFormData)(
    request,
    unstable_createMemoryUploadHandler({
      maxPartSize: MAX_FILE_SIZE,
    }),
  );

  const [t, session, authSession, { cases }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    getAuthSession(request),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  if (err) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:max_size_exceeded', { size: MAX_FILE_SIZE_MB }),
    });

    return Response.json(
      { success: false, errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }

  const token = authSession.get('authToken')?.access_token;

  if (!token) return redirect(getRoute('/sign-in'));

  const { data, success, error } = addCommentPayloadSchema.safeParse(
    decode(raw, { arrays: ['files'] }),
  );

  if (!success) return Response.json({ success, errors: z.treeifyError(error) });

  try {
    const promises = [];

    if (data.comment !== '') {
      promises.push(cases.addComment({ caseId: data.caseId, body: { comment: data.comment } }));
    }

    if (data.files.length > 0) {
      const body = new FormData();
      data.files.forEach((file) => {
        body.append('file[]', file);
      });

      promises.push(
        fetch(`${getServerEnv('MARBLE_API_URL')}${getCaseFileUploadEndpoint(data.caseId)}`, {
          method: 'POST',
          body,
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
    }

    await Promise.all(promises);

    return Response.json(
      { success, errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  } catch (_error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: t('common:errors.unknown'),
    });

    return Response.json(
      { success: false, errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}
