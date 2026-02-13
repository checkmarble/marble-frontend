import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyst } from '@app-builder/models';
import { isContinuousScreeningAvailable } from '@app-builder/services/feature-access';
import { getRoute } from '@app-builder/utils/routes';
import { Outlet } from '@remix-run/react';
import { redirect } from '@remix-run/server-runtime';

export const loader = createServerFn([authMiddleware], async ({ context }) => {
  const { user, entitlements } = context.authInfo;

  if (isAnalyst(user)) {
    throw redirect(getRoute('/cases'));
  }

  if (!isContinuousScreeningAvailable(entitlements)) {
    throw redirect(getRoute('/'));
  }

  return null;
});

export default function ContinuousScreeningLayout() {
  return <Outlet />;
}
