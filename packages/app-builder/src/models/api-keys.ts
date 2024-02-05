import { type ApiKeyDto, type CreatedApiKeyDto } from 'marble-api';

export interface ApiKey {
  id: string;
  organizationId: string;
  description: string;
  role: string;
}

export function adaptApiKey(apiKey: ApiKeyDto): ApiKey {
  return {
    id: apiKey.id,
    organizationId: apiKey.organization_id,
    description: apiKey.description,
    role: apiKey.role,
  };
}

export type CreatedApiKey = ApiKey & {
  key: string;
};

export function adaptCreatedApiKey(apiKey: CreatedApiKeyDto): CreatedApiKey {
  return {
    ...adaptApiKey(apiKey),
    key: apiKey.key,
  };
}
