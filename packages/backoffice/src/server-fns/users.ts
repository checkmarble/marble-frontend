import { env } from '@bo/env';
import { needAuth } from '@bo/middlewares/auth';
import { createGlobalUserPayloadSchema, DUPLICATE_EMAIL_ERROR, updateGlobalUserPayloadSchema } from '@bo/schemas/user';
import { isRedirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { marblecoreApi } from 'marble-api';

const CONFLICT_STATUS = 409;

const isConflictError = (error: unknown) =>
  error instanceof Error && (error as { status?: number }).status === CONFLICT_STATUS;

export const getUsersFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .handler(async ({ context }) => {
    const { users } = await marblecoreApi.listUsers({
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });

    return users;
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
