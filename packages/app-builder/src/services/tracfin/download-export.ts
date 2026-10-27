import type { TracfinExport } from '@app-builder/models/tracfin';
import { downloadFile } from '@app-builder/utils/download-file';

export type TracfinDownloadFailure =
  /** `download_url` is not `/cases/<case id>/tracfin/exports/<export id>` for this case and export. */
  | { kind: 'invalid_download_url' }
  /** The server answered with an error status. */
  | { kind: 'http'; status: number; message: string | null }
  /** The request failed before any response. */
  | { kind: 'network'; message: string | null }
  /** The body does not have the size announced by `Content-Length` or published as `export.size`. Nothing is saved. */
  | { kind: 'truncated'; received: number; expected: number }
  /** The body is complete but its SHA-256 differs from `export.sha256`. Nothing is saved. */
  | { kind: 'hash_mismatch' }
  /** The browser could not start the save. */
  | { kind: 'save_failed'; message: string | null };

export class TracfinDownloadError extends Error {
  override name = 'TracfinDownloadError';

  constructor(readonly failure: TracfinDownloadFailure) {
    super(`TRACFIN export download failed (${failure.kind})`);
  }
}

export type TracfinDownloadResult = {
  /** Bytes read, equal to `export.size` and to `Content-Length`. */
  received: number;
  /** True when the SHA-256 of the body was computed and equals `export.sha256`. */
  sha256Verified: boolean;
};

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const DOWNLOAD_URL = new RegExp(`^/cases/(${UUID})/tracfin/exports/(${UUID})$`);
const SAFE_FILENAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/**
 * The resource route of an export, derived from the `download_url` the server returned. Only the
 * exact server path of this case and this export is accepted: the URL is never used as given.
 */
function resourceRouteOf(tracfinExport: TracfinExport, caseId: string): string | null {
  const match = DOWNLOAD_URL.exec(tracfinExport.download_url);
  if (!match || match[1] !== caseId || match[2] !== tracfinExport.id) return null;
  return `/ressources/cases/tracfin/download/${caseId}/${tracfinExport.id}`;
}

function declaredLength(response: Response): number | null {
  const header = response.headers.get('content-length');
  if (header === null || !/^\d+$/.test(header)) return null;
  return Number(header);
}

function filenameOf(response: Response, tracfinExport: TracfinExport): string {
  const disposition = response.headers.get('content-disposition') ?? '';
  const name = /filename="([^"]*)"/i.exec(disposition)?.[1] ?? /filename=([^;\s]+)/i.exec(disposition)?.[1];
  return name && SAFE_FILENAME.test(name) ? name : `tracfin-${tracfinExport.id}.xml`;
}

async function messageOf(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json();
    if (typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string') {
      return body.message || null;
    }
  } catch {
    // Not a JSON error body.
  }
  return null;
}

/** Counts every byte it reads. A stream that breaks half way is a truncated body, with what was received. */
async function readBody(
  response: Response,
  expected: number,
): Promise<{ bytes: Uint8Array<ArrayBuffer>; received: number }> {
  const chunks: Uint8Array[] = [];
  let received = 0;
  if (response.body) {
    const reader = response.body.getReader();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.byteLength;
      }
    } catch {
      throw new TracfinDownloadError({ kind: 'truncated', received, expected });
    }
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { bytes, received };
}

async function sha256Hex(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Downloads the XML artifact of an export and saves it, only if it is complete.
 *
 * The body is read with a stream reader that counts bytes; it must equal `Content-Length` (when
 * announced) and the published `export.size`. When the browser offers `crypto.subtle`, the SHA-256
 * must equal `export.sha256` too. A failure rejects with a `TracfinDownloadError` and saves nothing:
 * a partial 200 response is not a file. Retrying is calling this again with the same export.
 */
export async function downloadTracfinExport(
  tracfinExport: TracfinExport,
  caseId: string,
  { fetchImpl = fetch }: { fetchImpl?: typeof fetch } = {},
): Promise<TracfinDownloadResult> {
  const route = resourceRouteOf(tracfinExport, caseId);
  if (!route) throw new TracfinDownloadError({ kind: 'invalid_download_url' });

  let response: Response;
  try {
    response = await fetchImpl(route, { method: 'GET', credentials: 'same-origin' });
  } catch (error) {
    throw new TracfinDownloadError({ kind: 'network', message: error instanceof Error ? error.message : null });
  }
  if (!response.ok) {
    throw new TracfinDownloadError({ kind: 'http', status: response.status, message: await messageOf(response) });
  }

  const announced = declaredLength(response);
  const { bytes, received } = await readBody(response, announced ?? tracfinExport.size);
  if (announced !== null && received !== announced) {
    throw new TracfinDownloadError({ kind: 'truncated', received, expected: announced });
  }
  if (received !== tracfinExport.size) {
    throw new TracfinDownloadError({ kind: 'truncated', received, expected: tracfinExport.size });
  }

  // `crypto.subtle` only exists in secure contexts: without it the size checks are all there is.
  let sha256Verified = false;
  if (tracfinExport.sha256 && typeof crypto !== 'undefined' && crypto.subtle) {
    if ((await sha256Hex(bytes)) !== tracfinExport.sha256.toLowerCase()) {
      throw new TracfinDownloadError({ kind: 'hash_mismatch' });
    }
    sha256Verified = true;
  }

  const objectUrl = URL.createObjectURL(
    new Blob([bytes], { type: response.headers.get('content-type') ?? 'application/xml' }),
  );
  try {
    await downloadFile(objectUrl, filenameOf(response, tracfinExport));
  } catch (error) {
    throw new TracfinDownloadError({ kind: 'save_failed', message: error instanceof Error ? error.message : null });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  return { received, sha256Verified };
}
