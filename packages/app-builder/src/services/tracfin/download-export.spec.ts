// @vitest-environment node
import { tracfinDraftFixture, tracfinExportFixture } from '@app-builder/models/tracfin/__fixtures__';
import { downloadFile } from '@app-builder/utils/download-file';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadTracfinExport, TracfinDownloadError, type TracfinDownloadFailure } from './download-export';

vi.mock('@app-builder/utils/download-file', () => ({ downloadFile: vi.fn(async () => undefined) }));

const caseId = tracfinDraftFixture.case_id;
const exportId = tracfinExportFixture.id;
const route = `/ressources/cases/tracfin/download/${caseId}/${exportId}`;

const xml = new TextEncoder().encode(
  '<?xml version="1.0" encoding="UTF-8"?><ds><analyse>Analyse rédigée par l\'analyste.</analyse></ds>',
);

async function sha256Hex(bytes: Uint8Array<ArrayBuffer>) {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function exportOf(
  bytes: Uint8Array<ArrayBuffer>,
  sha256: string,
  overrides: Partial<typeof tracfinExportFixture> = {},
) {
  return { ...tracfinExportFixture, size: bytes.byteLength, sha256, ...overrides };
}

/** A body delivered in several chunks, optionally ending with a transport failure. */
function streamOf(bytes: Uint8Array, { chunkSize = 16, failAt }: { chunkSize?: number; failAt?: number } = {}) {
  let offset = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (failAt !== undefined && offset >= failAt) {
        controller.error(new TypeError('network error'));
        return;
      }
      const end = Math.min(offset + chunkSize, failAt ?? bytes.byteLength);
      if (offset >= end) {
        controller.close();
        return;
      }
      controller.enqueue(bytes.slice(offset, end));
      offset = end;
    },
  });
}

