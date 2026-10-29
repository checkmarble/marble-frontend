import type { TenantOidcConfiguration } from '@bo/data/tenants';
import type { PutTenantOidcConfigurationPayload } from '@bo/schemas/tenant-oidc';
import { z } from 'zod/v4';

/** Scopes and extra parameters are edited as text: space-separated scopes, one `key=value` per line. */
export type TenantOidcFormValues = {
  issuer: string;
  clientId: string;
  clientSecret: string;
  scopes: string;
  extraParams: string;
  emailClaim: string;
  ssoEnabled: boolean;
};

export const toTenantOidcFormValues = (config: TenantOidcConfiguration | null): TenantOidcFormValues => ({
  issuer: config?.issuer ?? '',
  clientId: config?.client_id ?? '',
  clientSecret: '',
  scopes: config?.scopes.join(' ') ?? '',
  extraParams: Object.entries(config?.extra_params ?? {})
    .map(([key, value]) => `${key}=${value}`)
    .join('\n'),
  emailClaim: config?.email_claim ?? '',
  ssoEnabled: config?.sso_enabled ?? true,
});

export const parseScopes = (scopes: string) => scopes.split(/[\s,]+/).filter(Boolean);

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

/**
 * The backend keeps the stored client secret when none is sent, but only while the issuer and
 * client ID stay the same: a new configuration, or a new identity provider, needs one.
 */
export const isClientSecretRequired = (values: TenantOidcFormValues, config: TenantOidcConfiguration | null) =>
  !config || values.issuer.trim() !== config.issuer || values.clientId.trim() !== config.client_id;

export const makeTenantOidcFormSchema = (config: TenantOidcConfiguration | null) =>
  z
    .object({
      issuer: z.string().trim().pipe(z.url('Enter the issuer URL, such as https://login.example.com')),
      clientId: z.string().trim().min(1, 'Enter the client ID'),
      clientSecret: z.string(),
      scopes: z.string(),
      extraParams: z.string().refine((value) => parseExtraParams(value) !== null, 'Write one key=value per line'),
      emailClaim: z.string(),
      ssoEnabled: z.boolean(),
    })
    .superRefine((values, context) => {
      if (values.clientSecret.trim() || !isClientSecretRequired(values, config)) return;
      context.addIssue({
        code: 'custom',
        path: ['clientSecret'],
        message: config ? 'Enter the client secret again: the issuer or client ID changed' : 'Enter the client secret',
      });
    });

export const toPutTenantOidcConfigurationPayload = (
  tenantId: string,
  values: TenantOidcFormValues,
): PutTenantOidcConfigurationPayload => ({
  tenantId,
  issuer: values.issuer.trim(),
  client_id: values.clientId.trim(),
  client_secret: values.clientSecret.trim() ? values.clientSecret : undefined,
  scopes: parseScopes(values.scopes),
  extra_params: parseExtraParams(values.extraParams) ?? {},
  email_claim: values.emailClaim.trim(),
  sso_enabled: values.ssoEnabled,
});
