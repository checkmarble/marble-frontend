import { createMarbleApi } from '@app-builder/infra/marblecore-api';
import { appConfigMiddleware } from '@app-builder/middlewares/app-config-middleware';
import { isStatusConflictHttpError } from '@app-builder/models';
import { createInitialOrgPayloadSchema, MIN_PASSWORD_LENGTH } from '@app-builder/schemas/onboarding';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

export type CreateInitialOrgError = 'already_initialized';

export const createInitialOrgFn = createServerFn({ method: 'POST' })
  .middleware([appConfigMiddleware])
  .validator(createInitialOrgPayloadSchema)
  .handler(async ({ context, data }): Promise<{ error: CreateInitialOrgError | null }> => {
    const { organization, email, firstName, lastName, password } = data;

    // OIDC instances delegate credentials to the identity provider, so the
    // password is dropped there and mandatory everywhere else.
    const requiresPassword = context.appConfig?.auth.providers.includes('firebase') ?? true;

    if (requiresPassword && (!password || password.length < MIN_PASSWORD_LENGTH)) {
      throw new Error(`A password of at least ${MIN_PASSWORD_LENGTH} characters is required`);
    }

    try {
      await createMarbleApi(getRequest()).createInitialOrg({
        organization,
        email,
        firstname: firstName,
        lastname: lastName,
        password: requiresPassword ? password : undefined,
      });
      return { error: null };
    } catch (error) {
      // The instance was initialized in the meantime (or by someone else).
      if (isStatusConflictHttpError(error)) {
        return { error: 'already_initialized' };
      }
      throw error;
    }
  });
