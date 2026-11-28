import { isAuthenticated } from '@app-builder/server/auth';
import { useAuthSession } from '@app-builder/services/auth/auth-session.server';
import { setRequestOrgId, setRequestUserEmail } from '@app-builder/utils/logger.server';
import { redirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';

/**
 * Request middleware: attach it to server functions (`.middleware([authMiddleware])`) and to
 * resource routes (`server: { middleware: [authMiddleware] }`). Provides `context.api`,
 * `context.user`, `context.entitlements` and `context.tokenService`.
 */
export const authMiddleware = createMiddleware().server(async ({ next, request }) => {
  const auth = await isAuthenticated(request);
  // `href` rather than `to`: resource routes return this Response as is, without the router resolving it.
  if (!auth) throw redirect({ href: '/sign-in', statusCode: 302 });

  setRequestUserEmail(auth.user.actorIdentity.email);
  setRequestOrgId(auth.user.organizationId);

  const result = await next({ context: auth });

  const tokenUpdate = auth.tokenService.getUpdate();
  if (tokenUpdate.status) {
    const { marbleToken, refreshToken } = tokenUpdate;
    const authSession = await useAuthSession();
    await authSession.update({
      authToken: marbleToken ?? undefined,
      ...(refreshToken ? { refreshToken } : {}),
    });
  }

  return result;
});
