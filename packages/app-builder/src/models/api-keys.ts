import { type ApiKeyDto, type CreatedApiKeyDto } from 'marble-api';
import { assertNever } from 'typescript-utils';

/** Roles offered when creating an API key from the API keys page. */
export const apiKeyRoleOptions = ['API_CLIENT'] as const;
// OIDC_CONFIG_EDITOR keys are created only as SSO recovery keys, from the security settings.
const apiKeyRoles = [...apiKeyRoleOptions, 'OIDC_CONFIG_EDITOR'] as const;
type ApiKeyRole = (typeof apiKeyRoles)[number];

function isApiKeyRole(role: string): role is ApiKeyRole {
  return apiKeyRoles.includes(role as ApiKeyRole);
}

export interface ApiKey {
  id: string;
  createdAt?: string;
  description: string;
  organizationId: string;
  prefix: string;
  role: ApiKeyRole | 'UNKNWON';
}

export function adaptApiKey(apiKeyDto: ApiKeyDto): ApiKey {
  const apiKey: ApiKey = {
    id: apiKeyDto.id,
    createdAt: apiKeyDto.created_at,
    description: apiKeyDto.description,
    organizationId: apiKeyDto.organization_id,
    prefix: apiKeyDto.prefix,
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
