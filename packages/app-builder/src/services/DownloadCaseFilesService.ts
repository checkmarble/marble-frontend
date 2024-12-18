import { DownloadError, downloadFile } from '@app-builder/utils/download-file';
import { UnknownError } from '@app-builder/utils/unknown-error';
import { useState } from 'react';
import { z } from 'zod';

import { useBackendInfo } from './auth/auth.client';
import { clientServices } from './init.client';

export class AlreadyDownloadingError extends Error {}
export class FetchLinkError extends Error {}
export class AuthRequestError extends Error {}
type DownloadFileError =
  | AlreadyDownloadingError
  | FetchLinkError
  | DownloadError
  | UnknownError
  | AuthRequestError;

const fileDownloadUrlSchema = z.object({
  url: z.string(),
});

export function useDownloadCaseFiles(
  caseFileId: string,
  { onError }: { onError?: (error: DownloadFileError) => void } = {},
) {
  const [downloading, setDownloading] = useState(false);
  const { backendUrl, getAccessToken } = useBackendInfo(
    clientServices.authenticationClientService,
  );

  const downloadCaseFile = async () => {
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

      const downloadLink = `${backendUrl}/cases/files/${encodeURIComponent(
        caseFileId,
      )}/download_link`;
      const response = await fetch(downloadLink, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new FetchLinkError(
          'Internal error: Failed to download file: ' + response.statusText,
        );
      }
      const { url } = fileDownloadUrlSchema.parse(await response.json());
      await downloadFile(url);
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
    downloadCaseFile,
    downloadingCaseFile: downloading,
  };
}
