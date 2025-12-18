import { env } from '@bo/env';
import { needAuth } from '@bo/middlewares/auth';
import { OVERRIDABLE_FEATURES, patchOrganizationFeaturesPayloadSchema } from '@bo/schemas/features';
import { orgImportSpecSchema } from '@bo/schemas/org-import';
import { createUserPayloadSchema, DUPLICATE_EMAIL_ERROR } from '@bo/schemas/user';
import { isRedirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { backofficeApi, marblecoreApi } from 'marble-api';
import * as R from 'remeda';
import { z } from 'zod/v4';

export const getOrganizationsFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .handler(async ({ context }) => {
    const { organizations } = await marblecoreApi.listOrganizations({
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });

    return organizations;
  });

export const getOrganizationFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .validator(
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
  .validator(
    z.object({
      orgId: z.uuid(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { users } = await marblecoreApi.listOrganizationUsers(
      data.orgId,
      { withTfa: false },
      {
        baseUrl: env.API_BASE_URL,
        fetch: context.authFetch,
      },
    );

    return users;
  });

export const getOrganizationFeaturesFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .validator(
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

export const listOrganizationArchetypesFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .handler(async ({ context }) => {
    const { archetypes } = await marblecoreApi.listArchetypes({
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });

    return archetypes;
  });

export const patchOrganizationFeaturesFnInputSchema = z.object({
  orgId: z.uuid(),
  features: patchOrganizationFeaturesPayloadSchema,
});

export const patchOrganizationFeaturesFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(patchOrganizationFeaturesFnInputSchema)
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

const CONFLICT_STATUS = 409;

const isConflictError = (error: unknown) =>
  error instanceof Error && (error as { status?: number }).status === CONFLICT_STATUS;

export const createOrganizationUserFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(createOrganizationUserFnInputSchema)
  .handler(async ({ context, data }) => {
    const payload = { ...data.userPayload, organization_id: data.orgId };

    try {
      const { user } = await marblecoreApi.createUser(payload, {
        baseUrl: env.API_BASE_URL,
        fetch: context.authFetch,
      });

      return user;
    } catch (error) {
      // `authFetch` throws a router redirect on 401, from inside this try — never swallow it.
      if (isRedirect(error)) throw error;
      if (isConflictError(error)) throw new Error(DUPLICATE_EMAIL_ERROR);
      throw new Error('Failed to create user');
    }
  });

export const createEmptyOrganizationFnInputSchema = z.object({
  name: z.string().min(1),
});

export const createEmptyOrganizationFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(createEmptyOrganizationFnInputSchema)
  .handler(async ({ context, data }) => {
    const { organization } = await marblecoreApi.createOrganization(data, {
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });

    const allRestrictedFeatures = R.fromEntries(
      OVERRIDABLE_FEATURES.map((feature) => [feature, 'restricted'] as const),
    );
    await backofficeApi.patchOrganizationFeatures(organization.id, allRestrictedFeatures, {
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });

    return organization;
  });

export const importOrganizationFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(orgImportSpecSchema)
  .handler(async ({ context, data }) => {
    await backofficeApi.importOrganization(data, {
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });
  });

export const archetypeAdminSchema = z.object({
  email: z.email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export const applyOrganizationArchetypeFnInputSchema = z.object({
  name: z.string().min(1),
  org_name: z.string().min(1),
  admins: z.array(archetypeAdminSchema).min(1),
});

export const applyOrganizationArchetypeFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(applyOrganizationArchetypeFnInputSchema)
  .handler(async ({ context, data }) => {
    const { org_id } = await marblecoreApi.applyArchetype(
      {
        name: data.name,
        org_name: data.org_name,
        admins: data.admins.map((admin) => ({
          email: admin.email,
          first_name: admin.first_name || undefined,
          last_name: admin.last_name || undefined,
        })),
      },
      {},
      {
        baseUrl: env.API_BASE_URL,
        fetch: context.authFetch,
      },
    );

    const allRestrictedFeatures = R.fromEntries(
      OVERRIDABLE_FEATURES.map((feature) => [feature, 'restricted'] as const),
    );
    await backofficeApi.patchOrganizationFeatures(org_id, allRestrictedFeatures, {
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });

    return { orgId: org_id };
  });
