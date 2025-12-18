import { env } from '@bo/env';
import { needAuth } from '@bo/middlewares/auth';
import { patchOrganizationFeaturesPayloadSchema } from '@bo/schemas/features';
import { orgImportSpecSchema } from '@bo/schemas/org-import';
import { createUserPayloadSchema } from '@bo/schemas/user';
import { createServerFn } from '@tanstack/react-start';
import { backofficeApi, marblecoreApi } from 'marble-api';
import { z } from 'zod/v4';

export const getOrganizationsFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .handler(async ({ context }) => {
    const { organizations } = await marblecoreApi.listOrganizations({
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    return organizations;
  });

export const getOrganizationFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .inputValidator(
    z.object({
      orgId: z.uuid(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { organization } = await marblecoreApi.getOrganization(data.orgId, {
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });

    return organization;
  });

export const getOrganizationUsersFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .inputValidator(
    z.object({
      orgId: z.uuid(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { users } = await marblecoreApi.listOrganizationUsers(data.orgId, {
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });

    return users;
  });

export const getOrganizationFeaturesFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .inputValidator(
    z.object({
      orgId: z.uuid(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { feature_access } = await backofficeApi.getOrganizationFeatures(data.orgId, {
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });

    return feature_access;
  });

export const patchOrganizationFeaturesFnInputSchema = z.object({
  orgId: z.uuid(),
  features: patchOrganizationFeaturesPayloadSchema,
});

export const patchOrganizationFeaturesFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .inputValidator(patchOrganizationFeaturesFnInputSchema)
  .handler(async ({ context, data }) => {
    await backofficeApi.patchOrganizationFeatures(data.orgId, data.features, {
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });
  });

export const createOrganizationUserFnInputSchema = z.object({
  orgId: z.uuid(),
  userPayload: createUserPayloadSchema,
});

export const createOrganizationUserFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .inputValidator(createOrganizationUserFnInputSchema)
  .handler(async ({ context, data }) => {
    const payload = { ...data.userPayload, organization_id: data.orgId };
    await marblecoreApi.createUser(payload, {
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });
  });

export const createEmptyOrganizationFnInputSchema = z.object({
  name: z.string().min(1),
});

export const createEmptyOrganizationFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .inputValidator(createEmptyOrganizationFnInputSchema)
  .handler(async ({ context, data }) => {
    await marblecoreApi.createOrganization(data, {
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });
  });

export const importOrganizationFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .inputValidator(orgImportSpecSchema)
  .handler(async ({ context, data }) => {
    await backofficeApi.importOrganization(data, {
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });
  });
