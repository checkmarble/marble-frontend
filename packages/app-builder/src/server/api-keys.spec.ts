import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { describe, expect, it, vi } from 'vitest';

import { createApiKey } from './api-keys';

describe('createApiKey', () => {
  it('creates an API key with role bindings and preserves returned bindings', async () => {
    const apiKey = {
      id: 'key-id',
      description: 'test',
      organization_id: 'org-id',
      prefix: 'abc',
      key: 'secret',
      roles: [{ id: 'binding-id', role: 'API_CLIENT' }, { role: 'OTHER' }],
    };
    const createApiKeyMock = vi.fn().mockResolvedValue({ api_key: apiKey });
    const api = { createApiKey: createApiKeyMock } as unknown as MarbleCoreApi;

    const result = await createApiKey(api, { description: 'test', role: 'API_CLIENT' });

    expect(createApiKeyMock).toHaveBeenCalledWith({ description: 'test', roles: [{ role: 'API_CLIENT' }] });
    expect(result.roles).toEqual(apiKey.roles);
  });
});
