import { isCanonicalUuid } from '@app-builder/models/tracfin';

type ProxyTracfinExportArgs = {
  caseId: string;
  exportId: string;
  /** Backend base URL, without a trailing slash (`MARBLE_API_URL`). */
  backendBaseUrl: string;
  /** An authenticated fetch against the backend. */
  fetchBackend: (input: string, init?: RequestInit) => Promise<Response>;
};

// Headers of the artifact response that the browser needs, copied as the backend wrote them.
const FORWARDED_HEADERS = ['content-length', 'content-type', 'content-disposition', 'x-tracfin-draft-revision'];

function errorResponse(status: number, message: string, errorCode?: string) {
  return Response.json(
    { message, ...(errorCode ? { error_code: errorCode } : {}) },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

async function readBackendError(response: Response): Promise<Response> {
  let message = response.statusText || 'TRACFIN export download failed';
  let errorCode: string | undefined;
  try {
    const body: unknown = await response.json();
    if (typeof body === 'object' && body !== null) {
      if ('message' in body && typeof body.message === 'string' && body.message) message = body.message;
      if ('error_code' in body && typeof body.error_code === 'string' && body.error_code) errorCode = body.error_code;
    }
  } catch {
    // Not a JSON error body: keep the status text.
  }
  return errorResponse(response.status, message, errorCode);
}

/**
 * Streams the XML artifact of an export from the backend to the browser. The body is handed over
 * unchanged and never buffered: the backend writes `Content-Length` equal to the published size, and
 * a body that ends early must reach the browser as an interrupted response, never as a shorter file.
 * Error statuses are forwarded with their JSON message.
 */
export async function proxyTracfinExport({
  caseId,
  exportId,
  backendBaseUrl,
  fetchBackend,
}: ProxyTracfinExportArgs): Promise<Response> {
  // The IDs are interpolated into the backend URL: only canonical UUIDs may reach it.
  if (!isCanonicalUuid(caseId) || !isCanonicalUuid(exportId)) {
    return errorResponse(400, 'Invalid case or export identifier');
  }

  let upstream: Response;
  try {
    upstream = await fetchBackend(`${backendBaseUrl}/cases/${caseId}/tracfin/exports/${exportId}`, {
      method: 'GET',
      // Content-Length must describe the bytes forwarded: never let the backend compress them.
      headers: { 'Accept-Encoding': 'identity' },
    });
  } catch {
    return errorResponse(502, 'TRACFIN export download failed');
  }

  if (upstream.status >= 400) return readBackendError(upstream);
  // Anything but a 200 with a body is not an artifact, and must not be handed over as one.
  if (upstream.status !== 200 || !upstream.body) {
    return errorResponse(502, 'TRACFIN export download returned no artifact');
  }

  const headers = new Headers();
  for (const name of FORWARDED_HEADERS) {
    const value = upstream.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  headers.set('Cache-Control', 'no-store');
  return new Response(upstream.body, { status: 200, headers });
}
