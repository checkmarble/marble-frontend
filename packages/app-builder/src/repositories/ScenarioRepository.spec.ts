import { initializeMarbleCoreAPIClient } from '@app-builder/infra/marblecore-api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeGetScenarioRepository } from './ScenarioRepository';

describe('listOrganizationScenarioIterationsMetadata', () => {
  const fetchMock = vi.fn(
    async () =>
      new Response('[]', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
  );

  beforeEach(() => {
    fetchMock.mockClear();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // The client wrapper appends its options as the last argument, so a call without arguments would
  // lose them, and with them the configured API URL and authentication.
  it('goes through the configured API client', async () => {
    const { marbleCoreApiClient } = initializeMarbleCoreAPIClient({
      request: new Request('http://app.test'),
      baseUrl: 'http://api.test',
    });

    await makeGetScenarioRepository()(marbleCoreApiClient).listOrganizationScenarioIterationsMetadata();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String((fetchMock.mock.calls[0] as unknown[])[0])).toBe('http://api.test/scenario-iterations/metadata');
  });
});
