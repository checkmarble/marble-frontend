import { servicesMiddleware } from '@app-builder/middlewares/services-middleware';
import { isStatusConflictHttpError } from '@app-builder/models';
import { createInitialOrgPayloadSchema, MIN_PASSWORD_LENGTH } from '@app-builder/schemas/onboarding';
import { createServerFn } from '@tanstack/react-start';

export type CreateInitialOrgError = 'already_initialized';

export const createInitialOrgFn = createServerFn({ method: 'POST' })
  .middleware([servicesMiddleware])
  .validator(createInitialOrgPayloadSchema)
  .handler(async ({ context, data }): Promise<{ error: CreateInitialOrgError | null }> => {
    const { password, ...rest } = data;

    // OIDC instances delegate credentials to the identity provider, so the
    // password is dropped there and mandatory everywhere else.
    const requiresPassword = context.appConfig?.auth.provider !== 'oidc';

    if (requiresPassword && (!password || password.length < MIN_PASSWORD_LENGTH)) {
      throw new Error(`A password of at least ${MIN_PASSWORD_LENGTH} characters is required`);
    }

    try {
      await context.services.onboardingRepository.createInitialOrg(requiresPassword ? { ...rest, password } : rest);
      return { error: null };
    } catch (error) {
      // The instance was initialized in the meantime (or by someone else).
      if (isStatusConflictHttpError(error)) {
        return { error: 'already_initialized' };
      }
      throw error;
    }
  });
