import { DEFAULT_OIDC_SCOPES } from '@marble/shared';
import {
  type TenantDomain as TenantDomainDto,
  type TenantOidcConfiguration as TenantOidcConfigurationDto,
} from 'marble-api';

export type TenantOidcConfiguration = {
  issuer: string;
  clientId: string;
  scopes: string[];
  extraParams: Record<string, string>;
  emailClaim: string;
  ssoEnabled: boolean;
};

/** Without `clientSecret`, the backend keeps the stored secret (only while the issuer and client ID are unchanged). */
export type TenantOidcConfigurationInput = TenantOidcConfiguration & { clientSecret?: string };

export type TenantDomain = {
  id: string;
  domain: string;
  /** `null` while Marble has not verified the domain: it does not route to the identity provider yet. */
  verifiedAt: string | null;
};

export const adaptTenantOidcConfiguration = (dto: TenantOidcConfigurationDto): TenantOidcConfiguration => ({
  issuer: dto.issuer,
  clientId: dto.client_id,
  scopes: dto.scopes,
  extraParams: dto.extra_params ?? {},
  emailClaim: dto.email_claim,
  ssoEnabled: dto.sso_enabled,
});

export const adaptTenantDomain = (dto: TenantDomainDto): TenantDomain => ({
  id: dto.id,
  domain: dto.domain,
  verifiedAt: dto.verified_at,
});

const oidcConfigurationUrl = (apiUrl: string | null, tenantId: string) =>
  `${apiUrl ? apiUrl.replace(/\/+$/, '') : '<MARBLE_API_URL>'}/tenants/${tenantId}/oidc-configuration`;

// Single quotes keep the shell from expanding anything; each `'` closes, escapes and reopens the string.
const shellQuote = (value: string) => `'${value.replaceAll("'", `'\\''`)}'`;

/**
 * Turns SSO sign-in off with a recovery key. The PUT is a full replace, so the command writes back the
 * configuration it reads at run time; without `client_secret` the backend keeps the stored secret.
 * With `apiKey`, the command starts by exporting it so it runs as pasted.
 */
export function buildSsoRecoveryCurl({
  apiUrl,
  tenantId,
  apiKey,
}: {
  apiUrl: string | null;
  tenantId: string;
  apiKey?: string;
}): string {
  const url = oidcConfigurationUrl(apiUrl, tenantId);

  return [
    ...(apiKey ? [`export MARBLE_API_KEY=${shellQuote(apiKey)}`] : []),
    `curl -sSf "${url}" -H "X-API-Key: $MARBLE_API_KEY" \\`,
    `  | jq '.sso_enabled = false' \\`,
    `  | curl -X PUT "${url}" \\`,
    `    -H "X-API-Key: $MARBLE_API_KEY" \\`,
    `    -H "Content-Type: application/json" \\`,
    `    -d @-`,
  ].join('\n');
}

/**
 * Replaces the whole configuration with a recovery key. Values come from the saved configuration when
 * there is one, placeholders otherwise. The secret is never read back, so with a saved configuration the
 * body leaves `client_secret` out: the backend then keeps the stored secret, and the command run unedited
 * changes nothing. A new configuration requires it, so it is a placeholder there.
 */
export function buildSsoUpdateCurl({
  apiUrl,
  tenantId,
  configuration,
}: {
  apiUrl: string | null;
  tenantId: string;
  configuration: TenantOidcConfiguration | null;
}): string {
  const body = {
    issuer: configuration?.issuer ?? 'https://your-idp.com/oauth2/default',
    client_id: configuration?.clientId ?? 'your-client-id',
    ...(configuration ? {} : { client_secret: 'your-client-secret' }),
    scopes: configuration?.scopes ?? DEFAULT_OIDC_SCOPES,
    extra_params: configuration?.extraParams ?? {},
    email_claim: configuration?.emailClaim ?? '',
    sso_enabled: configuration?.ssoEnabled ?? false,
  };

  return [
    `curl -X PUT "${oidcConfigurationUrl(apiUrl, tenantId)}" \\`,
    `  -H "X-API-Key: $MARBLE_API_KEY" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d ${shellQuote(JSON.stringify(body, null, 2))}`,
  ].join('\n');
}
