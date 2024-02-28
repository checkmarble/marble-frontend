import { downloadBlob, DownloadError } from '@app-builder/utils/download-blob';
import { UnknownError } from '@app-builder/utils/unknown-error';
import { useState } from 'react';

import { useBackendInfo } from './auth/auth.client';
import { clientServices } from './init.client';

export class AlreadyDownloadingError extends Error {}
export class FetchLinkError extends Error {}
export class AuthRequestError extends Error {}
type DownloadDecisionsError =
  | AlreadyDownloadingError
  | FetchLinkError
  | DownloadError
  | UnknownError
  | AuthRequestError;

export function useDownloadDecisions(
  scheduleExecutionId: string,
  { onError }: { onError?: (error: DownloadDecisionsError) => void } = {},
) {
  const [downloading, setDownloading] = useState(false);
  const { backendUrl, getAccessToken } = useBackendInfo(
    clientServices.authenticationClientService,
  );

  const downloadDecisions = async () => {
    try {
      if (downloading) {
        throw new AlreadyDownloadingError(
          'Internal error: Already downloading',
        );
      }
      setDownloading(true);

      const tokenResponse = await getAccessToken();
      if (!tokenResponse.success) {
        throw new AuthRequestError();
      }

      const downloadLink = `${backendUrl}/scheduled-executions/${encodeURIComponent(
        scheduleExecutionId,
      )}/decisions.zip`;

      const response = await fetch(downloadLink, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new FetchLinkError(
          'Internal error: Failed to download decisions: ' +
            response.statusText,
        );
      }

      const file = await response.blob();
      await downloadBlob(file, `decisions-${scheduleExecutionId}`);
    } catch (error) {
      if (
        error instanceof AlreadyDownloadingError ||
        error instanceof FetchLinkError ||
        error instanceof DownloadError ||
        error instanceof AuthRequestError
      ) {
        onError?.(error);
      } else {
        onError?.(new UnknownError(error));
      }
    } finally {
      setDownloading(false);
    }
  };

  return {
    downloadDecisions,
    downloadingDecisions: downloading,
  };
}
