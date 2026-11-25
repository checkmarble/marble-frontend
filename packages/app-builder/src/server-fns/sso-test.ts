import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import {
  type FinishSsoTestResult,
  finishSsoTest,
  readSsoTestCookie,
  type StartSsoTestResult,
  setSsoTestCookie,
  ssoCallbackUrl,
  startSsoTest,
} from '@app-builder/services/auth/sso-test.server';
import { isSsoSettingsAvailable } from '@app-builder/services/feature-access';
import { getServerEnv } from '@app-builder/utils/environment';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import * as z from 'zod/v4';

export const startSsoTestSignInFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      issuer: z.string().trim(),
      clientId: z.string().trim(),
      scopes: z.array(z.string()),
      extraParams: z.record(z.string(), z.string()),
    }),
  )
  .handler(async ({ context, data }): Promise<StartSsoTestResult> => {
    if (!isSsoSettingsAvailable(context.authInfo.user, context.appConfig)) {
      throw redirect({ to: '/' });
    }
    const { result, cookie } = await startSsoTest(data, {
      redirectUri: ssoCallbackUrl(context.appConfig),
      // The backend accepts http identity providers only when it runs in development.
      allowHttp: getServerEnv('ENV') === 'development',
    });
    if (cookie) setSsoTestCookie(getRequest(), cookie);
    return result;
  });

export const finishSsoTestSignInFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      clientSecret: z.string(),
      emailClaim: z.string().trim(),
    }),
  )
  .handler(async ({ context, data }): Promise<FinishSsoTestResult> => {
    if (!isSsoSettingsAvailable(context.authInfo.user, context.appConfig)) {
      throw redirect({ to: '/' });
    }
    const request = getRequest();
    const result = await finishSsoTest(await readSsoTestCookie(request), data);
    if (result.status !== 'pending') setSsoTestCookie(request, null);
    return result;
  });
