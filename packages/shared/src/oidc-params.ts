// OIDC scopes and extra authorization parameters are edited as text:
// scopes separated by spaces or commas, extra parameters as one `key=value` per line.

/** The scopes the backend saves, and its sign-in sends, when none are given. */
export const DEFAULT_OIDC_SCOPES = ['openid', 'profile', 'email'];

export const parseScopes = (scopes: string) => scopes.split(/[\s,]+/).filter(Boolean);

export const formatScopes = (scopes: string[]) => scopes.join(' ');

/** Returns `null` when a non-blank line is not a `key=value` pair with a key. */
export const parseExtraParams = (extraParams: string): Record<string, string> | null => {
  const params: Record<string, string> = {};
  for (const line of extraParams.split('\n')) {
    if (!line.trim()) continue;
    const separator = line.indexOf('=');
    const key = line.slice(0, separator).trim();
    if (separator === -1 || !key) return null;
    params[key] = line.slice(separator + 1).trim();
  }
  return params;
};

export const formatExtraParams = (params: Record<string, string>) =>
  Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

type OidcClient = { issuer: string; clientId: string };

/** The backend keeps the stored client secret only while the issuer and client ID stay the same. */
export const isClientSecretRequired = (saved: OidcClient | null, values: OidcClient) =>
  !saved || values.issuer.trim() !== saved.issuer || values.clientId.trim() !== saved.clientId;
