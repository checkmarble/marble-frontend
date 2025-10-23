import { createServerFn } from '@app-builder/core/requests';
import { oidcMiddleware } from '@app-builder/middlewares/oidc-middleware';
import { OIDCStrategy } from 'remix-auth-openid';

export interface Tokens extends OIDCStrategy.BaseUser {}

export const loader = createServerFn([oidcMiddleware], async function oidcAuthLoader({ context }) {
  if (context.oidcError) {
    throw context.oidcError;
  }

  return null;
});
