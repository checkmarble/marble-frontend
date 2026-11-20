import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { describe, expect, it, vi } from 'vitest';

import { makeGetApiKeyRepository } from './ApiKeyRepository';

describe('API key repository', () => {
  it('creates an API key with role bindings and preserves returned bindings', async () => {
    const apiKey = {
      id: 'key-id',
      description: 'test',
      organization_id: 'org-id',
      prefix: 'abc',
      key: 'secret',
      roles: [{ id: 'binding-id', role: 'API_CLIENT' }, { role: 'OTHER' }],
    };
    const createApiKey = vi.fn().mockResolvedValue({ api_key: apiKey });
    const repository = makeGetApiKeyRepository()({ createApiKey } as unknown as MarbleCoreApi);

    const result = await repository.createApiKey({ description: 'test', role: 'API_CLIENT' });

    expect(createApiKey).toHaveBeenCalledWith({ description: 'test', roles: [{ role: 'API_CLIENT' }] });
    expect(result.roles).toEqual(apiKey.roles);
  });
});
