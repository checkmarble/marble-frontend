// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { proxyTracfinExport } from './export-proxy.server';

const caseId = '3f0d6c1a-8a5e-4b8e-9d3b-1c2e4f5a6b7c';
const exportId = 'c4a8f2d0-5b1e-4c77-9a21-7e3d5f9b0a11';
const backendBaseUrl = 'https://marble.example.test';
const backendUrl = `${backendBaseUrl}/cases/${caseId}/tracfin/exports/${exportId}`;

const xml = new TextEncoder().encode('<?xml version="1.0" encoding="UTF-8"?><ds>' + 'x'.repeat(200) + '</ds>');

function chunked(bytes: Uint8Array, { chunkSize = 32, failAt }: { chunkSize?: number; failAt?: number } = {}) {
  let offset = 0;
  const state = { pulls: 0 };
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      state.pulls += 1;
      if (failAt !== undefined && offset >= failAt) {
        controller.error(new TypeError('upstream reset'));
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
  return { stream, state };
}

const artifactHeaders = (length: number) => ({
  'Content-Length': String(length),
  'Content-Type': 'application/xml; charset=utf-8',
  'Content-Disposition': `attachment; filename="tracfin-${exportId}.xml"`,
  'Cache-Control': 'max-age=3600',
  'X-Tracfin-Draft-Revision': '3',
});

async function readAll(response: Response) {
  return new Uint8Array(await response.arrayBuffer());
}

const proxy = (fetchBackend: (input: string, init?: RequestInit) => Promise<Response>, ids = { caseId, exportId }) =>
  proxyTracfinExport({ ...ids, backendBaseUrl, fetchBackend });

describe('proxyTracfinExport', () => {
  it('hands the artifact over unchanged with its framing headers', async () => {
    const fetchBackend = vi.fn(
      async () => new Response(xml, { status: 200, headers: artifactHeaders(xml.byteLength) }),
    );

    const response = await proxy(fetchBackend);

    expect(response.status).toBe(200);
    expect(await readAll(response)).toEqual(xml);
    expect(response.headers.get('content-length')).toBe(String(xml.byteLength));
    expect(response.headers.get('content-type')).toBe('application/xml; charset=utf-8');
    expect(response.headers.get('content-disposition')).toBe(`attachment; filename="tracfin-${exportId}.xml"`);
    expect(response.headers.get('x-tracfin-draft-revision')).toBe('3');
  });

  it('always answers with Cache-Control: no-store, whatever the backend said', async () => {
    const fetchBackend = vi.fn(
      async () => new Response(xml, { status: 200, headers: artifactHeaders(xml.byteLength) }),
    );
    expect((await proxy(fetchBackend)).headers.get('cache-control')).toBe('no-store');
  });

  it('asks the backend for the export of this case, uncompressed', async () => {
    const fetchBackend = vi.fn(
      async (_input: string, _init?: RequestInit) =>
        new Response(xml, { status: 200, headers: artifactHeaders(xml.byteLength) }),
    );

    await proxy(fetchBackend);

    expect(fetchBackend).toHaveBeenCalledTimes(1);
    const [url, init] = fetchBackend.mock.calls[0] ?? [];
    expect(url).toBe(backendUrl);
    expect(init?.method).toBe('GET');
    expect(new Headers(init?.headers).get('accept-encoding')).toBe('identity');
  });

  it('does not buffer the body: it is streamed on demand', async () => {
    const { stream, state } = chunked(xml, { chunkSize: 8 });
    const fetchBackend = vi.fn(
      async () => new Response(stream, { status: 200, headers: artifactHeaders(xml.byteLength) }),
    );

    const response = await proxy(fetchBackend);

    // 8-byte chunks: reading the whole artifact needs more than 25 pulls, only a few have happened.
    expect(state.pulls).toBeLessThan(5);
    expect(await readAll(response)).toEqual(xml);
    expect(state.pulls).toBeGreaterThan(25);
  });

  it('lets a body that breaks half way break the response, and appends nothing', async () => {
    const { stream } = chunked(xml, { chunkSize: 32, failAt: 64 });
    const fetchBackend = vi.fn(
      async () => new Response(stream, { status: 200, headers: artifactHeaders(xml.byteLength) }),
    );

    const response = await proxy(fetchBackend);
    const reader = (response.body as ReadableStream<Uint8Array>).getReader();
    let received = 0;
    await expect(
      (async () => {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) return;
          received += value.byteLength;
        }
      })(),
    ).rejects.toThrow();
    expect(received).toBe(64);
  });

  it('does not invent a Content-Length the backend did not send', async () => {
    const fetchBackend = vi.fn(
      async () => new Response(xml, { status: 200, headers: { 'Content-Type': 'application/xml; charset=utf-8' } }),
    );
    const response = await proxy(fetchBackend);
    expect(response.headers.get('content-length')).toBeNull();
    expect(await readAll(response)).toEqual(xml);
  });

  it.each([
    [403, 'not allowed'],
    [404, 'export not found'],
    [408, 'request timed out'],
    [409, 'export replaced'],
    [413, 'too large'],
    [422, 'not exportable'],
    [500, 'internal error'],
    [503, 'unavailable'],
  ])('forwards a %i with the JSON message of the backend', async (status, message) => {
    const fetchBackend = vi.fn(
      async () =>
        new Response(JSON.stringify({ message, error_code: '' }), {
          status,
          headers: { 'Content-Type': 'application/json' },
        }),
    );

    const response = await proxy(fetchBackend);

    expect(response.status).toBe(status);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ message });
  });

  it('forwards the error code when the backend sends one', async () => {
    const fetchBackend = vi.fn(
      async () => new Response(JSON.stringify({ message: 'm', error_code: 'MISSING_REQUIREMENT' }), { status: 501 }),
    );
    expect(await (await proxy(fetchBackend)).json()).toEqual({ message: 'm', error_code: 'MISSING_REQUIREMENT' });
  });

  it('keeps the status when the backend error is not JSON', async () => {
    const fetchBackend = vi.fn(
      async () => new Response('<html>Bad gateway</html>', { status: 502, statusText: 'Bad Gateway' }),
    );

    const response = await proxy(fetchBackend);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ message: 'Bad Gateway' });
  });

  it('answers 502 when the backend cannot be reached', async () => {
    const fetchBackend = vi.fn(async () => {
      throw new TypeError('fetch failed');
    });
    const response = await proxy(fetchBackend);
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ message: 'TRACFIN export download failed' });
  });

  it('answers 502 instead of passing on a success that carries no artifact', async () => {
    const fetchBackend = vi.fn(async () => new Response(null, { status: 204 }));
    expect((await proxy(fetchBackend)).status).toBe(502);
  });

  it.each([
    ['a case id that is not a UUID', { caseId: 'abc', exportId }],
    ['an export id that is not a UUID', { caseId, exportId: 'abc' }],
    ['a path traversal in the case id', { caseId: '../../admin', exportId }],
    ['a query in the export id', { caseId, exportId: `${exportId}?x=1` }],
    ['uppercase identifiers', { caseId: caseId.toUpperCase(), exportId }],
  ])('refuses %s with a 400, without calling the backend', async (_label, ids) => {
    const fetchBackend = vi.fn(async () => new Response(xml, { status: 200 }));

    const response = await proxy(fetchBackend, ids);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: 'Invalid case or export identifier' });
    expect(fetchBackend).not.toHaveBeenCalled();
  });
});
