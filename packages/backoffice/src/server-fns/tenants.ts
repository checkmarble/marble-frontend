import { env } from '@bo/env';
import { needAuth } from '@bo/middlewares/auth';
import {
  mergeTenantsPayloadSchema,
  renameTenantPayloadSchema,
  TENANT_MERGE_CONFLICT_ERROR,
  TENANT_NOT_FOUND_ERROR,
} from '@bo/schemas/tenant';
import {
  createTenantOidcDomainPayloadSchema,
  deleteTenantOidcDomainPayloadSchema,
  putTenantOidcConfigurationPayloadSchema,
  TENANT_OIDC_DOMAIN_CONFLICT_ERROR,
  TENANT_OIDC_LICENSE_REQUIRED_ERROR,
  TENANT_OIDC_NOT_FOUND_ERROR,
  tenantIdPayloadSchema,
} from '@bo/schemas/tenant-oidc';
import { isRedirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { marblecoreApi } from 'marble-api';

const BAD_REQUEST_STATUS = 400;
const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const CONFLICT_STATUS = 409;

const hasStatus = (error: unknown, status: number) =>
  error instanceof Error && (error as { status?: number }).status === status;

// The backend explains a 400 in `{ message }`, e.g. a missing client secret: worth showing as is.
const badRequestMessage = (error: unknown) => {
  if (!hasStatus(error, BAD_REQUEST_STATUS)) return null;
  const message = (error as { data?: { message?: unknown } }).data?.message;
  return typeof message === 'string' && message ? message : null;
};

const rethrowTenantOidcError = (error: unknown, fallback: string): never => {
  if (isRedirect(error)) throw error;
  if (hasStatus(error, NOT_FOUND_STATUS)) throw new Error(TENANT_OIDC_NOT_FOUND_ERROR);
  throw new Error(badRequestMessage(error) ?? fallback);
};

export const listTenantsFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .handler(async ({ context }) => {
    return marblecoreApi.listTenants({
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });
  });

export const renameTenantFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(renameTenantPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await marblecoreApi.updateTenant(
        data.tenantId,
        { name: data.name },
        {
          baseUrl: env.API_BASE_URL,
          fetch: context.authFetch,
        },
      );
    } catch (error) {
      if (isRedirect(error)) throw error;
      if (hasStatus(error, NOT_FOUND_STATUS)) throw new Error(TENANT_NOT_FOUND_ERROR);
      throw new Error('Failed to rename tenant');
    }
  });

export const mergeTenantsFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(mergeTenantsPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await marblecoreApi.mergeTenants(
        data.targetTenantId,
        { source_tenant_ids: data.sourceTenantIds, name: data.name },
        {
          baseUrl: env.API_BASE_URL,
          fetch: context.authFetch,
        },
      );
    } catch (error) {
      if (isRedirect(error)) throw error;
      if (hasStatus(error, CONFLICT_STATUS)) throw new Error(TENANT_MERGE_CONFLICT_ERROR);
      if (hasStatus(error, NOT_FOUND_STATUS)) throw new Error(TENANT_NOT_FOUND_ERROR);
      throw new Error('Failed to merge tenants');
    }
  });

export const putTenantOidcConfigurationFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(putTenantOidcConfigurationPayloadSchema)
  .handler(async ({ context, data: { tenantId, ...body } }) => {
    try {
      await marblecoreApi.putTenantOidcConfiguration(tenantId, body, {
        baseUrl: env.API_BASE_URL,
        fetch: context.authFetch,
      });
    } catch (error) {
      if (hasStatus(error, FORBIDDEN_STATUS)) throw new Error(TENANT_OIDC_LICENSE_REQUIRED_ERROR);
      rethrowTenantOidcError(error, 'Failed to save the OIDC configuration');
    }
  });

export const deleteTenantOidcConfigurationFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(tenantIdPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await marblecoreApi.deleteTenantOidcConfiguration(data.tenantId, {
        baseUrl: env.API_BASE_URL,
        fetch: context.authFetch,
      });
    } catch (error) {
      rethrowTenantOidcError(error, 'Failed to delete the OIDC configuration');
    }
  });

export const listTenantOidcDomainsFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .validator(tenantIdPayloadSchema)
  .handler(async ({ context, data }) => {
    return marblecoreApi.listTenantOidcDomains(data.tenantId, {
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });
  });

export const createTenantOidcDomainFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(createTenantOidcDomainPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      return await marblecoreApi.createTenantOidcDomain(
        data.tenantId,
        { domain: data.domain },
        {
          baseUrl: env.API_BASE_URL,
          fetch: context.authFetch,
        },
      );
    } catch (error) {
      if (hasStatus(error, CONFLICT_STATUS)) throw new Error(TENANT_OIDC_DOMAIN_CONFLICT_ERROR);
      return rethrowTenantOidcError(error, 'Failed to add the domain');
    }
  });

export const deleteTenantOidcDomainFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(deleteTenantOidcDomainPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await marblecoreApi.deleteTenantOidcDomain(data.tenantId, data.domainId, {
        baseUrl: env.API_BASE_URL,
        fetch: context.authFetch,
      });
    } catch (error) {
      rethrowTenantOidcError(error, 'Failed to remove the domain');
    }
  });
