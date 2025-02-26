import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptApiKey,
  adaptCreatedApiKey,
  type ApiKey,
  type CreatedApiKey,
} from '@app-builder/models/api-keys';

export interface ApiKeyRepository {
  listApiKeys(): Promise<ApiKey[]>;
  createApiKey(args: { description: string; role: string }): Promise<CreatedApiKey>;
  deleteApiKey(args: { apiKeyId: string }): Promise<void>;
}

export function makeGetApiKeyRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): ApiKeyRepository => ({
    listApiKeys: async () => {
      const { api_keys } = await marbleCoreApiClient.listApiKeys();

      return api_keys.map(adaptApiKey);
    },
    createApiKey: async ({ description, role }) => {
      const { api_key } = await marbleCoreApiClient.createApiKey({
        description,
        role,
      });

      return adaptCreatedApiKey(api_key);
    },
    deleteApiKey: async ({ apiKeyId }) => {
      await marbleCoreApiClient.deleteApiKey(apiKeyId);
    },
  });
}
