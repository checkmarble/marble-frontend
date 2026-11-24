import type { TenantOidcConfiguration } from '@bo/data/tenants';
import type { PutTenantOidcConfigurationPayload } from '@bo/schemas/tenant-oidc';
import { formatExtraParams, formatScopes, isClientSecretRequired, parseExtraParams, parseScopes } from '@marble/shared';
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
  scopes: config ? formatScopes(config.scopes) : '',
  extraParams: formatExtraParams(config?.extra_params ?? {}),
  emailClaim: config?.email_claim ?? '',
  ssoEnabled: config?.sso_enabled ?? true,
});

export const toSavedOidcClient = (config: TenantOidcConfiguration | null) =>
  config && { issuer: config.issuer, clientId: config.client_id };

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
      if (values.clientSecret.trim() || !isClientSecretRequired(toSavedOidcClient(config), values)) return;
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
