// This is an empirical value to wait for the download modal to open (in ms)
// Usefull to await for downloadFile and display a loading indicator
const TIME_TO_OPEN_DOWNLOAD_MODALE = 150;

/**
 * Utility function to download a file in the browser
 */
export async function downloadFile(url: string, filename: string) {
  return new Promise<void>((resolve, reject) => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
        // These characters can be decoded safely
        .replace(/%20/g, ' ')
        .replace(/%2C/g, ',')
        .replace(/%7C/g, '|')
        .replace(/%60/g, '`')
        .replace(/%5E/g, '^');

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
      `Internal error: ${
        error instanceof Error ? error.message : 'unknown error'
      }`,
    );
  }
}
