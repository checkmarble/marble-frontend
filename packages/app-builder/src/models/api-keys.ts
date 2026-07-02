import { type ApiKeyDto, type CreatedApiKeyDto } from 'marble-api';

export const apiKeyRoleOptions = ['API_CLIENT'] as const;
export type ApiKeyRole = (typeof apiKeyRoleOptions)[number];

export function isApiKeyRole(role: string): role is ApiKeyRole {
  return apiKeyRoleOptions.includes(role as ApiKeyRole);
}

export interface ApiKey {
  id: string;
  description: string;
  organizationId: string;
  prefix: string;
  roles: (ApiKeyRole | 'UNKNWON')[];
}

export function adaptApiKey(apiKeyDto: ApiKeyDto): ApiKey {
  return {
    id: apiKeyDto.id,
    description: apiKeyDto.description,
    organizationId: apiKeyDto.organization_id,
    prefix: apiKeyDto.prefix,
    roles: apiKeyDto.roles.map((role) => (isApiKeyRole(role) ? role : 'UNKNWON')),
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
