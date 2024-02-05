import { type MarbleApi } from '@app-builder/infra/marble-api';
import {
  adaptApiKey,
  adaptCreatedApiKey,
  type ApiKey,
  type CreatedApiKey,
} from '@app-builder/models/api-keys';

export interface ApiKeyRepository {
  listApiKeys(): Promise<ApiKey[]>;
  createApiKey(args: {
    description: string;
    role: string;
  }): Promise<CreatedApiKey>;
  deleteApiKey(args: { apiKeyId: string }): Promise<void>;
}

export function getApiKeyRepository() {
  return (marbleApiClient: MarbleApi): ApiKeyRepository => ({
    listApiKeys: async () => {
      const { api_keys } = await marbleApiClient.listApiKeys();

      return api_keys.map(adaptApiKey);
    },
    createApiKey: async ({ description, role }) => {
      const { api_key } = await marbleApiClient.createApiKey({
        description,
        role,
      });

      return adaptCreatedApiKey(api_key);
    },
    deleteApiKey: async ({ apiKeyId }) => {
      await marbleApiClient.deleteApiKey(apiKeyId);
    },
  });
}
