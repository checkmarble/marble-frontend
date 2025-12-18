const TIME_TO_OPEN_DOWNLOAD_MODALE = 150;
async function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A").replace(/%20/g, " ").replace(/%2C/g, ",").replace(/%7C/g, "|").replace(/%60/g, "`").replace(/%5E/g, "^");
      const clickHandler = () => {
        setTimeout(() => {
          URL.revokeObjectURL(url);
          removeEventListener("click", clickHandler);
          resolve();
        }, TIME_TO_OPEN_DOWNLOAD_MODALE);
      };
      a.addEventListener("click", clickHandler);
      a.click();
    } catch (error) {
      reject(new DownloadError(error));
    }
  });
}
class DownloadError extends Error {
  constructor(error) {
    super(`Internal error: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}
export {
  DownloadError as D,
  downloadFile as d
};
