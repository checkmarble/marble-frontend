import { env } from '@bo/env';
import { authMiddleware, needAuth } from '@bo/middlewares/auth';
import { useAuthSession } from '@bo/utils/session';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { marblecoreApi } from 'marble-api';
import z from 'zod';

export const signinFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      idToken: z.string(),
    }),
  )
  .handler(async ({ data: { idToken } }) => {
    const authorization = `Bearer ${idToken}`;

    try {
      const marbleToken = await marblecoreApi.postToken({ authorization }, { baseUrl: env.API_BASE_URL });

      const authSession = await useAuthSession();
      await authSession.update({
        authToken: marbleToken,
      });

      throw redirect({ to: '/dashboard' });
    } catch {
      throw redirect({ to: '/sign-in' });
    }
  });

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const authSession = await useAuthSession();
  await authSession.clear();

  throw redirect({ to: '/sign-in' });
});

export const refreshTokenFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ idToken: z.string() }))
  .handler(async ({ data: { idToken } }) => {
    const authorization = `Bearer ${idToken}`;

    try {
      const marbleToken = await marblecoreApi.postToken({ authorization }, { baseUrl: env.API_BASE_URL });

      const authSession = await useAuthSession();
      await authSession.update({
        authToken: marbleToken,
      });
    } catch {
      const authSession = await useAuthSession();
      await authSession.clear();

      throw redirect({ to: '/sign-in' });
    }
  });

export const isAuthenticatedFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return !!context.authFetch;
  });

export const getCurrentUserFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .handler(async ({ context }) => {
    const credentialsDto = await marblecoreApi.getCredentials({ baseUrl: env.API_BASE_URL, fetch: context.authFetch });
    return credentialsDto.credentials;
  });
