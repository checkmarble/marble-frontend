import { initServerServices } from '@app-builder/services/init.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { getScreeningFileUploadEndpoint } from '@app-builder/utils/files';
import { getRoute } from '@app-builder/utils/routes';
import {
  ActionFunctionArgs,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { tryit } from 'radash';
import invariant from 'tiny-invariant';

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { authService } = initServerServices(request);
  const { tokenService } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

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

  await fetch(
    `${getServerEnv('MARBLE_API_URL_SERVER')}${getScreeningFileUploadEndpoint(screeningId)}`,
    {
      body: raw,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await tokenService.getToken()}`,
      },
    },
  );

  return null;
};
