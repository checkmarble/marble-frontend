import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from '@app-builder/hooks/useFormDropzone';
import { createAnnotationPayloadSchema } from '@app-builder/schemas/annotations';
import { initServerServices } from '@app-builder/services/init.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { getClientAnnotationFileUploadEndpoint } from '@app-builder/utils/files';
import { getRoute } from '@app-builder/utils/routes';
import {
  type ActionFunctionArgs,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { redirect } from '@remix-run/react';
import { decode } from 'decode-formdata';
import { tryit } from 'radash';
import { match } from 'ts-pattern';
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

  const [t, session, authSession, { dataModelRepository }] = await Promise.all([
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
  if (!token) {
    return redirect(getRoute('/sign-in'));
  }

  const { data, success, error } = createAnnotationPayloadSchema.safeParse(
    decode(raw, {
      arrays: ['payload.files', 'payload.addedTags', 'payload.removedAnnotations'],
    }),
  );

  if (!success) {
    return Response.json({ success, errors: z.treeifyError(error) });
  }

  try {
    return await match(data)
      .with({ type: 'comment' }, async ({ payload: { text }, ...data }) => {
        await dataModelRepository.createAnnotation(data.tableName, data.objectId, {
          type: 'comment',
          caseId: data.caseId,
          payload: {
            text,
          },
        });

        return Response.json(
          { success: true },
          { headers: { 'Set-Cookie': await commitSession(session) } },
        );
      })
      .with(
        { type: 'tag' },
        async ({ payload: { addedTags = [], removedAnnotations = [] }, ...data }) => {
          const promises: Promise<Response | void>[] = [
            ...addedTags.map((tagAdded) =>
              dataModelRepository.createAnnotation(data.tableName, data.objectId, {
                type: 'tag',
                caseId: data.caseId,
                payload: {
                  tagId: tagAdded,
                },
              }),
            ),
            ...removedAnnotations.map((annotationId) =>
              dataModelRepository.deleteAnnotation(annotationId),
            ),
          ];

          await Promise.all(promises);

          return Response.json(
            { success: true },
            { headers: { 'Set-Cookie': await commitSession(session) } },
          );
        },
      )
      .with({ type: 'file' }, async ({ payload: { files }, ...data }) => {
        const promises: Promise<Response>[] = [];

        if (files.length > 0) {
          const body = new FormData();
          body.append('caption', 'File annotation');
          body.append('case_id', data.caseId);
          files.forEach((file) => {
            body.append('files[]', file);
          });

          const endpoint = getClientAnnotationFileUploadEndpoint(data.tableName, data.objectId);
          promises.push(
            fetch(`${getServerEnv('MARBLE_API_URL')}${endpoint}`, {
              method: 'POST',
              body,
              headers: { Authorization: `Bearer ${token}` },
            }).then((response) => {
              if (response.status === 200) return response;
              throw response;
            }),
          );
        }

        await Promise.all(promises);

        return Response.json(
          { success: true },
          { headers: { 'Set-Cookie': await commitSession(session) } },
        );
      })
      .exhaustive();
  } catch (_err) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return Response.json(
      { success: false },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}
