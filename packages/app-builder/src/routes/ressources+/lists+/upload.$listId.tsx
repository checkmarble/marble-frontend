import { createServerFn } from '@app-builder/core/requests';
import { MAX_FILE_SIZE } from '@app-builder/hooks/useFormDropzone';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { getServerEnv } from '@app-builder/utils/environment';
import { getCustomListDataUploadEndpoint } from '@app-builder/utils/files';
import { unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from '@remix-run/node';
import { tryit } from 'radash';
import invariant from 'tiny-invariant';

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function uploadListAction({ request, params, context }) {
    const { tokenService } = context.authInfo;

    const listId = params['listId'];
    invariant(listId, 'listId is required');

    const [err, raw] = await tryit(unstable_parseMultipartFormData)(
      request,
      unstable_createMemoryUploadHandler({
        maxPartSize: MAX_FILE_SIZE,
      }),
    );

    if (err) {
      return;
    }

    return fetch(`${getServerEnv('MARBLE_API_URL')}${getCustomListDataUploadEndpoint(listId)}`, {
      body: raw,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await tokenService.getToken()}`,
      },
    });
  },
);
