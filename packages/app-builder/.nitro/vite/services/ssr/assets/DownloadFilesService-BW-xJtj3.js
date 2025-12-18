import { D as DownloadError, d as downloadFile } from "./download-file-C533i5xX.js";
import { r as reactExports } from "../server.js";
import { o as object, s as string } from "./short-uuid-MIi3jWzx.js";
class UnknownError extends Error {
  constructor(error) {
    super(`Internal error:  ${error instanceof Error ? error.message : "unknown error"}`);
  }
}
class AlreadyDownloadingError extends Error {
}
class FetchLinkError extends Error {
}
class AuthRequestError extends Error {
}
const handleJsonResponse = async (response) => {
  const fileDownloadUrlSchema = object({
    url: string()
  });
  const json = await response.json();
  const url = fileDownloadUrlSchema.parse(json).url;
  return downloadFile(url, "download");
};
const handleBlobResponse = async (response) => {
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  return downloadFile(downloadUrl, "download.zip").then(() => {
    window.URL.revokeObjectURL(downloadUrl);
  });
};
const handleDownloadResponse = async (response) => {
  const contentType = response.headers.get("content-type")?.toLowerCase() || "";
  if (/application\/json/.test(contentType)) return handleJsonResponse(response);
  if (/(application\/zip|application\/octet-stream)/.test(contentType)) return handleBlobResponse(response);
  throw new FetchLinkError(`Internal error: Unsupported content type ${contentType}`);
};
function useDownloadFile(downloadEndpoint, { onError } = {}) {
  const [downloading, setDownloading] = reactExports.useState(false);
  const downloadCaseFile = async () => {
    try {
      if (downloading) {
        throw new AlreadyDownloadingError("Internal error: Already downloading");
      }
      setDownloading(true);
      const response = await fetch(downloadEndpoint, { method: "GET" });
      if (!response.ok) {
        throw new FetchLinkError("Internal error: Failed to download file: " + response.statusText);
      }
      await handleDownloadResponse(response);
    } catch (error) {
      if (error instanceof AlreadyDownloadingError || error instanceof FetchLinkError || error instanceof DownloadError || error instanceof AuthRequestError) {
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
    downloadingCaseFile: downloading
  };
}
export {
  AlreadyDownloadingError as A,
  AuthRequestError as a,
  useDownloadFile as u
};