function artifactResponse(
  body: BodyInit | null,
  headers: Record<string, string> = {},
  init: ResponseInit = {},
): Response {
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="tracfin-${exportId}.xml"`,
      'Cache-Control': 'no-store',
      'X-Tracfin-Draft-Revision': '3',
      ...headers,
    },
    ...init,
  });
}

const saved: Blob[] = [];

beforeEach(() => {
  saved.length = 0;
  vi.mocked(downloadFile).mockClear();
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    saved.push(blob as Blob);
    return 'blob:tracfin-test';
  });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function failureOf(promise: Promise<unknown>): Promise<TracfinDownloadFailure> {
  const error = await promise.then(
    () => undefined,
    (reason: unknown) => reason,
  );
  expect(error).toBeInstanceOf(TracfinDownloadError);
  return (error as TracfinDownloadError).failure;
}

describe('downloadTracfinExport', () => {
  it('saves a complete body under the server filename and verifies its SHA-256', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      artifactResponse(streamOf(xml), { 'Content-Length': String(xml.byteLength) }),
    );
    const tracfinExport = exportOf(xml, await sha256Hex(xml));

    const result = await downloadTracfinExport(tracfinExport, caseId, { fetchImpl });

    expect(result).toEqual({ received: xml.byteLength, sha256Verified: true });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0]?.[0]).toBe(route);
    expect(downloadFile).toHaveBeenCalledWith('blob:tracfin-test', `tracfin-${exportId}.xml`);
    expect(new Uint8Array(await (saved[0] as Blob).arrayBuffer())).toEqual(xml);
    expect(saved[0]?.type).toBe('application/xml; charset=utf-8');
  });

  it('accepts a body announced by the published size alone, when Content-Length is absent', async () => {
    const fetchImpl = vi.fn(async () => artifactResponse(streamOf(xml)));
    const result = await downloadTracfinExport(exportOf(xml, await sha256Hex(xml)), caseId, { fetchImpl });
    expect(result.received).toBe(xml.byteLength);
    expect(downloadFile).toHaveBeenCalledTimes(1);
  });

  it('fails and saves nothing when the body is shorter than Content-Length', async () => {
    const cut = xml.slice(0, 40);
    const fetchImpl = vi.fn(async () => artifactResponse(cut, { 'Content-Length': String(xml.byteLength) }));

    const failure = await failureOf(downloadTracfinExport(exportOf(xml, await sha256Hex(xml)), caseId, { fetchImpl }));

    expect(failure).toEqual({ kind: 'truncated', received: 40, expected: xml.byteLength });
    expect(downloadFile).not.toHaveBeenCalled();
    expect(saved).toHaveLength(0);
  });

  it('fails with what was received when the connection breaks half way', async () => {
    const fetchImpl = vi.fn(async () =>
      artifactResponse(streamOf(xml, { chunkSize: 16, failAt: 32 }), { 'Content-Length': String(xml.byteLength) }),
    );

    const failure = await failureOf(downloadTracfinExport(exportOf(xml, await sha256Hex(xml)), caseId, { fetchImpl }));

    expect(failure).toEqual({ kind: 'truncated', received: 32, expected: xml.byteLength });
    expect(downloadFile).not.toHaveBeenCalled();
  });

  it('fails when the body matches Content-Length but not the published size', async () => {
    const shorter = xml.slice(0, 50);
    const fetchImpl = vi.fn(async () => artifactResponse(shorter, { 'Content-Length': '50' }));

    const failure = await failureOf(downloadTracfinExport(exportOf(xml, await sha256Hex(xml)), caseId, { fetchImpl }));

    expect(failure).toEqual({ kind: 'truncated', received: 50, expected: xml.byteLength });
    expect(downloadFile).not.toHaveBeenCalled();
  });

  it('fails when a body without Content-Length does not have the published size', async () => {
    const fetchImpl = vi.fn(async () => artifactResponse(xml.slice(0, 10)));

    const failure = await failureOf(downloadTracfinExport(exportOf(xml, await sha256Hex(xml)), caseId, { fetchImpl }));

    expect(failure).toEqual({ kind: 'truncated', received: 10, expected: xml.byteLength });
  });

  it('fails when the SHA-256 differs, even though every byte count is right', async () => {
    const tampered = xml.slice();
    tampered[10] = (tampered[10] ?? 0) ^ 0xff;
    const fetchImpl = vi.fn(async () => artifactResponse(tampered, { 'Content-Length': String(tampered.byteLength) }));

    const failure = await failureOf(downloadTracfinExport(exportOf(xml, await sha256Hex(xml)), caseId, { fetchImpl }));

    expect(failure).toEqual({ kind: 'hash_mismatch' });
    expect(downloadFile).not.toHaveBeenCalled();
    expect(saved).toHaveLength(0);
  });

  it('compares the hash whatever the case of the published digest', async () => {
    const fetchImpl = vi.fn(async () => artifactResponse(xml, { 'Content-Length': String(xml.byteLength) }));
    const result = await downloadTracfinExport(exportOf(xml, (await sha256Hex(xml)).toUpperCase()), caseId, {
      fetchImpl,
    });
    expect(result.sha256Verified).toBe(true);
  });

  it('still saves a complete body when the browser has no crypto.subtle, and says it was not verified', async () => {
    vi.stubGlobal('crypto', {});
    const fetchImpl = vi.fn(async () => artifactResponse(xml, { 'Content-Length': String(xml.byteLength) }));

    const result = await downloadTracfinExport(exportOf(xml, 'a'.repeat(64)), caseId, { fetchImpl });

    expect(result).toEqual({ received: xml.byteLength, sha256Verified: false });
    expect(downloadFile).toHaveBeenCalledTimes(1);
  });

  it('retries on the same export object after a failure', async () => {
    const tracfinExport = exportOf(xml, await sha256Hex(xml));
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(artifactResponse(xml.slice(0, 20), { 'Content-Length': String(xml.byteLength) }))
      .mockResolvedValueOnce(artifactResponse(xml, { 'Content-Length': String(xml.byteLength) }));

    await expect(downloadTracfinExport(tracfinExport, caseId, { fetchImpl })).rejects.toBeInstanceOf(
      TracfinDownloadError,
    );
    await expect(downloadTracfinExport(tracfinExport, caseId, { fetchImpl })).resolves.toEqual({
      received: xml.byteLength,
      sha256Verified: true,
    });

    expect(fetchImpl.mock.calls.map(([url]) => url)).toEqual([route, route]);
    expect(downloadFile).toHaveBeenCalledTimes(1);
  });

  it('reports the status and message of an error response', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ message: 'export not found', error_code: '' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
    );

    const failure = await failureOf(downloadTracfinExport(tracfinExportFixture, caseId, { fetchImpl }));

    expect(failure).toEqual({ kind: 'http', status: 404, message: 'export not found' });
    expect(downloadFile).not.toHaveBeenCalled();
  });

  it('reports a response that is an error without a JSON body', async () => {
    const fetchImpl = vi.fn(async () => new Response('Bad gateway', { status: 502 }));
    const failure = await failureOf(downloadTracfinExport(tracfinExportFixture, caseId, { fetchImpl }));
    expect(failure).toEqual({ kind: 'http', status: 502, message: null });
  });

  it('reports a request that failed before any response', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    const failure = await failureOf(downloadTracfinExport(tracfinExportFixture, caseId, { fetchImpl }));
    expect(failure).toEqual({ kind: 'network', message: 'Failed to fetch' });
  });

  it('falls back to a safe filename when the server one is not', async () => {
    const fetchImpl = vi.fn(async () =>
      artifactResponse(xml, {
        'Content-Length': String(xml.byteLength),
        'Content-Disposition': 'attachment; filename="../../etc/passwd"',
      }),
    );
    await downloadTracfinExport(exportOf(xml, await sha256Hex(xml)), caseId, { fetchImpl });
    expect(downloadFile).toHaveBeenCalledWith('blob:tracfin-test', `tracfin-${exportId}.xml`);
  });

  it('reports a save that the browser refused', async () => {
    vi.mocked(downloadFile).mockRejectedValueOnce(new Error('blocked'));
    const fetchImpl = vi.fn(async () => artifactResponse(xml, { 'Content-Length': String(xml.byteLength) }));

    const failure = await failureOf(downloadTracfinExport(exportOf(xml, await sha256Hex(xml)), caseId, { fetchImpl }));

    expect(failure).toEqual({ kind: 'save_failed', message: 'blocked' });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:tracfin-test');
  });
});

describe('download_url', () => {
  const otherCase = '0b1c8a7e-5c1f-4d3a-9e2b-6f7a8b9c0d1e';
  const otherExport = '7d6c5b4a-3f2e-4d1c-8b0a-9f8e7d6c5b4a';

  it.each([
    ['another case', `/cases/${otherCase}/tracfin/exports/${exportId}`],
    ['another export', `/cases/${caseId}/tracfin/exports/${otherExport}`],
    ['an absolute URL', `https://evil.example/cases/${caseId}/tracfin/exports/${exportId}`],
    ['a protocol-relative URL', `//evil.example/cases/${caseId}/tracfin/exports/${exportId}`],
    ['a query string', `/cases/${caseId}/tracfin/exports/${exportId}?redirect=https://evil.example`],
    ['a fragment', `/cases/${caseId}/tracfin/exports/${exportId}#x`],
    ['a trailing path', `/cases/${caseId}/tracfin/exports/${exportId}/../../..`],
    ['a trailing slash', `/cases/${caseId}/tracfin/exports/${exportId}/`],
    ['uppercase identifiers', `/cases/${caseId.toUpperCase()}/tracfin/exports/${exportId.toUpperCase()}`],
    ['another resource', `/cases/${caseId}/sar/${exportId}/download`],
    ['an empty value', ''],
  ])('is refused when it is %s, and nothing is fetched', async (_label, downloadUrl) => {
    const fetchImpl = vi.fn(async () => artifactResponse(xml));

    const failure = await failureOf(
      downloadTracfinExport({ ...tracfinExportFixture, download_url: downloadUrl }, caseId, { fetchImpl }),
    );

    expect(failure).toEqual({ kind: 'invalid_download_url' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('is refused when the case differs from the one being worked on', async () => {
    const fetchImpl = vi.fn(async () => artifactResponse(xml));
    const failure = await failureOf(downloadTracfinExport(tracfinExportFixture, otherCase, { fetchImpl }));
    expect(failure).toEqual({ kind: 'invalid_download_url' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
