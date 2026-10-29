import { z } from 'zod/v4';

export const putTenantOidcConfigurationPayloadSchema = z.object({
  tenantId: z.uuid(),
  issuer: z.url(),
  client_id: z.string().trim().min(1),
  // Omitted to keep the stored secret.
  client_secret: z.string().min(1).optional(),
  scopes: z.array(z.string().min(1)),
  extra_params: z.record(z.string(), z.string()),
  email_claim: z.string(),
  sso_enabled: z.boolean(),
});
export type PutTenantOidcConfigurationPayload = z.infer<typeof putTenantOidcConfigurationPayloadSchema>;

export const tenantIdPayloadSchema = z.object({ tenantId: z.uuid() });

export const createTenantOidcDomainPayloadSchema = z.object({
  tenantId: z.uuid(),
  domain: z.string().trim().min(1),
});
export type CreateTenantOidcDomainPayload = z.infer<typeof createTenantOidcDomainPayloadSchema>;

export const deleteTenantOidcDomainPayloadSchema = z.object({
  tenantId: z.uuid(),
  domainId: z.uuid(),
});
export type DeleteTenantOidcDomainPayload = z.infer<typeof deleteTenantOidcDomainPayloadSchema>;

/**
 * Error code thrown by `putTenantOidcConfigurationFn` when the deployment license does not include
 * SSO, which the backend requires to save a configuration.
 */
export const TENANT_OIDC_LICENSE_REQUIRED_ERROR = 'tenant_oidc_license_required';

/**
 * Error code thrown by the tenant OIDC server functions when the backend answers 404: either the
 * tenant is gone or per-tenant OIDC is not enabled on this deployment.
 */
export const TENANT_OIDC_NOT_FOUND_ERROR = 'tenant_oidc_not_found';

/** Error code thrown by `createTenantOidcDomainFn` when another tenant already claims the domain. */
export const TENANT_OIDC_DOMAIN_CONFLICT_ERROR = 'tenant_oidc_domain_conflict';
