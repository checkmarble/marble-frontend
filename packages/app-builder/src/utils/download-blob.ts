// This is an empirical value to wait for the download modal to open (in ms)
// Usefull to await for downloadBlob and display a loading indicator
const TIME_TO_OPEN_DOWNLOAD_MODALE = 150;

/**
 * Utility function to download a blob as a file in the browser
 */
export async function downloadBlob(blob: Blob, filename?: string) {
  return new Promise<void>((resolve, reject) => {
    try {
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'download';

      // Click handler that releases the object URL after the element has been clicked
      // This is required for one-off downloads of the blob content
      const clickHandler = () => {
        setTimeout(() => {
          URL.revokeObjectURL(url);
          removeEventListener('click', clickHandler);
          resolve();
        }, TIME_TO_OPEN_DOWNLOAD_MODALE);
      };

      a.addEventListener('click', clickHandler);
      a.click();
    } catch (error) {
      reject(new DownloadError(error));
    }
  });
}

export class DownloadError extends Error {
  constructor(error: unknown) {
    super(
      `Internal error: Failed to download decisions: ${
        error instanceof Error ? error.message : 'unknown error'
      }`
    );
  }
}
