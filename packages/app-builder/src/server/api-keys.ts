import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { type ApiKey, adaptApiKey, adaptCreatedApiKey, type CreatedApiKey } from '@app-builder/models/api-keys';

export async function listApiKeys(api: MarbleCoreApi): Promise<ApiKey[]> {
  const { api_keys } = await api.listApiKeys();

  return api_keys.map(adaptApiKey);
}

export async function createApiKey(
  api: MarbleCoreApi,
  { description, role }: { description: string; role: string },
): Promise<CreatedApiKey> {
  const { api_key } = await api.createApiKey({
    description,
    roles: [{ role }],
  });

  return adaptCreatedApiKey(api_key);
}
