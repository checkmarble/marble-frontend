import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { type ApiKey, adaptApiKey, adaptCreatedApiKey, type CreatedApiKey } from '@app-builder/models/api-keys';

export interface ApiKeyRepository {
  listApiKeys(): Promise<ApiKey[]>;
  createApiKey(args: { description: string; roles: string[] }): Promise<CreatedApiKey>;
  deleteApiKey(args: { apiKeyId: string }): Promise<void>;
}

export function makeGetApiKeyRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): ApiKeyRepository => ({
    listApiKeys: async () => {
      const { api_keys } = await marbleCoreApiClient.listApiKeys();

      return api_keys.map(adaptApiKey);
    },
    createApiKey: async ({ description, roles }) => {
      const { api_key } = await marbleCoreApiClient.createApiKey({
        description,
        roles,
      });

      return adaptCreatedApiKey(api_key);
    },
    deleteApiKey: async ({ apiKeyId }) => {
      await marbleCoreApiClient.deleteApiKey(apiKeyId);
    },
  });
}
