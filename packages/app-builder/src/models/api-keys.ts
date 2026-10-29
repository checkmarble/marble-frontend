import { type ApiKeyDto, type CreatedApiKeyDto, type RoleBinding } from 'marble-api';

export const apiKeyRoleOptions = ['API_CLIENT'] as const;

export interface ApiKey {
  id: string;
  description: string;
  organizationId: string;
  prefix: string;
  roles: RoleBinding[];
}

export function adaptApiKey(apiKeyDto: ApiKeyDto): ApiKey {
  return {
    id: apiKeyDto.id,
    description: apiKeyDto.description,
    organizationId: apiKeyDto.organization_id,
    prefix: apiKeyDto.prefix,
    roles: apiKeyDto.roles ?? [],
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
