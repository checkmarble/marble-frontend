import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isContinuousScreeningAvailable } from '@app-builder/services/feature-access';
import { getRoute } from '@app-builder/utils/routes';
import { Outlet } from '@remix-run/react';
import { redirect } from '@remix-run/server-runtime';

export const loader = createServerFn([authMiddleware], async ({ context }) => {
  const { user } = context.authInfo;

  if (!isContinuousScreeningAvailable(user)) {
    throw redirect(getRoute('/'));
  }

  return null;
});

export default function ContinuousScreeningLayout() {
  return <Outlet />;
}
