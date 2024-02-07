import { type ApiKeyDto, type CreatedApiKeyDto } from 'marble-api';
import { assertNever } from 'typescript-utils';

export const apiKeyRoleOptions = ['API_CLIENT'] as const;
type ApiKeyRole = (typeof apiKeyRoleOptions)[number];

function isApiKeyRole(role: string): role is ApiKeyRole {
  return apiKeyRoleOptions.includes(role as ApiKeyRole);
}

export interface ApiKey {
  id: string;
  organizationId: string;
  description: string;
  role: ApiKeyRole | 'UNKNWON';
}

export function adaptApiKey(apiKeyDto: ApiKeyDto): ApiKey {
  const apiKey: ApiKey = {
    id: apiKeyDto.id,
    organizationId: apiKeyDto.organization_id,
    description: apiKeyDto.description,
    role: 'UNKNWON',
  };
  if (isApiKeyRole(apiKeyDto.role)) {
    apiKey.role = apiKeyDto.role;
  } else {
    // @ts-expect-error should be unreachable if all roles are handled
    assertNever('[ApiKeyDto] Unknown role', apiKeyDto.role);
  }
  return apiKey;
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
