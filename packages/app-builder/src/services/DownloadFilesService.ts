import { DownloadError, downloadFile } from '@app-builder/utils/download-file';
import { UnknownError } from '@app-builder/utils/unknown-error';
import { useState } from 'react';
import { z } from 'zod';

export class AlreadyDownloadingError extends Error {}
export class FetchLinkError extends Error {}
export class AuthRequestError extends Error {}
type DownloadFileError =
  | AlreadyDownloadingError
  | FetchLinkError
  | DownloadError
  | UnknownError
  | AuthRequestError;

const handleJsonResponse = async (response: Response): Promise<void> => {
  const fileDownloadUrlSchema = z.object({
    url: z.string(),
  });
  const json = await response.json();
  const url = fileDownloadUrlSchema.parse(json).url;
  return downloadFile(url, 'download');
};

const handleBlobResponse = async (response: Response): Promise<void> => {
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  return downloadFile(downloadUrl, 'download.zip').then(() => {
    window.URL.revokeObjectURL(downloadUrl);
  });
};

const handleDownloadResponse = async (response: Response): Promise<void> => {
  const contentType = response.headers.get('content-type')?.toLowerCase() || '';

  if (/application\/json/.test(contentType)) return handleJsonResponse(response);
  if (/(application\/zip|application\/octet-stream)/.test(contentType))
    return handleBlobResponse(response);
  throw new FetchLinkError(`Internal error: Unsupported content type ${contentType}`);
};

export function useDownloadFile(
  downloadEndpoint: string,
  { onError }: { onError?: (error: DownloadFileError) => void } = {},
) {
  const [downloading, setDownloading] = useState(false);

  const downloadCaseFile = async () => {
    try {
      if (downloading) {
        throw new AlreadyDownloadingError('Internal error: Already downloading');
      }
      setDownloading(true);

      const response = await fetch(downloadEndpoint, { method: 'GET' });

      if (!response.ok) {
        throw new FetchLinkError('Internal error: Failed to download file: ' + response.statusText);
      }
      await handleDownloadResponse(response);
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
