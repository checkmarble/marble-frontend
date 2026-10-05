import { env } from '@bo/env';
import { needAuth } from '@bo/middlewares/auth';
import {
  createGlobalUserPayloadSchema,
  DUPLICATE_EMAIL_ERROR,
  GRANT_FORBIDDEN_ERROR,
  GRANT_NOT_FOUND_ERROR,
  organizationGrantTargetSchema,
  replaceOrganizationGrantPayloadSchema,
  updateGlobalUserPayloadSchema,
  userGrantsInputSchema,
} from '@bo/schemas/user';
import { isRedirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { marblecoreApi } from 'marble-api';
import type { UserDto } from 'marble-api/generated/marblecore-api';

const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const CONFLICT_STATUS = 409;

const hasStatus = (error: unknown, status: number) =>
  error instanceof Error && (error as { status?: number }).status === status;

const isConflictError = (error: unknown) => hasStatus(error, CONFLICT_STATUS);

const toGrantError = (error: unknown, fallback: string) => {
  if (isRedirect(error)) return error;
  if (hasStatus(error, NOT_FOUND_STATUS)) return new Error(GRANT_NOT_FOUND_ERROR);
  if (hasStatus(error, FORBIDDEN_STATUS)) return new Error(GRANT_FORBIDDEN_ERROR);
  return new Error(fallback);
};

export const getUsersFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .handler(async ({ context }) => {
    const { users } = await marblecoreApi.listUsers(
      { withGrants: true },
      {
        baseUrl: env.API_BASE_URL,
        fetch: context.authFetch,
      },
    );

    // Without `tenantAccess`, the endpoint returns plain users
    return users as UserDto[];
  });

export const createGlobalUserFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(createGlobalUserPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      const { user } = await marblecoreApi.createUser(data, {
        baseUrl: env.API_BASE_URL,
        fetch: context.authFetch,
      });

      return user;
    } catch (error) {
      if (isRedirect(error)) throw error;
      if (isConflictError(error)) throw new Error(DUPLICATE_EMAIL_ERROR);
      throw new Error('Failed to create user');
    }
  });

export const updateGlobalUserFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(updateGlobalUserPayloadSchema)
  .handler(async ({ context, data }) => {
    const { userId, ...userPayload } = data;

    try {
      const { user } = await marblecoreApi.updateUser(userId, userPayload, {
        baseUrl: env.API_BASE_URL,
        fetch: context.authFetch,
      });

      return user;
    } catch (error) {
      if (isRedirect(error)) throw error;
      if (isConflictError(error)) throw new Error(DUPLICATE_EMAIL_ERROR);
      throw new Error('Failed to update user');
    }
  });

export const getUserGrantsFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .validator(userGrantsInputSchema)
  .handler(async ({ context, data }) => {
    const { grants } = await marblecoreApi.listUserGrants(data.userId, {
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });

    return grants;
  });

export const replaceOrganizationGrantFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(replaceOrganizationGrantPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await marblecoreApi.replaceOrganizationGrant(
        data.tenantId,
        data.userId,
        { role: data.role },
        { organizationId: data.organizationId },
        {
          baseUrl: env.API_BASE_URL,
          fetch: context.authFetch,
        },
      );
    } catch (error) {
      throw toGrantError(error, 'Failed to save grant');
    }
  });

export const revokeOrganizationGrantFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(organizationGrantTargetSchema)
  .handler(async ({ context, data }) => {
    try {
      await marblecoreApi.revokeOrganizationGrant(
        data.tenantId,
        data.userId,
        { organizationId: data.organizationId },
        {
          baseUrl: env.API_BASE_URL,
          fetch: context.authFetch,
        },
      );
    } catch (error) {
      throw toGrantError(error, 'Failed to revoke grant');
    }
  });
