import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { getServerEnv } from '@app-builder/utils/environment';
import { type UploadLog } from 'marble-api';
import invariant from 'tiny-invariant';

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function getUploadLogsLoader({ params, context }) {
    const { tokenService } = context.authInfo;
    const objectType = params['objectType'];
    invariant(objectType, 'objectType is required');

    const token = await tokenService.getToken();
    const res = await fetch(
      `${getServerEnv('MARBLE_API_URL')}/ingestion/${encodeURIComponent(objectType)}/upload-logs`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const uploadLogs = (await res.json()) as UploadLog[];
    return data(uploadLogs);
  },
);
