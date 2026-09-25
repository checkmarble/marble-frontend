import { env } from '@bo/env';
import { needAuth } from '@bo/middlewares/auth';
import {
  mergeTenantsPayloadSchema,
  renameTenantPayloadSchema,
  TENANT_MERGE_CONFLICT_ERROR,
  TENANT_NOT_FOUND_ERROR,
} from '@bo/schemas/tenant';
import { isRedirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { marblecoreApi } from 'marble-api';

const NOT_FOUND_STATUS = 404;
const CONFLICT_STATUS = 409;

const hasStatus = (error: unknown, status: number) =>
  error instanceof Error && (error as { status?: number }).status === status;

export const listTenantsFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .handler(async ({ context }) => {
    const { tenants } = await marblecoreApi.listTenants({
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });

    return tenants;
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
