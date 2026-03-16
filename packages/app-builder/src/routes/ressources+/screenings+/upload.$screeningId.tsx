import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { getServerEnv } from '@app-builder/utils/environment';
import { getScreeningFileUploadEndpoint } from '@app-builder/utils/files';
import { unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from '@remix-run/node';
import { tryit } from 'radash';
import invariant from 'tiny-invariant';

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function uploadScreeningAction({ request, params, context }) {
    const { tokenService } = context.authInfo;

    const screeningId = params['screeningId'];
    invariant(screeningId, 'screeningId is required');

    const [err, raw] = await tryit(unstable_parseMultipartFormData)(
      request,
      unstable_createMemoryUploadHandler({
        maxPartSize: MAX_FILE_SIZE,
      }),
    );

    if (err) {
      return;
    }

    await fetch(`${getServerEnv('MARBLE_API_URL')}${getScreeningFileUploadEndpoint(screeningId)}`, {
      body: raw,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await tokenService.getToken()}`,
      },
    });

    return null;
  },
);
