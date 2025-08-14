import { MAX_FILE_SIZE } from '@app-builder/hooks/useFormDropzone';
import { initServerServices } from '@app-builder/services/init.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { getCustomListDataUploadEndpoint } from '@app-builder/utils/files';
import { getRoute } from '@app-builder/utils/routes';
import {
  ActionFunctionArgs,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { tryit } from 'radash';
import invariant from 'tiny-invariant';

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { authService } = initServerServices(request);
  const { tokenService } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

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

  return fetch(
    `${getServerEnv('MARBLE_API_URL_SERVER')}${getCustomListDataUploadEndpoint(listId)}`,
    {
      body: raw,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await tokenService.getToken()}`,
      },
    },
  );
};
